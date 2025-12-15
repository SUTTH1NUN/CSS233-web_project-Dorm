// document.addEventListener('DOMContentLoaded', () => {
//      const menuToggle = document.getElementById('menu-toggle');
//     const sidebar = document.getElementById('sidebar');
//     const overlay = document.getElementById('sidebar-overlay');

//     // 2. ตรวจสอบว่ามี Element ครบไหม
//     if (menuToggle && sidebar) {
        
//         // เมื่อกดปุ่ม 3 ขีด
//         menuToggle.addEventListener('click', () => {
//             sidebar.classList.add('active'); // เติม class active เพื่อเลื่อนเมนูออกมา
//             if(overlay) overlay.classList.add('active'); // โชว์พื้นหลังดำ
//         });

//         // เมื่อกดพื้นหลังสีดำ (Overlay)
//         if(overlay) {
//             overlay.addEventListener('click', () => {
//                 sidebar.classList.remove('active'); // ซ่อนเมนู
//                 overlay.classList.remove('active'); // ซ่อนพื้นหลัง
//             });
//         }
//     }
// });


document.addEventListener('DOMContentLoaded', () => {
    // เปลี่ยน URL ให้ตรงกับ Server ของคุณ
    const API_URL = 'http://localhost:3030/api/dashboard/stats';

    // UI Elements
    const currentDateEl = document.getElementById('current-date');
    const revenueEl = document.getElementById('stat-revenue');
    const occupancyRateEl = document.getElementById('stat-occupancy-rate');
    const occupiedCountEl = document.getElementById('stat-occupied-count');
    const totalRoomsEl = document.getElementById('stat-total-rooms');
    const activeRepairsEl = document.getElementById('stat-active-repairs');
    const availableRoomsEl = document.getElementById('stat-available-rooms');
    
    const roomListBody = document.getElementById('room-list-body');
    const paymentListBody = document.getElementById('payment-list-body');
    
    // Sidebar & Logout
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const logoutBtn = document.getElementById('logout-btn');

    // 1. Set Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);

    // 2. Fetch Data
    async function fetchStats() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();

            updateUI(data);

        } catch (error) {
            console.error('Error:', error);
            // แสดง Error บนหน้าจอ (Optional)
            revenueEl.innerText = "Error";
        }
    }

    // 3. Update UI
    function updateUI(data) {
        // Revenue
        // ใช้ toLocaleString เพื่อใส่ลูกน้ำ (,)
        const revenue = parseFloat(data.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 });
        revenueEl.textContent = `฿ ${revenue}`;

        // Occupancy
        occupancyRateEl.textContent = `${data.occupancy.rate}%`;
        occupiedCountEl.textContent = data.occupancy.occupied;
        totalRoomsEl.textContent = data.occupancy.total;

        // Repairs
        activeRepairsEl.textContent = data.active_repairs;

        // Available
        availableRoomsEl.textContent = data.occupancy.available;

        // Room List Table
        roomListBody.innerHTML = '';
        if(data.rooms_list.length === 0) {
            roomListBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999;">No data</td></tr>`;
        } else {
            data.rooms_list.forEach(room => {
                let badgeClass = room.room_status; // ตรงกับ CSS class
                // ถ้าใน DB เป็น 'under_maintenance' ให้เปลี่ยนเป็น 'maintenance' เพื่อให้ตรงกับ class CSS
                if(room.room_status === 'under_maintenance') badgeClass = 'maintenance'; 
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${room.room_number}</td>
                    <td>${room.room_type}</td>
                    <td>${room.floor}</td>
                    <td><span class="badge ${badgeClass}">${room.room_status.replace('_', ' ')}</span></td>
                `;
                roomListBody.appendChild(tr);
            });
        }

        // Payments List
        paymentListBody.innerHTML = '';
        if(data.payments_list.length === 0) {
            paymentListBody.innerHTML = `<li style="text-align:center; color:#999; padding:15px;">No recent payments</li>`;
        } else {
            data.payments_list.forEach(pay => {
                const amount = parseFloat(pay.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
                // แปลงวันที่จ่ายเงิน
                const payDate = pay.payment_date ? new Date(pay.payment_date).toLocaleDateString('en-GB') : '-';
                
                const tr = document.createElement('li');
                tr.innerHTML = `
                    <div class="pay-icon"><i class="fas fa-money-bill-wave"></i></div>
                    <div class="pay-detail">
                        <strong>Room ${pay.room_number}</strong>
                        <span>Status: ${pay.payment_status} (${payDate})</span>
                    </div>
                    <div class="pay-amount">+฿ ${amount}</div>
                `;
                paymentListBody.appendChild(tr);
            });
        }
    }

    // Sidebar Logic
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if(overlay) overlay.classList.add('active');
        });
    }
    if(overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            window.location.href = '../../index.html';
        });
    }

    // Run
    fetchStats();
});