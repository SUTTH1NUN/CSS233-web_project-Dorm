
// --- ส่วนจัดการ Popup Modal ---
const addBtn = document.getElementById('add-announcement-btn');
const modalOverlay = document.getElementById('modal-overlay');

// 1. กดปุ่ม Add Repairs เพื่อเปิด Modal
addBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
});

// 2. กดที่พื้นหลังสีดำ (Overlay) เพื่อปิด Modal
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});