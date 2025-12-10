document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ประกาศตัวแปร (Refer elements) ---
    const addBtn = document.getElementById('add-announcement-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const cancelBtn = document.querySelector('.btn-cancel'); // ปุ่ม Cancel ในฟอร์ม

    // --- 2. ฟังก์ชันเปิด Modal ---
    if (addBtn && modalOverlay) {
        addBtn.addEventListener('click', () => {
            modalOverlay.classList.add('active'); // เติม class active เพื่อแสดงผล
        });
    }

    // --- 3. ฟังก์ชันปิด Modal (เมื่อกดพื้นหลังสีดำ) ---
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            // เช็คว่ากดโดนพื้นหลังจริงๆ ไม่ใช่โดนกล่องขาวข้างใน
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // --- 4. ฟังก์ชันปิด Modal (เมื่อกดปุ่ม Cancel) ---
    // (เผื่อกรณีคุณลบ onclick="..." ใน HTML ออก เพื่อให้จัดการใน JS ที่เดียว)
    if (cancelBtn && modalOverlay) {
        cancelBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

});