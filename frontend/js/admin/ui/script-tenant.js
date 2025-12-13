// script-tenant.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Refer elements ---
    const modalOverlay = document.getElementById('modal-overlay');
    const cancelBtn = document.querySelector('.btn-cancel'); 
    // หมายเหตุ: ปุ่ม Add ย้ายไปจัดการใน add-tenant.js แล้วเพื่อให้เรียก openModal('add') ได้

    // --- ฟังก์ชันปิด Modal (เมื่อกดพื้นหลังสีดำ) ---
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // --- ฟังก์ชันปิด Modal (เมื่อกดปุ่ม Cancel) ---
    if (cancelBtn && modalOverlay) {
        cancelBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

    // --- Sidebar Logic (เหมือนเดิม) ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if(overlay) overlay.classList.add('active');
        });

        if(overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    }
});