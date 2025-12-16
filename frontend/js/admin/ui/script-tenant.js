document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_URL = 'http://localhost:3030/api/tenants';
    
    // --- State Variables ---
    let searchTimer; // สำหรับ Debounce การค้นหา
    let currentMode = 'add'; // 'add', 'edit', 'view'
    let currentTenantId = null;

    // --- UI Elements ---
    const tableBody = document.getElementById('tenant-table-body');
    const searchInput = document.getElementById('search-input');
    const filterStatus = document.getElementById('filter-status');
    
    // Modal & Form
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.querySelector('.modal-title');
    const form = document.getElementById('add-tenant-form');
    const saveBtn = document.getElementById('save-tenant-btn');
    const cancelBtn = document.querySelector('.btn-cancel');
    const addBtn = document.getElementById('add-tenant-btn');

    // Sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Helpers ---
    const getToken = () => sessionStorage.getItem('token'); 

    const formatDateForInput = (isoDate) => {
        if (!isoDate) return '';
        return new Date(isoDate).toISOString().split('T')[0];
    };

    // --- 1. Fetch Data (Server-Side Filter) ---
    async function fetchTenants() {
        const token = getToken();
        if (!token) {
            window.location.href = '../../index.html';
            return;
        }

        try {
            // สร้าง URL พร้อม Query Params สำหรับ Search/Filter
            const url = new URL(API_URL);
            
            if (searchInput && searchInput.value.trim()) {
                url.searchParams.append('search', searchInput.value.trim());
            }
            if (filterStatus && filterStatus.value !== 'all') {
                url.searchParams.append('status', filterStatus.value);
            }

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Handle Unauthorized
            if (res.status === 401 || res.status === 403) {
                alert('Session expired. Please login again.');
                sessionStorage.clear();
                window.location.href = '../../index.html';
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch data');

            const tenants = await res.json();
            renderTable(tenants);

        } catch (error) {
            console.error('Fetch Error:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error loading data</td></tr>`;
        }
    }

    // --- 2. Render Table ---
    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:#999;">No tenants found</td></tr>`;
            return;
        }

        data.forEach((tenant, index) => {
            const tr = document.createElement('tr');
            
            // Logic สี Badge Status
            let statusClass = 'rented'; // Default (Active)
            if (tenant.tenant_status === 'vacated') statusClass = 'vacated';
            else if (tenant.tenant_status === 'inactive') statusClass = 'vacated';

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${tenant.first_name} ${tenant.last_name}</td>
                <td><strong>${tenant.room_number}</strong></td> 
                <td>${tenant.phone_number}</td>
                <td><span class="badge ${statusClass}" style="padding: 4px 10px; font-size: 11px;">${tenant.tenant_status}</span></td>
                <td>
                    <button class="action-btn view" onclick="getTenantDetails(${tenant.tenant_id}, 'view')"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" onclick="getTenantDetails(${tenant.tenant_id}, 'edit')"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 3. Modal Logic ---

    // ฟังก์ชันนี้ถูกเรียกจาก HTML onclick (Global Scope)
    window.getTenantDetails = async (id, mode) => {
        const token = getToken();
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if(res.ok) {
                const tenant = await res.json();
                openModal(mode, tenant);
            } else {
                alert('Cannot fetch tenant details');
            }
        } catch (error) {
            console.error(error);
            alert('Server Error');
        }
    };

    function openModal(mode, data = null) {
        currentMode = mode;
        currentTenantId = data ? data.tenant_id : null;
        modalOverlay.classList.add('active');
        
        form.reset(); // Clear old data

        // Toggle Inputs based on Mode
        const isView = (mode === 'view');
        toggleInputs(!isView);

        // UI Setup
        if (mode === 'add') {
            modalTitle.innerText = "Add New Tenant";
            saveBtn.style.display = 'block';
            saveBtn.innerText = 'Save';
            // Set Default
            document.getElementById('tenant-status').value = 'active';
            document.getElementById('start-date').value = new Date().toISOString().split('T')[0];
        } 
        else {
            // Fill Data (Edit / View)
            if (mode === 'edit') {
                modalTitle.innerText = "Edit Tenant";
                saveBtn.style.display = 'block';
                saveBtn.innerText = 'Save Changes';
            } else {
                modalTitle.innerText = "View Tenant Info";
                saveBtn.style.display = 'none';
            }
            fillFormData(data);
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        form.reset();
        currentMode = 'add';
        currentTenantId = null;
    }

    function fillFormData(data) {
        document.getElementById('first-name').value = data.first_name || '';
        document.getElementById('last-name').value = data.last_name || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('phone-number').value = data.phone_number || '';
        document.getElementById('building').value = data.building || '';
        document.getElementById('floor').value = data.floor || '';
        document.getElementById('room-number').value = data.room_number || '';
        document.getElementById('tenant-status').value = data.tenant_status || 'active';
        document.getElementById('deposit-amount').value = data.deposit_amount || '';
        
        // Date Formatting for Input
        if(data.start_date) document.getElementById('start-date').value = formatDateForInput(data.start_date);
        if(data.end_date) document.getElementById('end-date').value = formatDateForInput(data.end_date);
    }

    function toggleInputs(enable) {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = !enable);
    }

    // --- 4. Form Submission (Add/Edit) ---
    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // 1. Get Values
        const payload = {
            first_name: document.getElementById('first-name').value.trim(),
            last_name: document.getElementById('last-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone_number: document.getElementById('phone-number').value.trim(),
            start_date: document.getElementById('start-date').value,
            end_date: document.getElementById('end-date').value || null,
            building: document.getElementById('building').value.trim(),
            floor: document.getElementById('floor').value.trim(),
            room_number: document.getElementById('room-number').value.trim(),
            tenant_status: document.getElementById('tenant-status').value,
            deposit_amount: document.getElementById('deposit-amount').value
        };

        // 2. Simple Validation
        if (!payload.first_name || !payload.room_number || !payload.start_date) {
            alert('กรุณากรอกข้อมูลสำคัญให้ครบ (ชื่อ, ห้อง, วันเริ่มสัญญา)');
            return;
        }

        const token = getToken();
        let url = API_URL;
        let method = 'POST';

        if (currentMode === 'edit') {
            url = `${API_URL}/${currentTenantId}`;
            method = 'PUT';
        }

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || (currentMode === 'edit' ? 'Update Success' : 'Create Success'));
                closeModal();
                fetchTenants(); // Reload Table
            } else {
                alert('Error: ' + (data.message || 'Unknown error'));
            }

        } catch (error) {
            console.error('Submit Error:', error);
            alert('Server Error');
        }
    });

    // --- 5. Event Listeners ---

    // Search with Debounce (ป้องกันการยิง API ถี่เกินไป)
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(fetchTenants, 500); // รอ 0.5 วิหลังหยุดพิมพ์ค่อยค้นหา
        });
    }

    // Filter Status
    if (filterStatus) {
        filterStatus.addEventListener('change', fetchTenants);
    }

    // Modal Actions
    if(addBtn) addBtn.addEventListener('click', () => openModal('add'));
    if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if(modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if(e.target === modalOverlay) closeModal();
        });
    }

    // Sidebar
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if(sidebarOverlay) sidebarOverlay.classList.add('active');
        });
    }
    if(sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // Logout
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = '../../index.html';
        });
    }

    // Init
    fetchTenants();
});