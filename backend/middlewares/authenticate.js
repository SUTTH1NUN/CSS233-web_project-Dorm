// middlewares/authenticate.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ (No Token)" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "รูปแบบ Token ไม่ถูกต้อง" });
        }

        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        req.user = decoded; 
        
        next();

    } catch (err) {
        return res.status(403).json({ message: "Token หมดอายุหรือไม่ถูกต้อง" });
    }
};