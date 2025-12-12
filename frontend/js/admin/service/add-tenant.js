const API_BASE = 'http://localhost:3030/api'; 
const TENANT_API = `${API_BASE}/tenants`;
let searchTimer;

const saveBtn = document.getElementById('save-tenant-btn');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const tableBody = document.getElementById('tenant-table-body');

function getToken() {
    return sessionStorage.getItem('token');
}

// --- ฟังก์ชันเพิ่มผู้เช่า ---
async function addTenant(event) {
    event.preventDefault();

    const first_name = document.getElementById('first-name').value.trim();
    const last_name = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone_number = document.getElementById('phone-number').value.trim();
    const start_date = document.getElementById('start-date').value.trim();
    const end_date = document.getElementById('end-date').value.trim();
    const building = document.getElementById('building').value.trim();
    const floor = document.getElementById('floor').value.trim();
    const room_number = document.getElementById('room-number').value.trim();
    const tenant_status = document.getElementById('tenant-status').value.trim();
    const deposit_amount = document.getElementById('deposit-amount').value.trim();

    // Validation (ตรวจสอบความครบถ้วน)
    if(!first_name || !last_name || !phone_number || !email || !tenant_status 
        || !building || !room_number || !floor 
        || !start_date || !deposit_amount){
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

        const response = await fetch(`${TENANT_API}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                first_name, last_name, email, phone_number, tenant_status,
                building, floor, room_number,
                start_date, 
                end_date: end_date || null,
                deposit_amount
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('เพิ่มผู้เช่าสำเร็จ!');
            document.getElementById('add-tenant-form').reset();
            
            getAllTenants(); 
            
        } else {
            alert('เกิดข้อผิดพลาด: ' + (data.error || data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ไม่สามารถเชื่อมต่อ Server ได้');
    }
}

// --- ฟังก์ชันดึงข้อมูลผู้เช่าทั้งหมด ---
async function getAllTenants() {
    try {
        const token = getToken();

        if (!token) return;

        const url = new URL(`${TENANT_API}/`);

        if (searchInput && searchInput.value.trim() !== '') {
            url.searchParams.append('search', searchInput.value.trim());
        }

        if (filterStatus && filterStatus.value !== 'all') {
            url.searchParams.append('status', filterStatus.value);
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // อ่านข้อความที่ Server ด่ากลับมา
            throw new Error(`Server Error (${response.status}): ${errorText}`);
        }
        const tenants = await response.json();


        
        // เคลียร์ข้อมูลเก่าก่อน
        tableBody.innerHTML = '';

        if (tenants.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">ไม่พบข้อมูลผู้เช่า</td></tr>';
            return;
        }

        // วนลูปสร้างแถวในตาราง
        tenants.forEach((tenant, index) => {
            const row = document.createElement('tr');
            
            const statusBadge = tenant.tenant_status === 'active' 
                ? '<span class="badge rented">' + tenant.tenant_status + '</span>' 
                : '<span class="badge vacated">' + tenant.tenant_status + '</span>';

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${tenant.first_name} ${tenant.last_name}</td>
                <td>${tenant.room_number}</td> <td>${tenant.phone_number}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="action-btn view" onclick="viewTenant(${tenant.tenant_id})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" onclick="editTenant(${tenant.tenant_id})"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching tenants:', error);
    }
}
function viewTenant(id) {
    console.log("View Tenant ID:", id);
    alert("Function ดูข้อมูลกำลังพัฒนา (ID: " + id + ")");
    // window.location.href = `/tenant-detail.html?id=${id}`;
}

function editTenant(id) {
    console.log("Edit Tenant ID:", id);
    alert("Function แก้ไขกำลังพัฒนา (ID: " + id + ")");
}

document.addEventListener('DOMContentLoaded', () => {
    
    getAllTenants();

    // Listener: ปุ่ม Save
    if (saveBtn) {
        saveBtn.addEventListener('click', addTenant);
    }

    // Listener: ช่องค้นหา (Search)
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimer); // ล้าง Timer เก่า
            searchTimer = setTimeout(() => {
                getAllTenants(); // รอ 0.5 วิ แล้วค่อยค้นหา
            }, 500);
        });
    }

    // Listener: Dropdown เปลี่ยนสถานะ
    if (filterStatus) {
        filterStatus.addEventListener('change', getAllTenants);
    }
});