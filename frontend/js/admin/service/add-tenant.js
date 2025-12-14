// add-tenant.js
const API_BASE = 'http://localhost:3030/api';
const TENANT_API = `${API_BASE}/tenants`;
let searchTimer;

// ตัวแปรสำหรับจัดการสถานะ 
let currentMode = 'add'; // 'add', 'edit', 'view'
let currentTenantId = null;

const saveBtn = document.getElementById('save-tenant-btn');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const tableBody = document.getElementById('tenant-table-body');
const modalOverlay = document.getElementById('modal-overlay'); // อ้างอิง Modal ตรงนี้ด้วย
const modalTitle = document.querySelector('.modal-title'); // *สมมติว่าคุณมี class นี้ที่หัวข้อ Modal
const form = document.getElementById('add-tenant-form'); // *สมมติว่าฟอร์มมี ID นี้

function getToken() {
    return sessionStorage.getItem('token');
}

// ฟังก์ชันจัดการ Form Submit (ทั้งเพิ่ม และ แก้ไข)
async function handleFormSubmit(event) {
    event.preventDefault();

    // ดึงค่าจาก Form
    const tenantData = {
        first_name: document.getElementById('first-name').value.trim(),
        last_name: document.getElementById('last-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone_number: document.getElementById('phone-number').value.trim(),
        start_date: document.getElementById('start-date').value.trim(),
        end_date: document.getElementById('end-date').value.trim() || null,
        building: document.getElementById('building').value.trim(),
        floor: document.getElementById('floor').value.trim(),
        room_number: document.getElementById('room-number').value.trim(),
        tenant_status: document.getElementById('tenant-status').value.trim(),
        deposit_amount: document.getElementById('deposit-amount').value.trim()
    };

    // Validation
    if (!tenantData.first_name || !tenantData.last_name || !tenantData.phone_number ||
        !tenantData.email || !tenantData.tenant_status || !tenantData.building ||
        !tenantData.room_number || !tenantData.floor || !tenantData.start_date || !tenantData.deposit_amount) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน (ยกเว้นวันสิ้นสุดสัญญา)');
        return;
    }

    try {
        const token = getToken();
        if (!token) {
            alert('กรุณาเข้าสู่ระบบก่อนทำรายการ');
            window.location.href = '/index.html';
            return;
        }

        let url = `${TENANT_API}`; 
        let method = 'POST';

        // ถ้า edit ส่ง id ผู้เช่าไปด้วย
        if (currentMode === 'edit') {
            url = `${TENANT_API}/${currentTenantId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tenantData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(currentMode === 'edit' ? 'แก้ไขข้อมูลสำเร็จ!' : 'เพิ่มผู้เช่าสำเร็จ!');
            closeModal(); // ปิด Modal
            getAllTenants(); // โหลดตารางใหม่
        } else {
            alert('เกิดข้อผิดพลาด: ' + (data.error || data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ไม่สามารถเชื่อมต่อ Server ได้');
    }
}

// ฟังก์ชันเปิด Modal
function openModal(mode, data = null) {
    currentMode = mode;
    modalOverlay.classList.add('active'); // แสดง Modal

    if(form) form.reset();

    // ตั้งค่าตามโหมด
    if (mode === 'add') {
        if(modalTitle) modalTitle.innerText = "Add New Tenant";
        saveBtn.style.display = 'block';
        saveBtn.innerText = 'Save';
        toggleInputs(true); // เปิดให้พิมพ์ได้
    } 
    else if (mode === 'edit') {
        if(modalTitle) modalTitle.innerText = "Edit Tenant";
        saveBtn.style.display = 'block';
        saveBtn.innerText = 'Save';
        currentTenantId = data.tenant_id;
        fillFormData(data);
        toggleInputs(true); // เปิดให้พิมพ์ได้
    } 
    else if (mode === 'view') {
        if(modalTitle) modalTitle.innerText = "View Tenant Infomaion";
        saveBtn.style.display = 'none';
        fillFormData(data);
        toggleInputs(false); // (Read-only)
    }
}

// ปิด Modal
function closeModal() {
    modalOverlay.classList.remove('active');
    currentMode = 'add';
    currentTenantId = null;
    if(form) form.reset();
}

// กรอกข้อมูลลงฟอร์ม 
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
    
    if(data.start_date) document.getElementById('start-date').value = data.start_date.split('T')[0];
    if(data.end_date) document.getElementById('end-date').value = data.end_date.split('T')[0];
}

// อนุญาติให้พิมม์หรือไม่
function toggleInputs(enable) {
    const inputs = document.querySelectorAll('#add-tenant-form input, #add-tenant-form select');
    inputs.forEach(input => {
        input.disabled = !enable;
    });
}

// ดึงข้อมูลผู้เช่ามาแสดง
async function getAllTenants() {
    try {
        const token = getToken();
        if (!token) return;

        const url = new URL(`${TENANT_API}/`);

        if (searchInput && searchInput.value.trim() !== '') {
            url.searchParams.append('search', searchInput.value.trim());
        }
        if (filterStatus && filterStatus.value !== 'all' && filterStatus.value !== '') {
            url.searchParams.append('status', filterStatus.value);
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch');
        const tenants = await response.json();

        tableBody.innerHTML = '';
        if (tenants.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">ไม่พบข้อมูลผู้เช่า</td></tr>';
            return;
        }

        tenants.forEach((tenant, index) => {
            const row = document.createElement('tr');
            const statusBadge = tenant.tenant_status === 'active' 
                ? `<span class="badge rented">${tenant.tenant_status}</span>` 
                : `<span class="badge vacated">${tenant.tenant_status}</span>`;
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${tenant.first_name} ${tenant.last_name}</td>
                <td>${tenant.room_number}</td> <td>${tenant.phone_number}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="action-btn view" onclick="getTenantAndOpenModal(${tenant.tenant_id}, 'view')"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" onclick="getTenantAndOpenModal(${tenant.tenant_id}, 'edit')"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching tenants:', error);
    }
}

// ปุ่ม action 
async function getTenantAndOpenModal(id, mode) {
    try {
        const token = getToken();
        const response = await fetch(`${TENANT_API}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(response.ok) {
            const tenant = await response.json();
            openModal(mode, tenant);
        } else {
            alert('ไม่สามารถดึงข้อมูลผู้เช่าได้');
        }
    } catch (error) {
        console.error(error);
        alert('Error fetching tenant details');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    getAllTenants();

    if (saveBtn) {
        saveBtn.addEventListener('click', handleFormSubmit);
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(getAllTenants, 500);
        });
    }

    if (filterStatus) {
        filterStatus.addEventListener('change', getAllTenants);
    }
    
    const addBtn = document.getElementById('add-tenant-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openModal('add');
        });
    }
});