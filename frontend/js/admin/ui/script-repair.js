// =========================================
// 1. CONFIG & AUTH
// =========================================
const API_BASE = 'http://localhost:3030/api';
const API_URL = `${API_BASE}/repairs`;

function getToken() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = '../../index.html';
        return null;
    }
    return token;
}

// =========================================
// 2. STATE & ELEMENTS
// =========================================
let allRepairs = [];
let currentId = null;

// Elements (ประกาศไว้นอกสุดเพื่อให้เรียกใช้ได้ทุกฟังก์ชัน)
let tableBody, searchInput, filterStatus;
let modalOverlay, repairForm, btnCancel, saveBtn;
let modalTitleInput, modalRoomInput, modalDescInput, modalStatusInput, modalCommentInput;

// =========================================
// 3. MAIN LOGIC (API & RENDER)
// =========================================

// โหลดข้อมูลแจ้งซ่อม
async function loadRepairs() {
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch repairs");

        allRepairs = await res.json();
        renderTable(allRepairs);

    } catch (err) {
        console.error(err);
        if(tableBody) tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error loading data</td></tr>`;
    }
}

// แสดงตาราง
function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No repair requests found</td></tr>`;
        return;
    }

    data.forEach((item, index) => {
        // จัดการวันที่
        const dateStr = new Date(item.created_at).toLocaleDateString('en-GB');

        // จัดการสี Badge
        let badgeStyle = '';
        if(item.status === 'pending') badgeStyle = 'background:#ffc107; color:#000;';
        if(item.status === 'in_progress') badgeStyle = 'background:#17a2b8; color:#fff;';
        if(item.status === 'completed') badgeStyle = 'background:#28a745; color:#fff;';
        if(item.status === 'cancelled') badgeStyle = 'background:#dc3545; color:#fff;';

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight:600;">${item.room_number || ''}</td>
                <td>
                    <div style="font-weight:500;">${item.title}</div>
                </td>
                <td title="${item.description}">
                    ${item.description.substring(0, 30)}${item.description.length > 30 ? '...' : ''}
                </td>
                <td><span style="padding:4px 8px; border-radius:12px; font-size:0.85em; ${badgeStyle}">${item.status}</span></td>
                <td>
                    <button class="action-btn edit" onclick="window.openEditModal(${item.repair_id})">
                        <i class="fas fa-pen"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// กรองข้อมูล (Search & Filter)
function applyFilter() {
    const searchText = searchInput.value.toLowerCase();
    const statusVal = filterStatus.value;

    const filtered = allRepairs.filter(item => {
        const matchSearch = 
            (item.title && item.title.toLowerCase().includes(searchText)) ||
            (item.room_number && item.room_number.toLowerCase().includes(searchText)) ||
            (item.first_name && item.first_name.toLowerCase().includes(searchText));
        
        const matchStatus = statusVal === 'all' || statusVal === '' ? true : item.status === statusVal;

        return matchSearch && matchStatus;
    });

    renderTable(filtered);
}

// =========================================
// 4. MODAL FUNCTIONS
// =========================================

// เปิด Modal (ต้องเป็น window function เพื่อเรียกจาก HTML)
window.openEditModal = (id) => {
    const item = allRepairs.find(r => r.repair_id === id);
    if (!item) return;

    currentId = id;
    
    // ใส่ข้อมูลลงฟอร์ม
    if(document.getElementById('repair-id')) document.getElementById('repair-id').value = item.repair_id;
    if(modalTitleInput) modalTitleInput.value = item.title;
    if(modalRoomInput) modalRoomInput.value = `${item.building || ''}-${item.room_number || ''}`;
    if(document.getElementById('repair-date')) document.getElementById('repair-date').value = new Date(item.created_at).toLocaleDateString('en-GB');
    if(modalDescInput) modalDescInput.value = item.description;
    if(modalStatusInput) modalStatusInput.value = item.status;
    if(modalCommentInput) modalCommentInput.value = item.admin_comment || '';

    // แสดง Modal
    modalOverlay.classList.add('active');
    modalOverlay.style.display = 'flex';
};

// ปิด Modal
function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.style.display = 'none';
    currentId = null;
    if(repairForm) repairForm.reset();
}

// =========================================
// 5. EVENT LISTENERS (Run on Load)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 5.1 ผูกตัวแปรกับ HTML ---
    tableBody = document.getElementById('table-body');
    searchInput = document.getElementById('search-repair');
    filterStatus = document.getElementById('filter-status');
    
    modalOverlay = document.getElementById('modal-overlay');
    repairForm = document.getElementById('repair-form');
    btnCancel = document.querySelector('.btn-cancel'); // หรือใช้ id 'btn-cancel'
    
    // Inputs ใน Modal
    modalTitleInput = document.getElementById('repair-topic');
    modalRoomInput = document.getElementById('repair-room');
    modalDescInput = document.getElementById('repair-desc');
    modalStatusInput = document.getElementById('repair-status');
    modalCommentInput = document.getElementById('repair-comment');

    // --- 5.2 Sidebar Logic (จากไฟล์ที่คุณส่งมา) ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (menuToggle && sidebar) {
        // เมื่อกดปุ่ม 3 ขีด
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active'); 
            if(sidebarOverlay) sidebarOverlay.classList.add('active');
        });

        // เมื่อกดพื้นหลังสีดำ (Overlay)
        if(sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active'); 
                sidebarOverlay.classList.remove('active'); 
            });
        }
    }

    // --- 5.3 Filter Events ---
    if(searchInput) searchInput.addEventListener('input', applyFilter);
    if(filterStatus) filterStatus.addEventListener('change', applyFilter);

    // --- 5.4 Modal Action Events ---
    // ปุ่ม Add Repair (ถ้ามีในหน้า Admin)
    const addBtn = document.getElementById('add-repair-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            // ถ้าจะให้ Admin เพิ่มรายการได้ ก็เปิด Modal ตรงนี้
            // หรือเคลียร์ค่า form แล้วเปิด
            repairForm.reset();
            modalOverlay.classList.add('active');
            modalOverlay.style.display = 'flex';
        });
    }

    // ปุ่ม Cancel
    if (btnCancel) {
        btnCancel.addEventListener('click', closeModal);
    }

    // กดพื้นหลัง Modal เพื่อปิด
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // --- 5.5 Form Submit (Update Status) ---
    if (repairForm) {
        repairForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = getToken();

            // ดึงค่า status และ comment
            const payload = {
                status: modalStatusInput ? modalStatusInput.value : 'pending',
                admin_comment: modalCommentInput ? modalCommentInput.value : ''
            };

            try {
                // เช็คว่าเป็นการ Edit หรือ Add (ถ้ามี ID = Edit)
                let url = API_URL;
                let method = 'POST';
                
                if (currentId) {
                    url = `${API_URL}/${currentId}`;
                    method = 'PUT';
                }

                const res = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert("Saved successfully!");
                    closeModal();
                    loadRepairs(); // โหลดข้อมูลใหม่
                } else {
                    const errData = await res.json();
                    alert("Error: " + errData.message);
                }

            } catch (err) {
                console.error(err);
                alert("Server Error");
            }
        });
    }

    // --- 5.6 Start App ---
    loadRepairs();
});