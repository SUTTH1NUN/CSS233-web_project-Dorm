document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Configuration & Data ---
    const API_AVAILABILITY_URL = 'http://localhost:3030/api/public/available-rooms';
    
    // ข้อมูลห้องพัก (สามารถแก้ไขข้อมูลตรงนี้ได้เลย)
    const ROOM_DATA = [
        { 
            name: "Studio Suite", 
            price: "5,500 THB / month", 
            size: "26 sq.m.", 
            bed: "1 King Bed",
            facilities: "Air conditioner, Smart TV, Refrigerator, Free Wi-Fi, Work Desk",
            images: [
                "picture/studio.jpg", 
                "picture/bathroom_studio.jpg", 
                "picture/balcony_studio.jpg"
            ]
        },
        { 
            name: "Standard Suite", 
            price: "8,500 THB / month", 
            size: "45 sq.m.", 
            bed: "1 King Bed + Living Area", 
            facilities: "AC, TV, Fridge, Microwave, Balcony",
            images: [
                "picture/1bedroom.jpg", 
                "picture/bathroom_1bed.jpg", 
                "picture/kitchen_1bed.jpg"
            ]
        },
        { 
            name: "Family Suite", 
            price: "15,000 THB / month", 
            size: "75 sq.m.", 
            bed: "2 King Beds", 
            facilities: "2 AC, 2 TV, Large Fridge, Full Kitchen, Bathtub, Living Room",
            images: [
                "picture/2bedroom.jpg", 
                "picture/bath_2bed.jpg", 
                "picture/kitchen_2bed.jpg",
                "picture/living_2bed.jpg"
            ]
        }
    ];

    // --- 2. Initialization (เริ่มทำงาน) ---
    initMobileMenu();
    initSmoothScroll();
    initRoomModals();
    fetchRoomAvailability();


    // --- 3. Functional Logic ---

    // 3.1 Mobile Menu Logic
    function initMobileMenu() {
        const hamburger = document.querySelector('.hamburger-menu');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
            });

            // ปิดเมนูเมื่อกดลิงก์
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => mobileMenu.classList.remove('active'));
            });
        }
    }

    // 3.2 Smooth Scroll & Active Link
    function initSmoothScroll() {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-menu a');
        const sections = document.querySelectorAll('section');
        const HEADER_OFFSET = 85;

        // Click to Scroll
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetSection = document.querySelector(targetId);
                    
                    if (targetSection) {
                        const elementPosition = targetSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - HEADER_OFFSET;
            
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    }
                }
            });
        });

        // Scroll Spy (เปลี่ยนสีลิงก์ขณะเลื่อน)
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes('#' + current)) {
                    link.classList.add('active');
                }
            });
        });
    }

    // 3.3 Room Modal Logic
    function initRoomModals() {
        const modal = document.getElementById('room-modal');
        const closeModalBtn = document.querySelector('.close-modal');
        const viewDetailBtns = document.querySelectorAll('.btn-book');
        
        // Modal Elements
        const els = {
            title: document.getElementById('modal-room-name'),
            mainImg: document.getElementById('modal-main-image'),
            price: document.getElementById('modal-price'),
            size: document.getElementById('modal-size'),
            bed: document.getElementById('modal-bed'),
            facilities: document.getElementById('modal-facilities'),
            thumbList: document.querySelector('.thumbnail-list')
        };

        if (!modal) return;

        // Open Modal
        viewDetailBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const data = ROOM_DATA[index];
                if (!data) return;

                // Update Text Info
                els.title.textContent = data.name;
                els.price.textContent = data.price;
                els.size.textContent = data.size;
                els.bed.textContent = data.bed;
                els.facilities.textContent = data.facilities;
                els.mainImg.src = data.images[0];

                // Generate Thumbnails
                els.thumbList.innerHTML = '';
                data.images.forEach((imgSrc, i) => {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.classList.add('thumb');
                    if (i === 0) img.classList.add('active');

                    // Click to swap image
                    img.addEventListener('click', () => {
                        els.mainImg.src = imgSrc;
                        document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                        img.classList.add('active');
                    });

                    els.thumbList.appendChild(img);
                });

                modal.classList.add('active');
            });
        });

        // Close Modal Handlers
        const closeModal = () => modal.classList.remove('active');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // 3.4 Live Room Availability
    async function fetchRoomAvailability() {
        // Mapping: Key ต้องตรงกับ Database -> Value คือ ID ของ HTML container
        const typeMapping = {
            'Studio Suite': 'avail-studio',    
            '1 Bedroom Suite': 'avail-1bed',
            'Family Suite': 'avail-2bed'
        };

        try {
            const response = await fetch(API_AVAILABILITY_URL);
            if (!response.ok) throw new Error('Failed to fetch availability');
            
            const data = await response.json(); 

            for (const [dbType, elementId] of Object.entries(typeMapping)) {
                const container = document.getElementById(elementId);
                if (container) {
                    const rooms = data[dbType] || [];
                    updateAvailabilityUI(container, rooms);
                }
            }
        } catch (error) {
            console.error('Error loading room availability:', error);
        }
    }

    function updateAvailabilityUI(container, rooms) {
        const wrapper = container.closest('.room-availability');
        const label = wrapper.querySelector('.avail-label');
        container.innerHTML = ''; // Clear old content

        if (rooms.length > 0) {
            // State: Available
            wrapper.classList.remove('full');
            label.innerHTML = '<i class="fas fa-door-open"></i> Available Rooms:';

            const displayLimit = 6;
            rooms.slice(0, displayLimit).forEach(roomNo => {
                const span = document.createElement('span');
                span.className = 'room-tag';
                span.textContent = roomNo;
                container.appendChild(span);
            });

            if (rooms.length > displayLimit) {
                const moreSpan = document.createElement('span');
                moreSpan.className = 'room-tag more';
                moreSpan.textContent = `+${rooms.length - displayLimit} more`;
                container.appendChild(moreSpan);
            }
        } else {
            // State: Fully Booked
            wrapper.classList.add('full');
            label.innerHTML = '<i class="fas fa-times-circle"></i> Status:';

            const span = document.createElement('span');
            span.className = 'room-tag empty';
            span.textContent = 'Fully Booked';
            container.appendChild(span);
        }
    }
});