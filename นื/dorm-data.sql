INSERT INTO admins (first_name, last_name, username, password_hash, created_at) VALUES 
('สมชาย', 'ใจดี', 'admin01', '$2a$12$R9h/cIPz0gi.URNNXRFXjO.p/u/8/1y..placeholder_hash..', NOW()),
('กานดา', 'มีสุข', 'admin02', '$2a$12$R9h/cIPz0gi.URNNXRFXjO.p/u/8/1y..placeholder_hash..', NOW());


INSERT INTO tenants (first_name, last_name, phone_number, email, tenant_status, password_hash, created_at) VALUES 
('นิพนธ์', 'รักเรียน', '081-234-5678', 'niphon.r@email.com', 'active', 'hash1234', NOW()), -- อยู่ A101
('วิภา', 'สวยงาม', '089-876-5432', 'wipa.s@email.com', 'active', 'hash1234', NOW()),    -- อยู่ A201
('John', 'Smith', '090-111-2222', 'john.smith@email.com', 'active', 'hash1234', NOW()),  -- อยู่ A301
('สมศรี', 'ขยันยิ่ง', '086-555-4444', 'somsri.k@email.com', 'inactive', 'hash1234', NOW()), -- ย้ายออก
('ก้องภพ', 'ใจสู้', '091-888-7777', 'kongphop@email.com', 'active', 'hash1234', NOW()),    -- อยู่ B101
('Alice', 'Wonder', '095-444-3333', 'alice@email.com', 'active', 'hash1234', NOW());       -- อยู่ B401


INSERT INTO room_info (room_type, room_size, room_price, room_furniture) VALUES 
('Studio', 26.00, 4500.00, 'เตียง 5 ฟุต, ตู้เสื้อผ้า, โต๊ะเครื่องแป้ง, แอร์'),
('1 Bedroom', 35.00, 6500.00, 'เตียง 6 ฟุต, ตู้เสื้อผ้า, โซฟา, ทีวี, ตู้เย็น, ไมโครเวฟ, แอร์ 2 ตัว'),
('2 Bedroom', 55.00, 12000.00, 'เตียง 6 ฟุต, เตียง 3.5 ฟุต, โซฟาชุดใหญ่, โต๊ะทานข้าว, ครัวบิ้วอิน, เครื่องซักผ้า');


INSERT INTO rooms (building, floor, room_number, room_status, room_type) VALUES 
-- --- ตึก A (Building A) ---
-- ชั้น 1
('A', 1, 'A101', 'occupied', 'Studio'),
('A', 1, 'A102', 'occupied', 'Studio'),
('A', 1, 'A103', 'under_maintenance', 'Studio'), -- ห้องซ่อม
-- ชั้น 2
('A', 2, 'A201', 'occupied', '1 Bedroom'),
('A', 2, 'A202', 'available', '1 Bedroom'),
-- ชั้น 3
('A', 3, 'A301', 'occupied', '2 Bedroom'),
('A', 3, 'A302', 'available', '1 Bedroom'),
-- ชั้น 4 (ใหม่)
('A', 4, 'A401', 'available', 'Studio'),
('A', 4, 'A402', 'available', 'Studio'),

-- --- ตึก B (Building B) ---
-- ชั้น 1
('B', 1, 'B101', 'occupied', 'Studio'),
('B', 1, 'B102', 'booked', 'Studio'), -- มีคนจอง
-- ชั้น 2
('B', 2, 'B201', 'occupied', '1 Bedroom'),
('B', 2, 'B202', 'available', '1 Bedroom'),
-- ชั้น 3
('B', 3, 'B301', 'available', '2 Bedroom'),
-- ชั้น 4 (ใหม่)
('B', 4, 'B401', 'occupied', '2 Bedroom'),
('B', 4, 'B402', 'available', '1 Bedroom');


INSERT INTO lease_contract (tenant_id, room_id, start_date, end_date, contract_status, deposit_amount) VALUES 
-- นิพนธ์ อยู่ A101 (room_id ประมาณ 1)
(1, 1, '2023-01-15', '2024-01-15', 'active', 9000.00),
-- วิภา อยู่ A201 (room_id ประมาณ 4)
(2, 4, '2023-06-01', '2024-06-01', 'active', 13000.00),
-- John อยู่ A301 (room_id ประมาณ 6)
(3, 6, '2023-09-01', '2024-02-28', 'active', 24000.00),
-- ก้องภพ อยู่ B101 (room_id ประมาณ 10 - ตึก B ชั้น 1)
(5, 10, '2023-11-01', '2024-11-01', 'active', 9000.00),
-- Alice อยู่ B401 (room_id ประมาณ 15 - ตึก B ชั้น 4)
(6, 15, '2023-05-20', '2024-05-20', 'active', 24000.00);


INSERT INTO payments (contract_id, water_meter_current, water_meter_last, water_fee, electricity_meter_current, electricity_meter_last, electricity_fee, room_fee, total_amount, payment_status, billing_date, due_date, payment_date) VALUES 
-- บิลห้อง นิพนธ์ (A101) - จ่ายแล้ว
(1, 125.00, 120.00, 90.00, 1500.00, 1350.00, 1050.00, 4500.00, 5640.00, 'paid', '2023-10-25', '2023-11-05', '2023-10-28 18:20:00'),

-- บิลห้อง วิภา (A201) - ยังไม่จ่าย (Pending)
(2, 88.00, 80.00, 144.00, 950.00, 800.00, 1050.00, 6500.00, 7694.00, 'pending', '2023-10-25', '2023-11-05', NULL),

-- บิลห้อง John (A301) - จ่ายช้า (Overdue - สมมติของเดือนก่อน)
(3, 45.00, 35.00, 180.00, 2200.00, 1900.00, 2100.00, 12000.00, 14280.00, 'overdue', '2023-09-25', '2023-10-05', NULL),

(5, 200.00, 190.00, 180.00, 3500.00, 3200.00, 2100.00, 12000.00, 14280.00, 'pending', '2023-11-05');


INSERT INTO repairs (tenant_id, room_id, issue_title, issue_description, phone_number, request_date, repair_status, resolved_date, img_path) VALUES 
-- เคส 1: ห้องน้ำตัน (กำลังดำเนินการ)
(1, 1, 'ท่อน้ำตัน', 'น้ำในห้องน้ำระบายช้ามาก รบกวนตรวจสอบครับ', '081-234-5678', '2023-10-26', 'in_progress', NULL, '/uploads/repairs/a101_drain.jpg'),

-- เคส 2: แอร์ไม่เย็น (เสร็จแล้ว)
(2, 4, 'แอร์ไม่เย็น', 'เปิดแอร์แล้วมีแต่ลม ไม่มีไอเย็นเลย', '089-876-5432', '2023-10-10', 'completed', '2023-10-12', '/uploads/repairs/a201_ac.jpg'),

-- เคส 3: ไฟทางเดิน (แจ้งใหม่)
(3, 6, 'หลอดไฟขาด', 'ไฟระเบียงห้องกระพริบแล้วดับไป', '090-111-2222', '2023-10-28', 'pending', NULL, NULL),

(6, 15, 'ไฟระเบียงดับ', 'หลอดไฟระเบียงห้อง B401 ขาด', '2023-10-28', 'pending');


INSERT INTO announcements (admin_id, title, content, announcements_status, created_at, visible_until) VALUES 
(1, 'แจ้งหยุดจ่ายน้ำประปาชั่วคราว', 'เนื่องจากการประปาจะทำการซ่อมท่อเมน จะทำให้น้ำไม่ไหลในวันที่ 30 ต.ค. เวลา 10.00-15.00 น. ขออภัยในความไม่สะดวก', 'active', NOW(), '2023-10-31'),
(1, 'ระเบียบการรับพัสดุ', 'กรุณามารับพัสดุที่สำนักงานภายใน 3 วันหลังจากของมาถึง มิเช่นนั้นทางหอพักจะไม่รับผิดชอบหากสูญหาย', 'active', '2023-01-01 00:00:00', NULL),
(2, 'Test Announcement', 'ทดสอบระบบประกาศ (ซ่อน)', 'inactive', NOW(), NULL);



ในหน้า index.html ฉันอยากให้มันแสดงห้องที่ยังว่างเผื่อผู้ที่สนใจเข้ามาดูห้องพัก โดยมีโค้ดประมาณนี้
   <section id="rooms">
         <div class="content">
        <div class="full-width-image-container">
             <img src="picture/room_main.jpg" class="main-image" alt="Our Rooms">
             <div class="image-text-overlay">
                 <p >Your Private Sanctuary</p>
                 <a>Our Rooms & Suites</a>
                 <p>Designed for comfort, styled for living.</p>
             </div>
         </div>
         </div>

        <div class="box" style="margin-bottom: 40px;">
            <hr class="hr-main">
            <p class="main">Accommodation</p>
            <p class="des">Relax in our spacious, modern rooms equipped with everything you need for a perfect stay. Check real-time availability below.</p>
        </div>

        <div class="room-layout">
            
            <div class="room-card">
                <div class="room-image">
                    <img src="picture/studio.jpg" alt="Studio Room">
                    <span class="price-tag">฿ 5,500 / Month</span>
                </div>
                <div class="room-details">
                    <h3>Studio Suite</h3>
                    <span class="room-size">TYPE A | 26 SQ.M.</span>
                    <p class="desc">A compact yet luxurious space perfect for singles or couples. Features a king-size bed, work desk, and a modern bathroom with rain shower.</p>
                    <div class="amenities">
                        <span><i class="fas fa-wifi"></i> Free WiFi</span>
                        <span><i class="fas fa-tv"></i> Smart TV</span>
                        <span><i class="fas fa-snowflake"></i> AC</span>
                    </div>
                    
                    <button class="btn-book">View Details</button>

                    
                    <div class="room-availability">
                        <span class="avail-label"><i class="fas fa-door-open"></i> Available Rooms:</span>
                        <div class="avail-tags-container" id="avail-studio">
                            <span class="room-tag">A-101</span>
                            <span class="room-tag">A-104</span>
                            <span class="room-tag">A-205</span>
                        </div>
                        <br>
                         <div class="avail-contact-box">
                            <p>Interested? Please contact us:</p>
                            <div class="contact-buttons">
                                <a href="https://line.me/R/ti/p/@hatyaicondo" target="_blank" class="contact-pill line">
                                    <i class="fab fa-line"></i> @hatyaicondo
                                </a>
                                <a href="tel:074123456" class="contact-pill phone">
                                    <i class="fas fa-phone"></i> +66(0)123456789
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="room-card">
                <div class="room-image">
                    <img src="picture/1bedroom.jpg" alt="1 Bedroom Suite">
                    <span class="price-tag">฿ 8,500 / Month</span>
                </div>
                <div class="room-details">
                    <h3>1 Bedroom Suite</h3>
                    <span class="room-size">TYPE B | 45 SQ.M.</span>
                    <p class="desc">Enjoy extra privacy with a separate living area and bedroom. Includes a kitchenette, dining area, and a balcony with city views.</p>
                    
                 
                    <div class="amenities">
                        <span><i class="fas fa-couch"></i> Living Area</span>
                        <span><i class="fas fa-utensils"></i> Kitchen</span>
                        <span><i class="fas fa-shower"></i> Bathtub</span>
                    </div>
                    <button class="btn-book">View Details</button>


                       <div class="room-availability">
                        <span class="avail-label"><i class="fas fa-door-open"></i> Available Rooms:</span>
                        <div class="avail-tags-container" id="avail-1bed">
                            <span class="room-tag">B-302</span>
                            <span class="room-tag">B-410</span>
                        </div>
                         <br>
                         <div class="avail-contact-box">
                            <p>Interested? Please contact us:</p>
                            <div class="contact-buttons">
                                <a href="https://line.me/R/ti/p/@hatyaicondo" target="_blank" class="contact-pill line">
                                    <i class="fab fa-line"></i> @hatyaicondo
                                </a>
                                <a href="tel:074123456" class="contact-pill phone">
                                    <i class="fas fa-phone"></i> +66(0)123456789
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="room-card">
                <div class="room-image">
                    <img src="picture/2bedroom.jpg" alt="2 Bedroom Suite">
                    <span class="price-tag">฿ 15,000 / Month</span>
                </div>
                <div class="room-details">
                    <h3>Family Suite</h3>
                    <span class="room-size">TYPE C | 75 SQ.M.</span>
                    <p class="desc">The ultimate choice for families. Two spacious bedrooms, two bathrooms, a full kitchen, and a large living room for gathering.</p>
                    
                    
                    <div class="amenities">
                        <span><i class="fas fa-bed"></i> 2 Bedrooms</span>
                        <span><i class="fas fa-users"></i> Family Size</span>
                        <span><i class="fas fa-blender"></i> Full Kitchen</span>
                    </div>
                    <button class="btn-book">View Details</button>
                    

                    <div class="room-availability full">
                        <span class="avail-label"><i class="fas fa-times-circle"></i> Status:</span>
                        <div class="avail-tags-container" id="avail-2bed">
                            <span class="room-tag empty">Fully Booked</span>
                        </div>
                        <br>
                         <div class="avail-contact-box">
                            <p>Interested? Please contact us:</p>
                            <div class="contact-buttons">
                                <a href="https://line.me/R/ti/p/@hatyaicondo" target="_blank" class="contact-pill line">
                                    <i class="fab fa-line"></i> @hatyaicondo
                                </a>
                                <a href="tel:074123456" class="contact-pill phone">
                                    <i class="fas fa-phone"></i> +66(0)123456789
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>

        </div>
    </section>

ฉันอยากให้คุณ เขียนไฟล์ js ต่อจากไฟล์ที่มีอยู่เดิมในฝั่ง front end และเพิ่มเติมในส่วน back end
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

});