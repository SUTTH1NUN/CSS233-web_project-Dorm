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
});