import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "edu-flow-super-secret-key";

// Database Connection Logic
let mysqlPool: mysql.Pool | null = null;
const sqliteDb = new Database(path.join(__dirname, "school.db"));
sqliteDb.pragma('journal_mode = WAL');
sqliteDb.pragma('foreign_keys = ON');

async function initPool() {
  if (process.env.MYSQL_HOST) {
    try {
      mysqlPool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 5000
      });
      // Test connection
      await mysqlPool.query('SELECT 1');
      console.log("Successfully connected to MySQL database.");
    } catch (err) {
      console.error("MySQL Connection failed, falling back to SQLite:", (err as Error).message);
      mysqlPool = null;
    }
  }
}

async function query(sql: string, params?: any[]) {
  if (mysqlPool) {
    try {
      const [rows]: any = await mysqlPool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error("MySQL Query Error:", err);
      throw err;
    }
  } else {
    const stmt = sqliteDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      return stmt.all(params || []);
    } else {
      return stmt.run(params || []);
    }
  }
}

// Helper to ensure database tables exist
async function initDb() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      role VARCHAR(50),
      class VARCHAR(50),
      section VARCHAR(50),
      feeStatus VARCHAR(50),
      rollNumber VARCHAR(50),
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS teachers (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      role VARCHAR(50),
      subject VARCHAR(100),
      qualification VARCHAR(255),
      joinDate DATE,
      salary DECIMAL(10, 2),
      status VARCHAR(50),
      FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36),
      date DATE,
      status VARCHAR(50),
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS fees (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36),
      title VARCHAR(255),
      amount DECIMAL(10, 2),
      date DATE,
      status VARCHAR(50),
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS exams (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255),
      subject VARCHAR(100),
      class VARCHAR(50),
      date DATE,
      status VARCHAR(50) DEFAULT 'pending'
    )`,
    `CREATE TABLE IF NOT EXISTS results (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36),
      examId VARCHAR(36),
      subject VARCHAR(100),
      marks INT,
      totalMarks INT,
      grade VARCHAR(10),
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255),
      content TEXT,
      targetRoles TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36),
      type VARCHAR(50),
      reason TEXT,
      status VARCHAR(50),
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS schedule (
      id VARCHAR(36) PRIMARY KEY,
      class VARCHAR(50),
      day VARCHAR(20),
      time VARCHAR(50),
      subject VARCHAR(100),
      teacher VARCHAR(255)
    )`,
    `CREATE TABLE IF NOT EXISTS books (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255),
      author VARCHAR(255),
      isbn VARCHAR(50),
      status VARCHAR(20) DEFAULT 'available',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS transport (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255),
      base VARCHAR(255),
      driverPhone VARCHAR(50)
    )`,
    `CREATE TABLE IF NOT EXISTS dormitory (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255),
      capacity INT,
      occupied INT DEFAULT 0
    )`,
    mysqlPool 
      ? `CREATE TABLE IF NOT EXISTS exam_results (
          id INT AUTO_INCREMENT PRIMARY KEY,
          examId VARCHAR(36),
          data TEXT,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE
        )`
      : `CREATE TABLE IF NOT EXISTS exam_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          examId VARCHAR(36),
          data TEXT,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE
        )`,
    `CREATE TABLE IF NOT EXISTS materials (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255),
      class VARCHAR(50),
      type VARCHAR(20),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    try {
      await query(sql);
    } catch (err) {
      console.error(`Error creating table:`, err);
    }
  }
  
  // Create initial admin if none exists
  const users: any = await query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
  if (users.length === 0) {
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await query(
      "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [adminId, "System Admin", "admin@school.com", hashedPassword, "admin"]
    );
    console.log("Admin account created: admin@school.com / admin123");
  }
}

async function startServer() {
  await initPool();
  await initDb();
  
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Database Connection Info (Diagnostic)
  app.get("/api/db-config", (req, res) => {
    res.json({
      database: mysqlPool ? "MySQL" : "SQLite (Fallback)",
      host: process.env.MYSQL_HOST || "none",
      online: !!mysqlPool
    });
  });

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
      const existing: any = await query("SELECT * FROM users WHERE email = ?", [email]);

      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const userId = uuidv4();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await query(
        "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [userId, name, email, hashedPassword, "student"]
      );

      const rollNumber = `S-${Math.floor(1000 + Math.random() * 9000)}`;
      await query(
        "INSERT INTO students (id, name, email, role, class, section, feeStatus, rollNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, name, email, "student", className || "Unassigned", section || "N/A", "pending", rollNumber]
      );

      const token = jwt.sign({ id: userId, name: name, role: "student" }, JWT_SECRET);
      res.status(201).json({ token, user: { id: userId, name, email, role: "student", class: className, section } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const users: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      const user = users[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const users: any = await query("SELECT * FROM users WHERE id = ?", [req.user.id]);
    const user = users[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Admin: User Management
  app.get("/api/users", authenticate, authorize(["admin"]), async (req, res) => {
    const users: any = await query("SELECT id, name, email, role, createdAt FROM users");
    res.json(users);
  });

  // Student Routes
  app.get("/api/students", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const students = await query("SELECT * FROM students");
    res.json(students);
  });

  app.post("/api/students", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { name, email, class: cls, section, feeStatus, rollNumber, password: rawPassword } = req.body;
      const existing: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const studentId = uuidv4();
      const password = rawPassword && rawPassword.trim() !== "" ? rawPassword : "student123";
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await query(
        "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [studentId, name, email, hashedPassword, "student"]
      );

      await query(
        "INSERT INTO students (id, name, email, role, class, section, feeStatus, rollNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [studentId, name, email, "student", cls || "Unassigned", section || "N/A", feeStatus || "pending", rollNumber || `S-${Math.floor(1000 + Math.random() * 9000)}`]
      );

      res.status(201).json({ id: studentId, name, email, role: "student" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Creation failed" });
    }
  });
  // Teacher Routes
  app.get("/api/teachers", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const teachers = await query("SELECT * FROM teachers");
    res.json(teachers);
  });

  app.post("/api/teachers", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { name, email, subject, qualification, joinDate, salary, status, password: rawPassword } = req.body;
      const existing: any = await query("SELECT * FROM users WHERE email = ?", [email]);
      
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const teacherId = uuidv4();
      const password = rawPassword && rawPassword.trim() !== "" ? rawPassword : "teacher123";
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await query(
        "INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [teacherId, name, email, hashedPassword, "teacher"]
      );

      await query(
        "INSERT INTO teachers (id, name, email, role, subject, qualification, joinDate, salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [teacherId, name, email, "teacher", subject, qualification, joinDate || new Date().toISOString().split('T')[0], salary || 0, status || 'active']
      );

      res.status(201).json({ id: teacherId, name, email, role: "teacher" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Teacher creation failed" });
    }
  });

  // Attendance
  app.get("/api/attendance", authenticate, async (req: any, res) => {
    try {
      if (req.user.role === "student") {
        const attendance = await query("SELECT * FROM attendance WHERE studentId = ?", [req.user.id]);
        return res.json(attendance);
      }
      const attendance = await query("SELECT * FROM attendance");
      res.json(attendance);
    } catch (err) {
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  app.post("/api/attendance", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const records = req.body; // Array of { studentId, status }
      
      for (const rec of records) {
        const existing: any = await query("SELECT * FROM attendance WHERE studentId = ? AND date = ?", [rec.studentId, today]);
        if (existing.length === 0) {
          await query(
            "INSERT INTO attendance (id, studentId, date, status) VALUES (?, ?, ?, ?)",
            [uuidv4(), rec.studentId, today, rec.status]
          );
        } else {
          await query("UPDATE attendance SET status = ? WHERE id = ?", [rec.status, existing[0].id]);
        }
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Update failed" });
    }
  });

  // Announcements
  app.get("/api/announcements", authenticate, async (req: any, res) => {
    try {
      const ann: any = await query("SELECT * FROM announcements");
      const filtered = ann.filter((a: any) => {
        let roles = [];
        try {
          roles = typeof a.targetRoles === 'string' ? JSON.parse(a.targetRoles) : a.targetRoles;
          if (!Array.isArray(roles)) roles = [];
        } catch (e) {
          roles = [];
        }
        return roles.includes(req.user.role) || req.user.role === 'admin';
      });
      res.json(filtered);
    } catch (err) {
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  app.post("/api/announcements", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { title, content, targetRoles } = req.body;
      const id = uuidv4();
      await query(
        "INSERT INTO announcements (id, title, content, targetRoles) VALUES (?, ?, ?, ?)",
        [id, title, content, JSON.stringify(targetRoles)]
      );
      res.status(201).json({ id, title, content, targetRoles });
    } catch (err) {
      res.status(500).json({ error: "Creation failed" });
    }
  });

  app.delete("/api/announcements/:id", authenticate, authorize(["admin"]), async (req, res) => {
    await query("DELETE FROM announcements WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted successfully" });
  });

  // Library Management
  app.get("/api/library", authenticate, async (req, res) => {
    const books = await query("SELECT * FROM books");
    res.json(books);
  });
  app.post("/api/library", authenticate, authorize(["admin"]), async (req, res) => {
    const id = uuidv4();
    const { title, author, isbn } = req.body;
    await query("INSERT INTO books (id, title, author, isbn, status) VALUES (?, ?, ?, ?, ?)", [id, title, author, isbn, 'available']);
    res.json({ id, title, author, isbn, status: 'available' });
  });
  app.put("/api/library/:id", authenticate, authorize(["admin"]), async (req, res) => {
    const { title, author, isbn, status } = req.body;
    await query("UPDATE books SET title = ?, author = ?, isbn = ?, status = ? WHERE id = ?", [title, author, isbn, status, req.params.id]);
    res.json({ success: true });
  });
  app.delete("/api/library/:id", authenticate, authorize(["admin"]), async (req, res) => {
    await query("DELETE FROM books WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // Transport Management
  // Transport Routes
  app.get("/api/transport", authenticate, async (req, res) => {
    const transport = await query("SELECT * FROM transport");
    res.json(transport);
  });
  app.post("/api/transport", authenticate, authorize(["admin"]), async (req, res) => {
    const id = uuidv4();
    const { name, base, driverPhone } = req.body;
    await query("INSERT INTO transport (id, name, base, driverPhone) VALUES (?, ?, ?, ?)", [id, name, base, driverPhone]);
    res.json({ id, ...req.body });
  });
  app.delete("/api/transport/:id", authenticate, authorize(["admin"]), async (req, res) => {
    await query("DELETE FROM transport WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // Dormitory Management
  app.get("/api/dormitory", authenticate, async (req, res) => {
    const dorms = await query("SELECT * FROM dormitory");
    res.json(dorms);
  });
  app.post("/api/dormitory", authenticate, authorize(["admin"]), async (req, res) => {
    const id = uuidv4();
    const { name, capacity, occupied } = req.body;
    await query("INSERT INTO dormitory (id, name, capacity, occupied) VALUES (?, ?, ?, ?)", [id, name, capacity, occupied || 0]);
    res.json({ id, ...req.body });
  });
  app.delete("/api/dormitory/:id", authenticate, authorize(["admin"]), async (req, res) => {
    await query("DELETE FROM dormitory WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // Exams & Results
  app.get("/api/exams", authenticate, async (req, res) => {
    const exams = await query("SELECT * FROM exams");
    res.json(exams);
  });
  app.post("/api/exams", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const id = uuidv4();
    const { title, subject, class: cls, date } = req.body;
    await query("INSERT INTO exams (id, title, subject, class, date, status) VALUES (?, ?, ?, ?, ?, ?)", [id, title, subject, cls, date, 'pending']);
    res.json({ id, title, subject, class: cls, date, status: 'pending' });
  });
  app.delete("/api/exams/:id", authenticate, authorize(["admin"]), async (req, res) => {
    await query("DELETE FROM exams WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  app.post("/api/exams/:id/results", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const results = req.body; // Array of { studentId, marks, grade }
    await query("INSERT INTO exam_results (examId, data) VALUES (?, ?)", [req.params.id, JSON.stringify(results)]);
    res.json({ success: true });
  });

  app.get("/api/exams/results", authenticate, async (req:any, res) => {
    try {
      const results: any = await query("SELECT * FROM exam_results");
      if (req.user.role === 'student') {
        const myResults = results.map((r: any) => ({
          ...r,
          record: JSON.parse(JSON.stringify(r.data)).find((d: any) => d.studentId === req.user.id)
        })).filter((r: any) => r.record);
        return res.json(myResults);
      }
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  // Study Material
  app.get("/api/materials", authenticate, async (req:any, res) => {
    if (req.user.role === 'student') {
      const student: any = await query("SELECT class FROM students WHERE id = ?", [req.user.id]);
      if (student.length === 0) return res.json([]);
      const materials = await query("SELECT * FROM materials WHERE class = ?", [student[0].class]);
      return res.json(materials);
    }
    const materials = await query("SELECT * FROM materials");
    res.json(materials);
  });
  app.post("/api/materials", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    const id = uuidv4();
    const { title, class: cls, type } = req.body;
    await query("INSERT INTO materials (id, title, class, type) VALUES (?, ?, ?, ?)", [id, title, cls, type]);
    res.json({ id, ...req.body });
  });
  app.delete("/api/materials/:id", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    await query("DELETE FROM materials WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // Stats for Admin Dashboard
  app.get("/api/stats", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const studentCount: any = await query("SELECT COUNT(*) as count FROM students");
      const teacherCount: any = await query("SELECT COUNT(*) as count FROM teachers");
      const paidFees: any = await query("SELECT SUM(amount) as total FROM fees WHERE status = 'paid'");
      const pendingFees: any = await query("SELECT SUM(amount) as total FROM fees WHERE status = 'pending'");

      res.json({
        totalStudents: studentCount[0].count,
        totalTeachers: teacherCount[0].count,
        totalIncome: paidFees[0].total || 0,
        pendingFees: pendingFees[0].total || 0,
        attendanceRate: 85,
      });
    } catch (err) {
      res.status(500).json({ error: "Stats failed" });
    }
  });

  // Leave Applications
  app.get("/api/applications", authenticate, async (req: any, res) => {
    if (req.user.role === "student") {
      const apps = await query("SELECT * FROM applications WHERE studentId = ?", [req.user.id]);
      return res.json(apps);
    }
    const apps = await query("SELECT * FROM applications");
    res.json(apps);
  });

  app.post("/api/applications", authenticate, authorize(["student"]), async (req: any, res) => {
    const id = uuidv4();
    const { reason, startDate, endDate } = req.body;
    await query(
      "INSERT INTO applications (id, studentId, type, reason, status) VALUES (?, ?, ?, ?, ?)",
      [id, req.user.id, "Leave", reason, "pending"]
    );
    res.status(201).json({ id, reason, status: "pending" });
  });

  app.patch("/api/applications/:id", authenticate, authorize(["admin", "teacher"]), async (req, res) => {
    await query("UPDATE applications SET status = ? WHERE id = ?", [req.body.status, req.params.id]);
    res.json({ success: true });
  });

  // Exams & Results
  app.get("/api/exams", authenticate, async (req, res) => {
    res.json([
      { id: '1', title: 'Mid-Term Exams 2026', startDate: '2026-05-15', status: 'upcoming' },
      { id: '2', title: 'Final Finals 2025', startDate: '2025-12-10', status: 'completed' },
    ]);
  });

  // Schedule
  app.get("/api/schedule", authenticate, async (req: any, res) => {
    if (req.user.role === "student") {
      const student: any = await query("SELECT class FROM students WHERE id = ?", [req.user.id]);
      if (student.length === 0) return res.json([]);
      const schedule = await query("SELECT * FROM schedule WHERE class = ?", [student[0].class]);
      return res.json(schedule);
    }
    const schedule = await query("SELECT * FROM schedule");
    res.json(schedule);
  });

  // Helper to generate monthly fees
  const generateMonthlyFees = async () => {
    try {
      const today = new Date();
      if (today.getDate() < 25) return;

      const month = today.toLocaleString('default', { month: 'long' });
      const year = today.getFullYear();
      const title = `Monthly Tuition Fee - ${month} ${year}`;
      
      const students: any = await query("SELECT id FROM students");
      for (const student of students) {
        const exists: any = await query("SELECT id FROM fees WHERE studentId = ? AND title = ?", [student.id, title]);
        if (exists.length === 0) {
          await query(
            "INSERT INTO fees (id, studentId, title, amount, date, status) VALUES (?, ?, ?, ?, ?, ?)",
            [uuidv4(), student.id, title, 2000, today.toISOString().split('T')[0], "pending"]
          );
        }
      }
    } catch (err) {
      console.error("Fee generation error:", err);
    }
  };

  // Run checks on relevant requests
  app.use("/api/fees", async (req, res, next) => {
    if (req.method === "GET") {
      await generateMonthlyFees();
    }
    next();
  });

  // Fees
  app.get("/api/fees", authenticate, async (req: any, res) => {
    if (req.user.role === "student") {
      const fees = await query("SELECT * FROM fees WHERE studentId = ?", [req.user.id]);
      return res.json(fees);
    }
    const fees = await query("SELECT * FROM fees");
    res.json(fees);
  });

  app.post("/api/fees/add-charge", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { studentId, title, amount, targetType, targetClass } = req.body;
      let students: any[] = [];
      
      if (targetType === "school") {
        const result = await query("SELECT id FROM students");
        students = Array.isArray(result) ? result : [];
      } else if (targetType === "class") {
        const result = await query("SELECT id FROM students WHERE class = ?", [targetClass]);
        students = Array.isArray(result) ? result : [];
      } else if (studentId) {
        students = [{ id: studentId }];
      }

      for (const student of students) {
        await query(
          "INSERT INTO fees (id, studentId, title, amount, date, status) VALUES (?, ?, ?, ?, ?, ?)",
          [uuidv4(), student.id, title, amount, new Date().toISOString().split('T')[0], "pending"]
        );
      }
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Charge failed" });
    }
  });

  app.put("/api/students/:id", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      const { name, email, class: cls, section, rollNumber, feeStatus } = req.body;
      await query(
        "UPDATE students SET name = ?, email = ?, class = ?, section = ?, rollNumber = ?, feeStatus = ? WHERE id = ?",
        [name, email, cls, section, rollNumber, feeStatus, req.params.id]
      );
      await query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.delete("/api/students/:id", authenticate, authorize(["admin"]), async (req, res) => {
    try {
      await query("DELETE FROM users WHERE id = ?", [req.params.id]); // Cascade will handle student record
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Deletion failed" });
    }
  });

  app.post("/api/schedule", authenticate, authorize(["admin"]), async (req: any, res) => {
    const id = uuidv4();
    const { class: cls, day, time, subject, teacher } = req.body;
    await query("INSERT INTO schedule (id, class, day, time, subject, teacher) VALUES (?, ?, ?, ?, ?, ?)", [id, cls, day, time, subject, teacher]);
    res.json({ id, ...req.body });
  });

  app.delete("/api/schedule/:id", authenticate, authorize(["admin"]), async (req: any, res) => {
    await query("DELETE FROM schedule WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  });

  app.post("/api/fees/:id/pay", authenticate, authorize(["student"]), async (req: any, res) => {
    await query("UPDATE fees SET status = 'paid' WHERE id = ? AND studentId = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  });

  app.patch("/api/fees/:id/approve", authenticate, authorize(["admin"]), async (req: any, res) => {
    await query("UPDATE fees SET status = 'paid' WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  });

  // Results
  app.get("/api/results", authenticate, async (req: any, res) => {
    if (req.user.role === "student") {
      const results = await query("SELECT * FROM results WHERE studentId = ?", [req.user.id]);
      return res.json(results);
    }
    const results = await query("SELECT * FROM results");
    res.json(results);
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
