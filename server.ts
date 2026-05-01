import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "edu-flow-super-secret-key";
const DATA_DIR = path.join(process.cwd(), "data");

// Helper to ensure data directory and files exist
async function initDb() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const collections = ["users", "students", "teachers", "attendance", "fees", "exams", "results", "announcements"];
    for (const col of collections) {
      const filePath = path.join(DATA_DIR, `${col}.json`);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify([]));
      }
    }
    
    // Create initial admin if none exists
    const users = JSON.parse(await fs.readFile(path.join(DATA_DIR, "users.json"), "utf8"));
    const students = JSON.parse(await fs.readFile(path.join(DATA_DIR, "students.json"), "utf8"));

    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = {
        id: uuidv4(),
        name: "System Admin",
        email: "admin@eduflow.com",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date().toISOString()
      };
      users.push(admin);
      await fs.writeFile(path.join(DATA_DIR, "users.json"), JSON.stringify(users, null, 2));
    }

    // Ensure demo student exists
    if (!users.find((u: any) => u.email === "student@eduflow.com")) {
      const studentId = uuidv4();
      const studentPassword = await bcrypt.hash("student123", 10);
      const studentUser = {
        id: studentId,
        name: "Demo Student",
        email: "student@eduflow.com",
        password: studentPassword,
        role: "student",
        createdAt: new Date().toISOString()
      };
      users.push(studentUser);

      const studentProfile = {
        id: studentId,
        name: "Demo Student",
        email: "student@eduflow.com",
        role: "student",
        class: "10th",
        section: "A",
        feeStatus: "pending",
        rollNumber: "S-1001"
      };
      students.push(studentProfile);

      await fs.writeFile(path.join(DATA_DIR, "users.json"), JSON.stringify(users, null, 2));
      await fs.writeFile(path.join(DATA_DIR, "students.json"), JSON.stringify(students, null, 2));
      console.log("Demo student created: student@eduflow.com / student123");
    }
  } catch (err) {
    console.error("DB Init Error:", err);
  }
}

async function readCol(name: string) {
  const data = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
  return JSON.parse(data);
}

async function writeCol(name: string, data: any) {
  await fs.writeFile(path.join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2));
}

async function startServer() {
  await initDb();
  
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, className, section } = req.body;
      const users = await readCol("users");
      const students = await readCol("students");

      if (users.find((u: any) => u.email === email)) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const userId = uuidv4();
      const newUser = {
        id: userId,
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: "student",
        createdAt: new Date().toISOString()
      };

      const newStudent = {
        id: userId,
        name,
        email,
        role: "student",
        class: className || "Unassigned",
        section: section || "N/A",
        feeStatus: "pending",
        rollNumber: `S-${Math.floor(1000 + Math.random() * 9000)}`
      };

      users.push(newUser);
      students.push(newStudent);

      await writeCol("users", users);
      await writeCol("students", students);

      const token = jwt.sign({ id: userId, name: name, role: "student" }, JWT_SECRET);
      res.status(201).json({ token, user: newStudent });
    } catch (err) {
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const users = await readCol("users");
    const user = users.find((u: any) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const users = await readCol("users");
    const user = users.find((u: any) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Admin: User Management
  app.get("/api/users", authenticate, authorize(["admin"]), async (req, res) => {
    const users = await readCol("users");
    res.json(users.map(({ password: _, ...u }: any) => u));
  });

  // Student Routes
  app.get("/api/students", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const students = await readCol("students");
    res.json(students);
  });

  app.post("/api/students", authenticate, authorize(["admin"]), async (req, res) => {
    console.log("Creating student:", req.body);
    try {
      const students = await readCol("students");
      const users = await readCol("users");
      
      if (users.find((u: any) => u.email === req.body.email)) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Create actual user first
      const studentId = uuidv4();
      const studentUser = {
        id: studentId,
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password || "student123", 10),
        role: "student",
        createdAt: new Date().toISOString()
      };
      
      const newStudent = {
        ...req.body,
        id: studentId,
        role: "student",
        feeStatus: "pending"
      };
      // Remove password from student profile
      delete newStudent.password;
      
      users.push(studentUser);
      students.push(newStudent);
      
      await writeCol("users", users);
      await writeCol("students", students);
      console.log("Student created successfully:", studentId);
      res.status(201).json(newStudent);
    } catch (err: any) {
      console.error("Student creation error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Teacher Routes
  app.get("/api/teachers", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const teachers = await readCol("teachers");
    res.json(teachers);
  });

  app.post("/api/teachers", authenticate, authorize(["admin"]), async (req, res) => {
    console.log("Creating teacher:", req.body);
    try {
      const teachers = await readCol("teachers");
      const users = await readCol("users");
      
      if (users.find((u: any) => u.email === req.body.email)) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const teacherId = uuidv4();
      const teacherUser = {
        id: teacherId,
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password || "teacher123", 10),
        role: "teacher",
        createdAt: new Date().toISOString()
      };
      
      const newTeacher = {
        ...req.body,
        id: teacherId,
        role: "teacher",
      };
      delete newTeacher.password;
      
      users.push(teacherUser);
      teachers.push(newTeacher);
      
      await writeCol("users", users);
      await writeCol("teachers", teachers);
      console.log("Teacher created successfully:", teacherId);
      res.status(201).json(newTeacher);
    } catch (err: any) {
      console.error("Teacher creation error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Attendance
  app.get("/api/attendance", authenticate, async (req: any, res) => {
    const attendance = await readCol("attendance");
    if (req.user.role === "student") {
      return res.json(attendance.filter((a: any) => a.studentId === req.user.id));
    }
    res.json(attendance);
  });

  app.get("/api/attendance/:class", authenticate, async (req, res) => {
    const attendance = await readCol("attendance");
    // In a real app we'd join with students, for now just filter by student class if provided
    res.json(attendance);
  });

  app.post("/api/attendance", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const attendance = await readCol("attendance");
    const newRecords = req.body.map((rec: any) => ({
      ...rec,
      id: uuidv4(),
      date: new Date().toISOString()
    }));
    attendance.push(...newRecords);
    await writeCol("attendance", attendance);
    res.json(newRecords);
  });

  // Announcements
  app.get("/api/announcements", authenticate, async (req: any, res) => {
    const ann = await readCol("announcements");
    res.json(ann.filter((a: any) => a.targetRoles.includes(req.user.role)));
  });

  app.post("/api/announcements", authenticate, authorize(["admin"]), async (req, res) => {
    const ann = await readCol("announcements");
    const newAnn = { ...req.body, id: uuidv4(), date: new Date().toISOString() };
    ann.push(newAnn);
    await writeCol("announcements", ann);
    res.json(newAnn);
  });

  // Stats for Admin Dashboard
  app.get("/api/stats", authenticate, authorize(["admin"]), async (req, res) => {
    const students = await readCol("students");
    const teachers = await readCol("teachers");
    const fees = await readCol("fees");
    
    const totalFees = fees.filter((f: any) => f.status === "paid").reduce((acc: number, f: any) => acc + f.amount, 0);
    const pendingFees = fees.filter((f: any) => f.status === "pending").reduce((acc: number, f: any) => acc + f.amount, 0);

    res.json({
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalIncome: totalFees,
      pendingFees: pendingFees,
      attendanceRate: 85, // Mock rate for now
    });
  });

  // Leave Applications
  app.get("/api/applications", authenticate, async (req: any, res) => {
    const apps = await readCol("applications");
    if (req.user.role === "student") {
      return res.json(apps.filter((a: any) => a.studentId === req.user.id));
    }
    res.json(apps);
  });

  app.post("/api/applications", authenticate, authorize(["student"]), async (req: any, res) => {
    const apps = await readCol("applications");
    const newApp = {
      id: uuidv4(),
      studentId: req.user.id,
      studentName: req.user.name,
      reason: req.body.reason,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    apps.push(newApp);
    await writeCol("applications", apps);
    res.status(201).json(newApp);
  });

  app.patch("/api/applications/:id", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const apps = await readCol("applications");
    const index = apps.findIndex((a: any) => a.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    
    apps[index].status = req.body.status;
    await writeCol("applications", apps);
    res.json(apps[index]);
  });

  // Exams & Results
  app.get("/api/exams", authenticate, async (req, res) => {
    res.json([
      { id: '1', title: 'Mid-Term Exams 2026', startDate: '2026-05-15', status: 'upcoming' },
      { id: '2', title: 'Final Finals 2025', startDate: '2025-12-10', status: 'completed' },
    ]);
  });

  // Schedule
  app.get("/api/schedule", authenticate, async (req, res) => {
    res.json([
      { id: '1', time: '08:00 AM', subject: 'Mathematics', teacher: 'Mr. Khan', room: 'Room 202' },
      { id: '2', time: '09:00 AM', subject: 'English', teacher: 'Ms. Sarah', room: 'Room 101' },
      { id: '3', time: '10:30 AM', subject: 'Physics', teacher: 'Dr. Ahmad', room: 'Lab A' },
      { id: '4', time: '11:30 AM', subject: 'Chemistry', teacher: 'Ms. Fatima', room: 'Lab B' },
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
