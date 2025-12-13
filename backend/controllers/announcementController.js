const pool = require('../config/db');

function clean_date(date){
    if(!date || date === '' || date === 'null'){
        return null;
    }
    else{
        return date;
    }
}

function clean_contant(contant){
    if (!contant || contant === '' || contant === 'null'){
        return null;
    }
    else{
        return contant;
    }
}
exports.createAnnouncement = async (req, res) => {

    const {title, content, visible_until, announcement_status} = req.body;
    if( !title){
        return res.status(400).json({message: 'กรุณากรอกข้อมูล'});
    }
    try{
        const admin_id = req.user.id;
        
        const inUse_date = clean_date(visible_until);
        const inUse_contant = clean_contant(content)
        const newAnnouncement = await pool.query(
        `insert into announcements (admin_id, title, content, visible_until, announcements_status)
        values ($1, $2, $3, $4, $5)
        returning *`,
        [admin_id, title, inUse_contant, inUse_date, announcement_status || 'active']
        );

        res.status(201).json({
            message: "สร้างประกาศสำเร็จ", 
            announcement: newAnnouncement.rows[0]
        });

    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getAllAnnouncements = async (req, res) => {
    try{
        const getAllAnnouncement = await pool.query(
            `select title, content, announcements_status, visible_until, created_at
            from announcements
            order by created_at desc`
        );

        res.json(getAllAnnouncement.rows);
    }
    catch (err){
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
};