document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ประกาศตัวแปร (Refer elements) ---
    const addBtn = document.getElementById('add-tenant-btn');
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