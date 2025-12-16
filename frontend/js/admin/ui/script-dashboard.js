document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_URL = 'http://localhost:3030/api/dashboard/stats';
    
    // --- UI Elements ---
    const elements = {
        currentDate: document.getElementById('current-date'),
        revenue: document.getElementById('stat-revenue'),
        occupancyRate: document.getElementById('stat-occupancy-rate'),
        occupiedCount: document.getElementById('stat-occupied-count'),
        totalRooms: document.getElementById('stat-total-rooms'),
        activeRepairs: document.getElementById('stat-active-repairs'),
        availableRooms: document.getElementById('stat-available-rooms'),
        roomListBody: document.getElementById('room-list-body'),
        paymentListBody: document.getElementById('payment-list-body'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        logoutBtn: document.getElementById('logout-btn')
    };

    // --- Helpers ---
    const getToken = () => sessionStorage.getItem('token'); 

    // Helper: Format เงิน (฿)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'THB',
            minimumFractionDigits: 2 
        }).format(amount).replace('THB', '฿');
    };

    // Helper: Format วันที่
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'short' 
        });
    };

    // --- 1. Initialize ---
    function init() {
        // เช็คก่อนเลยว่าเป็น Admin หรือไม่ (Optional: ถ้ามีเก็บ Role ไว้)
        // const role = sessionStorage.getItem('user_role');
        // if(role !== 'admin') { window.location.href = '/unauthorized.html'; return; }

        // Set Header Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        elements.currentDate.textContent = new Date().toLocaleDateString('en-US', options);

        fetchStats();
    }

    // --- 2. Fetch Data ---
    async function fetchStats() {
        const token = getToken();
        
        // ถ้าไม่มี Token ใน Session ให้ดีดกลับทันที
        if (!token) {
            window.location.href = '../../index.html';
            return;
        }

        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 401/403: Token หมดอายุ หรือ ไม่มีสิทธิ์
            if (res.status === 401 || res.status === 403) {
                alert('Session expired. Please login again.');
                handleLogout(); 
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch stats');
            
            const data = await res.json();
            updateUI(data);

        } catch (error) {
            console.error('Dashboard Error:', error);
            elements.revenue.innerText = "Error";
            elements.occupancyRate.innerText = "-";
        }
    }

    // --- 3. Update UI ---
    function updateUI(data) {
        // 3.1 Stat Cards
        elements.revenue.textContent = formatCurrency(data.revenue);
        
        elements.occupancyRate.textContent = `${data.occupancy.rate}%`;
        elements.occupiedCount.textContent = data.occupancy.occupied;
        elements.totalRooms.textContent = data.occupancy.total;
        elements.availableRooms.textContent = data.occupancy.available;

        elements.activeRepairs.textContent = data.active_repairs;

        // 3.2 Tables
        renderRoomList(data.rooms_list);
        renderPaymentList(data.payments_list);
    }

    function renderRoomList(rooms) {
        elements.roomListBody.innerHTML = '';

        if (!rooms || rooms.length === 0) {
            elements.roomListBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999;">No data</td></tr>`;
            return;
        }

        rooms.forEach(room => {
            let badgeClass = room.room_status; 
            if (room.room_status === 'under_maintenance') badgeClass = 'maintenance'; 
            
            const row = `
                <tr>
                    <td><strong>${room.room_number}</strong></td>
                    <td>${room.room_type}</td>
                    <td>${room.floor}</td>
                    <td><span class="badge ${badgeClass}">${room.room_status.replace('_', ' ')}</span></td>
                </tr>
            `;
            elements.roomListBody.innerHTML += row;
        });
    }

    function renderPaymentList(payments) {
        elements.paymentListBody.innerHTML = '';

        if (!payments || payments.length === 0) {
            elements.paymentListBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#999; padding: 15px;">No recent transactions</td></tr>`;
            return;
        }

        payments.forEach(pay => {
            const displayDate = pay.payment_date || pay.billing_date;

            let badgeClass = 'pending'; 
            if (pay.payment_status === 'paid') badgeClass = 'paid';
            else if (pay.payment_status === 'cancelled') badgeClass = 'cancelled';
            else if (pay.payment_status === 'overdue') badgeClass = 'overdue';

            const row = `
                <tr>
                    <td><strong>${pay.room_number}</strong></td>
                    <td style="color: #666;">${formatDate(displayDate)}</td>
                    <td style="font-weight: 500;">${formatCurrency(pay.total_amount)}</td>
                    <td><span class="badge ${badgeClass}" style="padding: 4px 10px; font-size: 11px;">${pay.payment_status}</span></td>
                </tr>
            `;
            elements.paymentListBody.innerHTML += row;
        });
    }

    // --- 4. Event Listeners ---
    function handleLogout() {
        sessionStorage.clear(); // ล้าง Session ทั้งหมด (Token, Role)
        // localStorage.clear(); // (Optional) ถ้าอยากล้าง Local ด้วยเผื่อมีขยะค้าง
        window.location.href = '../../index.html';
    }

    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Sidebar Toggle
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener('click', () => {
            elements.sidebar.classList.add('active');
            if (elements.sidebarOverlay) elements.sidebarOverlay.classList.add('active');
        });
    }

    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', () => {
            elements.sidebar.classList.remove('active');
            elements.sidebarOverlay.classList.remove('active');
        });
    }

    // Start App
    init();
});