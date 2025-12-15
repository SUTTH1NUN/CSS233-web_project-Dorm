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

// --- 1. ข้อมูลจำเพาะของแต่ละห้อง (Room Info) ---
    // แก้ไขข้อมูลตรงนี้ได้เลยครับ ข้อมูลจะไปโชว์ใน Popup ตามปุ่มที่กด
    const roomData = [
        { 
            // ข้อมูลสำหรับปุ่มที่ 1 (Studio)
            name: "Studio Suite", 
            price: "5,500 THB / month", 
            size: "26 sq.m.", 
            bed: "1 King Bed",
            facilities: "Air conditioner, Smart TV, Refrigerator, Free Wi-Fi, Work Desk",
            images: [
                "picture/studio.jpg",      // รูปหลัก
                "picture/bathroom_studio.jpg",    // รูปประกอบ 1
                "picture/balcony_studio.jpg"         // รูปประกอบ 2
            ]
        },
        { 
            // ข้อมูลสำหรับปุ่มที่ 2 (1 Bedroom)
            name: "Standard Suite ", 
            price: "8,500 THB / month", 
            size: "45 sq.m.", 
            bed: "1 King Bed + Living Area", 
            facilities: "AC, TV, Fridge, Microwave, Balcony",
            images: [
                "picture/1bedroom.jpg",    // รูปหลัก
                "picture/bathroom_1bed.jpg",      // รูปประกอบ 1
                "picture/kitchen_1bed.jpg"      // รูปประกอบ 2
            ]
        },
        { 
            // ข้อมูลสำหรับปุ่มที่ 3 (2 Bedroom)
            name: "Family Suite", 
            price: "15,000 THB / month", 
            size: "75 sq.m.", 
            bed: "2 King Beds", 
            facilities: "2 AC, 2 TV, Large Fridge, Full Kitchen, Bathtub, Living Room",
            images: [
                "picture/2bedroom.jpg",    // รูปหลัก
                "picture/bath_2bed.jpg",    // รูปประกอบ 1
                "picture/kitchen_2bed.jpg",
                "picture/living_2bed.jpg"      // รูปประกอบ 2
            ]
        }
    ];

    // --- 2. อ้างอิง Element ใน HTML ---
    const roomModal = document.getElementById('room-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const viewDetailBtns = document.querySelectorAll('.btn-book'); // ปุ่ม View Details หน้าเว็บ
    
    // Element ใน Modal ที่จะเปลี่ยนข้อมูล
    const modalTitle = document.getElementById('modal-room-name');
    const modalMainImage = document.getElementById('modal-main-image');
    const modalPrice = document.getElementById('modal-price');
    const modalSize = document.getElementById('modal-size');
    const modalBed = document.getElementById('modal-bed');
    const modalFacilities = document.getElementById('modal-facilities');
    const thumbnailList = document.querySelector('.thumbnail-list'); 

    // --- 3. ฟังก์ชันเปลี่ยนรูปใหญ่ เมื่อกด Thumbnail ---
    window.changeMainImage = function(src, element) {
        modalMainImage.src = src;
        
        // ย้ายกรอบสีทอง (active)
        document.querySelectorAll('.thumb').forEach(img => img.classList.remove('active'));
        element.classList.add('active');
    }

    // --- 4. ฟังก์ชันเปิด Modal และโหลดข้อมูล ---
    viewDetailBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // ดึงข้อมูลห้องตามลำดับปุ่ม (0, 1, 2)
            const data = roomData[index];
            
            // 4.1 ใส่ข้อมูล Text
            modalTitle.textContent = data.name;
            modalPrice.textContent = data.price;
            modalSize.textContent = data.size;
            modalBed.textContent = data.bed;
            modalFacilities.textContent = data.facilities;

            // 4.2 สร้างรูป Thumbnail ใหม่ (Loop ตามจำนวนรูปใน array images)
            thumbnailList.innerHTML = ''; // ล้างรูปเก่าออกก่อน
            
            data.images.forEach((imgSrc, i) => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.classList.add('thumb');
                if(i === 0) img.classList.add('active'); // รูปแรกใส่กรอบ active ไว้เลย
                
                // สั่งให้กดแล้วเปลี่ยนรูปใหญ่
                img.onclick = function() {
                    window.changeMainImage(imgSrc, this);
                };
                
                thumbnailList.appendChild(img);
            });

            // 4.3 ตั้งค่ารูปใหญ่รูปแรก
            modalMainImage.src = data.images[0];

            // 4.4 แสดง Modal
            roomModal.classList.add('active');
        });
    });

    // --- 5. ปิด Modal ---
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

    const revealElements = document.querySelectorAll('.reveal-text, hr.hr-main');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // ถ้าอยากให้เล่นแค่ครั้งเดียวให้เอา comment ออก
            } else {
                // ถ้าอยากให้เลื่อนกลับไปแล้วเล่นใหม่ ให้เปิดบรรทัดนี้
                // entry.target.classList.remove('visible'); 
            }
        });
    }, {
        root: null,
        threshold: 0.15, // ต้องเห็น element 15% ก่อนถึงจะเริ่ม animation
        rootMargin: "0px 0px -50px 0px" // สั่งให้เริ่มก่อนถึงขอบล่างนิดหน่อย
    });

    revealElements.forEach(el => revealObserver.observe(el));

});