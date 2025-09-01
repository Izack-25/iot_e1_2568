const express = require('express');
const mqtt = require("mqtt");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const JWT_SECRET = "123456";
const app = express();
const port = 7000;

app.use(express.json());
app.use(cors());

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// ✅ Database
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: 'iot68_e1'
});

// ✅ MQTT
const MQTT_SERVER = "mqtt://broker.hivemq.com";
const temp = "sriharat/temp"; 
const hum = "sriharat/humi";   // 
const deviceControl = "sriharat/sw1"; 
const responseTopic = "re_sriharat/sw1"; 

const mqtt_id = "Sriharat" + Math.random().toString(16).substr(2, 8);
console.log(`กำลังเชื่อมต่อไปยัง MQTT Broker ที่: ${MQTT_SERVER}`);

const client = mqtt.connect(MQTT_SERVER, { clientId: mqtt_id });
let sensorData = { temperature: 0, humidity: 0 };
let deviceState = false;

client.on("connect", () => {
  console.log("เชื่อมต่อกับ MQTT Broker สำเร็จแล้ว!");
  client.subscribe([temp, hum, responseTopic], (err) => {
    if (!err) {
      console.log(`ฟังหัวข้อ: '${temp}', '${hum}', '${responseTopic}'`);
    }
  });
});

client.on("message", (topic, message) => {
  const msg = message.toString();
  if (topic === temp) {
    sensorData.temperature = deviceState ? parseFloat(msg) : 0;
  } else if (topic === hum) {
    sensorData.humidity = deviceState ? parseFloat(msg) : 0;
  } else if (topic === responseTopic) {
    console.log(`[ESP32 ตอบกลับ]: ${msg}`);
    deviceState = msg === "1";
  }
});

// ✅ API ดึง sensor + device state
app.get("/sensor", (req, res) => {
  res.json({
    sensorData,
    deviceState
  });
});

// ✅ API toggle device
app.post("/device", (req, res) => {
  const { state } = req.body;
  const message = state ? "1" : "0";
  client.publish(deviceControl, message, (err) => {
    if (err) return res.status(500).json({ status: "error", message: err.message });
    console.log(`ส่งคำสั่งไปที่ ESP32: ${message}`);
    res.json({ status: "ok", message: "ส่งคำสั่งสำเร็จ รอ ESP32 ยืนยัน" });
  });
});

app.get("/", authenticateToken, async (req, res) => {
  const [rows] = await db.query("SELECT * FROM users");
  res.json(rows);
});

app.post("/insert", async (req, res) => {
  try {
    const { email, password, status, dep } = req.body;
    const [result] = await db.query(
      "INSERT INTO users (email, password, status, dep) VALUES (?, ?, ?, ?)",
      [email, password, status, dep]
    );
    res.json({ status: "ok", result });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/edit-user/:id", async (req, res) => {
  const userId = req.params.id;
  const { email, password, status, dep } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE users SET email=?, password=?, status=?, dep=? WHERE id=?",
      [email, password, status, dep, userId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    res.json({ status: "ok", message: "แก้ไขสำเร็จ" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.delete("/delete-user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [userId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    res.json({ status: "ok", message: "ลบสำเร็จ" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email=? AND password=?",
      [req.body.email, req.body.password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ status: "error", message: "email หรือ password ไม่ถูกต้อง" });
    }
    const user = rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ status: "ok", token, message: "เข้าสู่ระบบสำเร็จ" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
