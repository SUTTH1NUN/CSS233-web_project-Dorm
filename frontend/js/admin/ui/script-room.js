document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_URL = 'http://localhost:3030/api/rooms';
    
    // --- State Variables ---
    let allRooms = [];
    let roomTypes = []; 
    let currentMode = 'add'; // 'add', 'edit', 'view'
    let currentRoomId = null;

    // --- UI Elements ---
    const tableBody = document.getElementById('room-table-body');
    const searchInput = document.getElementById('search-room');
    const filterSelect = document.getElementById('filter-status');
    const addBtn = document.getElementById('add-room-btn');
    
    // Modal & Form
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.querySelector('.modal-title');
    const btnCancel = document.querySelector('.btn-cancel');
    const btnSave = document.getElementById('save-room-btn');

    // Inputs
    const mRoomNo = document.getElementById('m-room-no');
    const mBuilding = document.getElementById('m-building');
    const mFloor = document.getElementById('m-floor');
    const mType = document.getElementById('m-type');
    const mStatus = document.getElementById('m-status');
    const mSize = document.getElementById('m-size');
    const mPrice = document.getElementById('m-price');
    const mFurn = document.getElementById('m-furniture');

    // Sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Helpers ---
    // ✅ ใช้ sessionStorage สำหรับ Admin (ตามที่คุยกันในไฟล์ Dashboard)
    const getToken = () => sessionStorage.getItem('token'); 

    // --- 1. Fetch Data Functions ---

    // 1.1 ดึงประเภทห้อง (Room Types)
    async function fetchRoomTypes() {
        const token = getToken();
        if (!token) return; // ถ้าไม่มี Token เดี๋ยว fetchRooms จะจัดการ Redirect เอง

        try {
            const res = await fetch(`${API_URL}/types`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch types');
            
            const data = await res.json();
            
            if (Array.isArray(data)) {
                roomTypes = data;
                populateTypeDropdown();
            }

        } catch (error) {
            console.error('Error fetching types:', error);
        }
    }

    // 1.2 ดึงข้อมูลห้องพัก (Rooms)
    async function fetchRooms() {
        const token = getToken();
        if (!token) {
            window.location.href = '../../index.html';
            return;
        }

        try {
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401 || res.status === 403) {
                alert('Session expired. Please login again.');
                sessionStorage.clear();
                window.location.href = '../../index.html';
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch rooms');
            
            const data = await res.json();
            
            if (Array.isArray(data)) {
                allRooms = data;
                filterAndRender(); // เรียกผ่านฟังก์ชัน Filter เพื่อแสดงผล
            } else {
                console.error("Invalid Data Format:", data);
            }

        } catch (error) {
            console.error('Fetch Rooms Error:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error loading data</td></tr>`;
        }
    }

    // --- 2. Render Functions ---

    function populateTypeDropdown() {
        mType.innerHTML = '';
        roomTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.room_type;
            option.textContent = type.room_type;
            mType.appendChild(option);
        });
    }

    function renderTable(rooms) {
        tableBody.innerHTML = '';
        if (rooms.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">No rooms found</td></tr>`;
            return;
        }

        rooms.forEach(room => {
            const tr = document.createElement('tr');
            
            // Logic จัดการ CSS Class ของ Badge
            let badgeClass = room.room_status;
            if(badgeClass === 'under_maintenance') badgeClass = 'maintenance';
            
            const displayStatus = room.room_status.replace('_', ' ');

            tr.innerHTML = `
                <td>${room.building}</td>
                <td>${room.floor}</td>
                <td><strong>${room.room_number}</strong></td>
                <td>${room.room_type}</td>
                <td><span class="badge ${badgeClass}">${displayStatus}</span></td>
                <td>
                    <button class="action-btn view" data-id="${room.room_id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" data-id="${room.room_id}"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 3. Filter Logic ---
    function filterAndRender() {
        const searchText = searchInput.value.toLowerCase().trim();
        let statusValue = filterSelect.value;

        // Map value จาก dropdown ให้ตรงกับ Database enum
        if(statusValue === 'maintenance') statusValue = 'under_maintenance';
        
        const filtered = allRooms.filter(r => {
            const matchText = r.room_number.toLowerCase().includes(searchText);
            const matchStatus = (statusValue === 'all') || (r.room_status === statusValue);
            return matchText && matchStatus;
        });

        renderTable(filtered);
    }

    // --- 4. Modal Logic ---
    
    function openModal(mode, roomId = null) {
        currentMode = mode;
        currentRoomId = roomId;
        modal.classList.add('active');

        // Reset Common Inputs
        mRoomNo.value = '';
        mFloor.value = '';
        mBuilding.value = 'A'; // Default
        mStatus.value = 'available'; // Default
        
        // Set Default Type (Trigger change event to fill price/size)
        if(roomTypes.length > 0) {
            mType.value = roomTypes[0].room_type;
            mType.dispatchEvent(new Event('change'));
        }

        if (mode === 'add') {
            modalTitle.textContent = 'Add New Room';
            setFormEditable(true);
            btnSave.style.display = 'inline-block';
            btnSave.textContent = 'Add Room';
        } else {
            // Find room data from state
            const room = allRooms.find(r => r.room_id == roomId);
            if (!room) return;

            // Fill Data
            mRoomNo.value = room.room_number;
            mBuilding.value = room.building;
            mFloor.value = room.floor;
            mType.value = room.room_type;
            mStatus.value = room.room_status;
            
            // Trigger Change to fill readonly fields (Price/Size)
            mType.dispatchEvent(new Event('change'));

            if (mode === 'edit') {
                modalTitle.textContent = 'Edit Room Details';
                setFormEditable(true);
                btnSave.style.display = 'inline-block';
                btnSave.textContent = 'Save Changes';
            } else { // View Mode
                modalTitle.textContent = 'Room Details';
                setFormEditable(false);
                btnSave.style.display = 'none';
            }
        }
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    function setFormEditable(isEditable) {
        mRoomNo.disabled = !isEditable;
        mBuilding.disabled = !isEditable;
        mFloor.disabled = !isEditable;
        mType.disabled = !isEditable;
        mStatus.disabled = !isEditable;
    }

    // --- 5. Event Listeners ---

    // 5.1 Dropdown Change (Auto-fill Price/Size/Furniture)
    mType.addEventListener('change', () => {
        const selectedType = roomTypes.find(t => t.room_type === mType.value);
        if (selectedType) {
            mSize.value = selectedType.room_size;
            mPrice.value = selectedType.room_price;
            mFurn.value = selectedType.room_furniture || '-';
        }
    });

    // 5.2 Table Actions (Delegate Event)
    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.action-btn');
        if (!btn) return;

        const id = btn.dataset.id;
        if (btn.classList.contains('edit')) {
            openModal('edit', id);
        } else {
            openModal('view', id);
        }
    });

    // 5.3 Save Button (Create / Update)
    btnSave.addEventListener('click', async () => {
        const token = getToken();
        if (!token) {
            window.location.href = '../../index.html';
            return;
        }

        const payload = {
            room_number: mRoomNo.value,
            building: mBuilding.value,
            floor: mFloor.value,
            room_type: mType.value,
            room_status: mStatus.value
        };

        let url = API_URL;
        let method = 'POST';

        if (currentMode === 'edit') {
            url = `${API_URL}/${currentRoomId}`;
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
                alert(data.message || (currentMode === 'add' ? 'Room added!' : 'Room updated!'));
                closeModal();
                fetchRooms(); // Refresh Data
            } else {
                alert('Operation failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Save Error:', error);
            alert('Server Error');
        }
    });

    // 5.4 Search & Filter
    searchInput.addEventListener('input', filterAndRender);
    filterSelect.addEventListener('change', filterAndRender);

    // 5.5 Modal & Sidebar UI
    addBtn.addEventListener('click', () => openModal('add'));
    btnCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });

    if (menuToggle && sidebar) {
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

    // 5.6 Logout
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear(); // Clear Session for Admin
            window.location.href = '../../index.html';
        });
    }

    // --- Init ---
    // โหลด Types ก่อน แล้วค่อยโหลด Rooms เพื่อให้ Dropdown พร้อมใช้งาน
    fetchRoomTypes().then(() => fetchRooms());
});