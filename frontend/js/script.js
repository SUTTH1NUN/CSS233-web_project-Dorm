document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    // ปิดเมนูมือถือเมื่อกดลิงก์
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // 2. Smooth Scroll & Active State Logic
    const navLinks = document.querySelectorAll('.nav-link, .mobile-menu a'); // รวมทั้ง Desktop และ Mobile
    const sections = document.querySelectorAll('section');

    // ฟังก์ชันสำหรับคลิกแล้วเลื่อน
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // เช็คว่าเป็นลิงก์ภายในหน้า (#...) หรือไม่
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerOffset = 85; // ความสูงเมนูบาร์ (เผื่อไว้นิดหน่อย)
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });

    // ฟังก์ชันเช็คตอนเลื่อนหน้าจอ (Scroll Spy)
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // ปรับ offset -150 เพื่อให้เส้นเปลี่ยนสีก่อนถึงหัวข้อนิดนึง
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        // ถ้าเลื่อนลงมาสุดหน้าจอ ให้ active ตัวสุดท้าย (กันพลาด)
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
           // current = 'login'; // หรือ id ของ section สุดท้ายของคุณ
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            // เช็คว่า href ตรงกับ id ปัจจุบันหรือไม่ (เช่น #about ตรงกับ id="about")
            if (href && href.includes('#' + current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Room Modal Logic ---

// 1. เลือก Element ที่เกี่ยวข้อง
const roomModal = document.getElementById('room-modal');
const closeModalBtn = document.querySelector('.close-modal');
const viewDetailBtns = document.querySelectorAll('.btn-book'); // ปุ่ม View Details

// Elements ใน Modal ที่จะเปลี่ยนข้อมูล
const modalTitle = document.getElementById('modal-room-name');
const modalMainImage = document.getElementById('modal-main-image');
const modalPrice = document.getElementById('modal-price');
const modalSize = document.getElementById('modal-size');
const modalBed = document.getElementById('modal-bed');

// ข้อมูลจำลองของแต่ละห้อง (เพื่อให้กดแล้วข้อมูลเปลี่ยนตามปุ่ม)
const roomData = [
    { 
        name: "Studio Suite", 
        price: "5,500 THB / month", 
        size: "26 sq.m.", 
        bed: "1 Bed", 
        img: "picture/studio.jpg" 
    },
    { 
        name: "1 Bedroom Suite", 
        price: "8,500 THB / month", 
        size: "45 sq.m.", 
        bed: "1 Bed + Living", 
        img: "picture/1bedroom.jpg" // ใช้รูปที่คุณมี เช่น 2bedroom.png ใน HTML เดิม
    },
    { 
        name: "2 Bedroom Family", 
        price: "15,000 THB / month", 
        size: "75 sq.m.", 
        bed: "2 Beds", 
        img: "picture/2bedroom.jpg" // ใช้รูปที่คุณมี
    }
];

// 2. สั่งให้ปุ่ม View Details เปิด Modal
viewDetailBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        // ดึงข้อมูลตามลำดับปุ่ม (0, 1, 2)
        const data = roomData[index]; 
        
        // อัปเดตข้อมูลใน Modal
        modalTitle.textContent = data.name;
        modalPrice.textContent = data.price;
        modalSize.textContent = data.size;
        modalBed.textContent = data.bed;
        modalMainImage.src = data.img;

        // แสดง Modal
        roomModal.classList.add('active');
    });
});

// 3. ปิด Modal
if(closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        roomModal.classList.remove('active');
    });
}

// ปิดเมื่อกดพื้นหลัง
window.addEventListener('click', (e) => {
    if (e.target === roomModal) {
        roomModal.classList.remove('active');
    }
});

// 4. ฟังก์ชันเปลี่ยนรูป (เมื่อกด Thumbnail) - ต้องอยู่นอก DOMContentLoaded หรือประกาศเป็น Global
window.changeImage = function(element) {
    const mainImg = document.getElementById('modal-main-image');
    
    // เปลี่ยนรูปใหญ่เป็นรูปที่กด
    mainImg.src = element.src;
    
    // ย้าย class active ไปที่รูปที่กด
    document.querySelectorAll('.thumb').forEach(thumb => thumb.classList.remove('active'));
    element.classList.add('active');
}

});