// const mysql = require('mysql2');
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'Dorm_Database'
// });

// connection.connect((err) => {
//     if(err){
//         console.log('Connect to database fail');
//     }else{
//         console.log('connect to database successful')
//     }
    
// });

// module.exports = connection;

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',           // ใส่รหัสผ่านของคุณ
  database: 'my_database' // ใส่ชื่อฐานข้อมูลที่คุณสร้างไว้
});

connection.connect((err) => {
  if (err) {
    console.error('❌ ไม่สามารถเชื่อมต่อ MySQL:', err.message);
    return;
  }
  console.log('✅ เชื่อมต่อ MySQL สำเร็จ');
});

module.exports = connection;