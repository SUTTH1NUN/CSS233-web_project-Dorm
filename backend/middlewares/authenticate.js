// middlewares/authenticate.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        // 1. รับ Token จาก Header (Client ส่งมาแบบ: "Bearer <token>")
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ (No Token)" });
        }

        // 2. ตัดคำว่า "Bearer " ออก เอาแต่เนื้อ Token
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "รูปแบบ Token ไม่ถูกต้อง" });
        }

        // 3. ตรวจสอบ Token ว่าใช่ของจริงไหม (Verify)
        // ใช้กุญแจเดียวกับตอนสร้าง (ดึงจาก .env)
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        // 4. ถ้าผ่าน: เอาข้อมูล user ใส่ใน req เพื่อส่งให้ Controller
        req.user = decoded; 
        
        // 5. ไปต่อ!
        next();

    } catch (err) {
        // ถ้า Token หมดอายุ หรือเป็นของปลอม
        return res.status(403).json({ message: "Token หมดอายุหรือไม่ถูกต้อง" });
    }
};