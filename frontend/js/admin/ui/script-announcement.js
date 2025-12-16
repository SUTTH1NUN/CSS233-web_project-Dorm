// --- Configuration & Constants ---
const API_BASE = 'http://localhost:3030/api';
const ANNOUNCEMENT_API_URL = `${API_BASE}/announcement`; 

// --- State Management ---
let currentMode = 'add'; // 'add' | 'edit'
let currentId = null;
let allAnnouncements = []; // เก็บข้อมูลทั้งหมดไว้เพื่อทำ Filter หน้าบ้าน

// --- DOM Elements ---
const tableBody = document.getElementById('announcement-table-body');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title-text');
const form = document.getElementById('add-announcement-form');
const saveBtn = document.getElementById('save-announcement-btn');
const searchInput = document.getElementById('search-announcement');
const filterStatus = document.getElementById('filter-status');

// --- Helper Functions ---
const getToken = () => sessionStorage.getItem('token');

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
};

const getStatusBadge = (status) => {
    const isActive = status === 'active';
    const bgColor = isActive ? '#d4edda' : '#f8d7da';
    const textColor = isActive ? '#155724' : '#721c24';
    return `<span style="padding: 4px 8px; border-radius: 12px; font-size: 0.85em; background: ${bgColor}; color: ${textColor};">${status}</span>`;
};

// --- 1. Load Data ---
async function fetchAnnouncements() {
    const token = getToken();
    if (!token) {
        alert("Please login first");
        window.location.href = '../../index.html';
        return;
    }

    try {
        // ใช้ Endpoint ของ Admin เพื่อดูข้อมูลทั้งหมด (รวมที่ Inactive)
        const res = await fetch(`${ANNOUNCEMENT_API_URL}/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        const data = await res.json();
        allAnnouncements = data; // เก็บลงตัวแปร Global
        renderTable(); // แสดงผล

    } catch (err) {
        console.error("Fetch Error:", err);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error loading data</td></tr>`;
    }
}

// --- 2. Render Table (Filter Logic) ---
function renderTable() {
    const searchText = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;

    // Filter จากตัวแปร Global (ไม่ต้องยิง API ใหม่ทุกครั้งที่พิมพ์)
    const filteredData = allAnnouncements.filter(item => {
        const matchSearch = item.title.toLowerCase().includes(searchText) || 
                            item.content.toLowerCase().includes(searchText);
        const matchStatus = (statusFilter === 'all' || statusFilter === '') 
                            ? true 
                            : item.announcements_status === statusFilter;
        return matchSearch && matchStatus;
    });

    tableBody.innerHTML = '';

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No announcements found</td></tr>`;
        return;
    }

    filteredData.forEach((item, index) => {
        const visibleDate = item.visible_until 
            ? formatDate(item.visible_until) 
            : '<span style="color:#007bff; font-weight:bold;">Forever</span>';

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight: 500;">${item.title}</td>
                <td>${item.content.substring(0, 50)}${item.content.length > 50 ? '...' : ''}</td>
                <td>${formatDate(item.created_at)}</td>
                <td>${visibleDate}</td>
                <td>${getStatusBadge(item.announcements_status)}</td>
                <td>
                    <button class="action-btn" onclick="openEditModal(${item.announcement_id})" 
                        style="border:none; background:none; cursor:pointer; color:#f39c12; margin-right:5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="deleteAnnouncement(${item.announcement_id})" 
                        style="border:none; background:none; cursor:pointer; color:#e74c3c;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// --- 3. Modal Actions ---
function openModal(mode, data = null) {
    currentMode = mode;
    modalOverlay.classList.add('active'); 
    modalOverlay.style.display = 'flex';
    form.reset();

    if (mode === 'add') {
        modalTitle.innerText = "Create Announcement";
        saveBtn.innerText = "Post Now";
    } else {
        modalTitle.innerText = "Edit Announcement";
        saveBtn.innerText = "Save Changes";
        
        currentId = data.announcement_id;
        document.getElementById('ann-topic').value = data.title;
        document.getElementById('ann-desc').value = data.content;
        document.getElementById('ann-status').value = data.announcements_status;
        
        // แปลงวันที่สำหรับใส่ใน input type="date" (YYYY-MM-DD)
        if(data.visible_until) {
            document.getElementById('ann-date').value = new Date(data.visible_until).toISOString().split('T')[0];
        }
    }
}

function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.style.display = 'none';
    form.reset();
    currentId = null;
}

// Attached to window for HTML onclick access
window.openEditModal = async (id) => {
    // ดึงข้อมูลจาก Global Array ได้เลย ไม่ต้องยิง API ใหม่ (ลด Load Server)
    const item = allAnnouncements.find(a => a.announcement_id === id);
    if (item) {
        openModal('edit', item);
    } else {
        alert("Data not found");
    }
};

window.deleteAnnouncement = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    const token = getToken();
    try {
        const res = await fetch(`${ANNOUNCEMENT_API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json(); // อ่าน Error message จาก Backend
        
        if (res.ok) {
            alert("Deleted successfully");
            fetchAnnouncements(); // โหลดข้อมูลใหม่
        } else {
            alert("Delete failed: " + (data.message || 'Unknown error'));
        }
    } catch (err) {
        console.error(err);
        alert("Server Error");
    }
};

// --- 4. Form Submission ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getToken();

    const title = document.getElementById('ann-topic').value.trim();
    const content = document.getElementById('ann-desc').value.trim();
    const status = document.getElementById('ann-status').value;
    let visibleUntil = document.getElementById('ann-date').value;

    if (!visibleUntil) visibleUntil = null; 

    const payload = { 
        title, 
        content, 
        announcements_status: status, 
        visible_until: visibleUntil 
    };

    try {
        const url = currentMode === 'add' ? ANNOUNCEMENT_API_URL : `${ANNOUNCEMENT_API_URL}/${currentId}`;
        const method = currentMode === 'add' ? 'POST' : 'PUT';

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
            alert(data.message || "Success!");
            closeModal();
            fetchAnnouncements();
        } else {
            alert("Error: " + (data.message || "Something went wrong"));
        }

    } catch (err) {
        console.error(err);
        alert("Server Connection Error");
    }
});

// --- 5. Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAnnouncements();

    // ปุ่มเปิด Modal สร้างใหม่
    const addBtn = document.getElementById('add-announcement-btn');
    if (addBtn) addBtn.addEventListener('click', () => openModal('add'));

    // ปุ่มยกเลิกใน Modal
    const cancelBtn = document.getElementById('btn-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Search & Filter (เปลี่ยน event เป็น 'input' เพื่อให้ทำงานทันทีที่พิมพ์)
    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (filterStatus) filterStatus.addEventListener('change', renderTable);

    // ปิด Modal เมื่อคลิกพื้นหลัง
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Sidebar Toggle (เผื่อไว้ถ้ามีใช้ในหน้านี้)
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if(menuToggle && sidebar) {
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
});