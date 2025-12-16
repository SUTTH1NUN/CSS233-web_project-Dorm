/*
document.addEventListener('DOMContentLoaded', () => {
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
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. CONFIGURATION & SETUP
    // =========================================
    const API_BASE = "http://localhost:3030/api"; 
    
    // Helper function to get token
    const getToken = () => localStorage.getItem('token'); 

    // Selectors
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const announcementFeed = document.querySelector('.announcement-feed');
    const recentUpdatesDivider = document.querySelector('.section-divider');
    const userWelcome = document.querySelector('.user-welcome p'); // สำหรับแสดงชื่อผู้เช่า

    // 2. Initial Authentication Check
    const token = getToken();
    if (!token) {
        alert("กรุณาเข้าสู่ระบบก่อน");
        window.location.href = "../../index.html";
        return;
    }

    // =========================================
    // 3. UI/UX: Sidebar Toggle
    // =========================================
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // =========================================
    // 4. API CALL: Fetch Announcements
    // =========================================
    async function fetchAnnouncements() {
        if (!announcementFeed) return; // ป้องกัน Error ถ้าหา Element ไม่เจอ

        // แสดงสถานะ Loading ก่อน
        announcementFeed.innerHTML = '<p style="text-align:center; padding: 20px;">กำลังโหลดประกาศ...</p>';
        
        try {
            const res = await fetch(`${API_BASE}/announcement`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Failed to fetch announcements");

            const announcements = await res.json();
            renderAnnouncements(announcements);

        } catch (err) {
            console.error('Error fetching announcements:', err);
            announcementFeed.innerHTML = '<p style="text-align:center; padding: 20px; color: red;">ไม่สามารถโหลดข้อมูลประกาศได้</p>';
        }
    }

    // =========================================
    // 5. RENDER LOGIC
    // =========================================
    function renderAnnouncements(announcements) {
        if (announcementFeed) {
            announcementFeed.innerHTML = ''; // ล้างข้อมูล Static เดิมออก

            const pinnedAnnouncements = announcements.filter(a => a.is_pinned);
            const recentAnnouncements = announcements.filter(a => !a.is_pinned);

            // 5.1 Render Pinned (Important)
            pinnedAnnouncements.forEach(announce => {
                announcementFeed.appendChild(createAnnouncementCard(announce, true));
            });

            // 5.2 Add Divider
            if (pinnedAnnouncements.length > 0 && recentAnnouncements.length > 0 && recentUpdatesDivider) {
                announcementFeed.appendChild(recentUpdatesDivider); 
            } else if (recentUpdatesDivider) {
                // ถ้าไม่มีประกาศปักหมุดเลย ก็ซ่อน Divider เดิมไปก่อน
                // หรือสร้าง Divider ใหม่ (ถ้าคุณลบ Divider static ใน HTML ออกไป)
            }


            // 5.3 Render Recent
            recentAnnouncements.forEach(announce => {
                announcementFeed.appendChild(createAnnouncementCard(announce, false));
            });

            if (announcements.length === 0) {
                 announcementFeed.innerHTML = '<p style="text-align:center; padding: 20px; color: #aaa;">ไม่มีประกาศในขณะนี้</p>';
            }
        }
    }


    // 6. Function: Create Card HTML Element
    function createAnnouncementCard(item, isPinned) {
        const card = document.createElement('div');
        card.classList.add('announce-card');
        if (isPinned) card.classList.add('pinned');

        const dateObj = new Date(item.created_at);
        const dateStr = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

        // Mapping category/type to icon and class
        let badgeClass = 'general';
        let badgeIcon = 'fas fa-info-circle';
        let badgeText = 'General';

        // ปรับตาม category ที่ Admin ส่งมาจาก Backend (สมมติว่า Backend ส่ง category_name มา)
        if (item.category_name) {
            const lowerCaseCategory = item.category_name.toLowerCase();
            if (lowerCaseCategory.includes('important') || lowerCaseCategory.includes('emergency')) {
                badgeClass = 'important';
                badgeIcon = 'fas fa-thumbtack';
                badgeText = 'Important';
            } else if (lowerCaseCategory.includes('activity')) {
                badgeClass = 'activity';
                badgeIcon = 'fas fa-calendar-alt';
                badgeText = 'Activity';
            } else if (lowerCaseCategory.includes('delivery') || lowerCaseCategory.includes('parcel')) {
                 badgeClass = 'general';
                 badgeIcon = 'fas fa-box';
                 badgeText = 'Parcel Delivery';
            }
            // ถ้า Backend ส่ง 'category_name' มา ก็ใช้ชื่อนั้นเลย
            badgeText = item.category_name;
        }


        card.innerHTML = `
            <div class="card-badge ${badgeClass}">
                <i class="${badgeIcon}"></i> ${badgeText}
            </div>
            <div class="announce-body">
                <h2 class="news-title">${item.title}</h2>
                <span class="news-date"><i class="far fa-clock"></i> ${dateStr}</span>
                <p class="news-desc">
                    ${item.content}
                </p>
            </div>
        `;
        return card;
    }
    
    // 7. Function: Load User Info (Optional)
    function loadUserInfo() {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userWelcome) {
                    userWelcome.textContent = `Welcome back, ${userData.first_name || 'Resident'}!`;
                }
            } catch (e) {
                console.error("Error parsing user data");
            }
        }
    }


    // =========================================
    // 8. INITIALIZE
    // =========================================
    loadUserInfo();
    fetchAnnouncements();
});