document.addEventListener('DOMContentLoaded', () => {
    
    // ประกาศตัวแปร
    const addBtn = document.getElementById('add-repair-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const cancelBtn = document.querySelector('.btn-cancel');

    // ฟังก์ชันเปิด Modal
    if (addBtn && modalOverlay) {
        addBtn.addEventListener('click', () => {
            modalOverlay.classList.add('active');
        });
    }

    // ฟังก์ชันปิด Modal (กดพื้นหลัง)
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // ฟังก์ชันปิด Modal (กดปุ่ม Cancel)
    if (cancelBtn && modalOverlay) {
        cancelBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

     const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    // 2. ตรวจสอบว่ามี Element ครบไหม
    if (menuToggle && sidebar) {
        
        // เมื่อกดปุ่ม 3 ขีด
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active'); // เติม class active เพื่อเลื่อนเมนูออกมา
            if(overlay) overlay.classList.add('active'); // โชว์พื้นหลังดำ
        });

        // เมื่อกดพื้นหลังสีดำ (Overlay)
        if(overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active'); // ซ่อนเมนู
                overlay.classList.remove('active'); // ซ่อนพื้นหลัง
            });
        }
    }
});