// Config API
const API_BASE = 'http://localhost:3030/api';
const API_URL = `${API_BASE}/announcement`; // ตรวจสอบว่า Backend ใช้ 'announcements' (มี s)

// State
let currentMode = 'add'; // 'add' or 'edit'
let currentId = null;

// Elements
const tableBody = document.getElementById('announcement-table-body');
const modalOverlay = document.getElementById('modal-overlay');
const form = document.getElementById('add-announcement-form');
const addBtn = document.getElementById('add-announcement-btn');
const cancelBtn = document.getElementById('btn-cancel');
const modalTitle = document.getElementById('modal-title-text');
const searchInput = document.getElementById('search-announcement');
const filterStatus = document.getElementById('filter-status');

// Auth Check
function getToken() {
    return sessionStorage.getItem('token');
}

// --- 1. Load Data ---
async function loadAnnouncements() {
    const token = getToken();
    if (!token) {
        alert("Please login first");
        window.location.href = '../../index.html';
        return;
    }

    try {
        const res = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch data");

        let data = await res.json();

        // Client-side Filter & Search (เพื่อให้ไว โดยไม่ต้องแก้ Backend เพิ่ม)
        const searchText = searchInput.value.toLowerCase();
        const statusFilter = filterStatus.value;

        // Filter Logic
        data = data.filter(item => {
            const matchSearch = item.title.toLowerCase().includes(searchText) || 
                                item.content.toLowerCase().includes(searchText);
            const matchStatus = statusFilter === 'all' || statusFilter === '' ? true : item.announcements_status === statusFilter;
            return matchSearch && matchStatus;
        });

        renderTable(data);

    } catch (err) {
        console.error("Error:", err);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error loading data</td></tr>`;
    }
}

// --- 2. Render Table ---
function renderTable(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No announcements found</td></tr>`;
        return;
    }

    data.forEach((item, index) => {
        // จัดการวันที่ (Post Date = created_at, Visible = visible_until)
        const postDate = new Date(item.created_at).toLocaleDateString('en-GB');
        
        const visibleDate = item.visible_until 
            ? new Date(item.visible_until).toLocaleDateString('en-GB') 
            : '<span style="color:#007bff; font-weight:bold;">Forever</span>';

        // จัดการ Badge
        const statusClass = item.announcements_status === 'active' ? 'status-active' : 'status-inactive'; // คุณต้องมี css class นี้นะ หรือใช้ style inline
        const statusBadge = `<span style="padding: 4px 8px; border-radius: 12px; font-size: 0.85em; background: ${item.announcements_status === 'active' ? '#d4edda' : '#f8d7da'}; color: ${item.announcements_status === 'active' ? '#155724' : '#721c24'};">${item.announcements_status}</span>`;

        const row = `
            <tr>
                <td>${index + 1}</td>
                <td style="font-weight: 500;">${item.title}</td>
                <td>${item.content.substring(0, 50)}${item.content.length > 50 ? '...' : ''}</td>
                <td>${postDate}</td>
                <td>${visibleDate}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="action-btn" onclick="openEditModal(${item.announcement_id})" style="border:none; background:none; cursor:pointer; color:#f39c12; margin-right:5px;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="deleteAnnouncement(${item.announcement_id})" style="border:none; background:none; cursor:pointer; color:#e74c3c;">
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
    modalOverlay.classList.add('active'); // หรือ style.display = 'flex' แล้วแต่ CSS
    modalOverlay.style.display = 'flex'; // บังคับโชว์

    // Reset Form
    form.reset();

    if (mode === 'add') {
        modalTitle.innerText = "Create Announcement";
        document.getElementById('save-announcement-btn').innerText = "Post Now";
    } else {
        modalTitle.innerText = "Edit Announcement";
        document.getElementById('save-announcement-btn').innerText = "Save Changes";
        
        // Fill Data
        currentId = data.announcement_id;
        document.getElementById('ann-topic').value = data.title;
        document.getElementById('ann-desc').value = data.content;
        document.getElementById('ann-status').value = data.announcements_status;
        
        if(data.visible_until) {
            document.getElementById('ann-date').value = data.visible_until.split('T')[0];
        }
    }
}

// Function to fetch single item for edit
window.openEditModal = async (id) => {
    const token = getToken();
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if(res.ok) {
            openModal('edit', data);
        }
    } catch(err) {
        console.error(err);
        alert("Cannot load details");
    }
};

window.deleteAnnouncement = async (id) => {
    if(!confirm("Are you sure you want to delete this announcement?")) return;
    
    const token = getToken();
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(res.ok) {
            alert("Deleted successfully");
            loadAnnouncements();
        }
    } catch(err) {
        console.error(err);
    }
};

function closeModal() {
    modalOverlay.classList.remove('active');
    modalOverlay.style.display = 'none';
}

// --- 4. Submit Form ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getToken();

    // Get Values from Inputs (ต้องแก้ HTML ให้มี id ตามนี้)
    const topic = document.getElementById('ann-topic').value;
    const desc = document.getElementById('ann-desc').value;
    const status = document.getElementById('ann-status').value;
    let date = document.getElementById('ann-date').value;

    if(date === "") date = null; // Send null for Forever

    const payload = {
        title: topic,
        content: desc,
        announcements_status: status,
        visible_until: date
    };

    try {
        let url = API_URL;
        let method = 'POST';

        if(currentMode === 'edit') {
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

        if(res.ok) {
            alert("Success!");
            closeModal();
            loadAnnouncements();
        } else {
            const errorData = await res.json();
            alert("Error: " + (errorData.message || "Something went wrong"));
        }

    } catch(err) {
        console.error(err);
        alert("Server Error");
    }
});

// --- 5. Listeners ---
document.addEventListener('DOMContentLoaded', loadAnnouncements);
if(addBtn) addBtn.addEventListener('click', () => openModal('add'));
if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
if(searchInput) searchInput.addEventListener('input', loadAnnouncements); // Realtime search
if(filterStatus) filterStatus.addEventListener('change', loadAnnouncements);

// Sidebar Toggle (แถมให้)
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
if(menuToggle) {
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