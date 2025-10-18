// const express = require('express');
// const db = require('./db');
// const app = express();
// const port = 3030;

// app.use(express.json());

// app.get('/', (req, res) => {
//     res.send('เซิร์ฟเวอร์ทำงานปกติ');
// });

// app.listen(port, () => {
//     console.log('server(database) running at http://localhost:${port}');
// });

const express = require('express');
const db = require('./db'); // แค่เรียกใช้ก็เช็คการเชื่อมต่อแล้ว

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('เซิร์ฟเวอร์ทำงานปกติ');
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});