document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3030/api/rooms';
    
    // Elements
    const tableBody = document.getElementById('room-table-body');
    const searchInput = document.getElementById('search-room');
    const filterSelect = document.getElementById('filter-status');
    const addBtn = document.getElementById('add-room-btn');
    
    // Modal Elements
    const modal = document.getElementById('modal-overlay');
    const modalTitle = document.querySelector('.modal-title');
    const form = document.getElementById('room-form');
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

    // State
    let allRooms = [];
    let roomTypes = []; 
    let currentMode = 'add'; // add, edit, view
    let currentRoomId = null;
    
    // --- 1. Fetch Room Types (เพื่อเอาไปใส่ Dropdown และ Map ข้อมูล) ---
    async function fetchRoomTypes() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/types`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            roomTypes = await res.json();
            populateTypeDropdown();
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    }

    function populateTypeDropdown() {
        mType.innerHTML = '';
        roomTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.room_type;
            option.textContent = type.room_type;
            mType.appendChild(option);
        });
    }

    // Event: เมื่อเปลี่ยน Type ให้เปลี่ยนราคา/ขนาด อัตโนมัติ
    mType.addEventListener('change', () => {
        const selectedType = roomTypes.find(t => t.room_type === mType.value);
        if (selectedType) {
            mSize.value = selectedType.room_size;
            mPrice.value = selectedType.room_price;
            mFurn.value = selectedType.room_furniture;
        }
    });

    // --- 2. Fetch Rooms ---
    async function fetchRooms() {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            allRooms = await res.json();
            renderTable(allRooms);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error loading data</td></tr>`;
        }
    }

    function renderTable(rooms) {
        tableBody.innerHTML = '';
        if (rooms.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">No rooms found</td></tr>`;
            return;
        }

        rooms.forEach(room => {
            const tr = document.createElement('tr');
            let badgeClass = room.room_status;
            if(badgeClass == 'under_maintenance') badgeClass = 'maintenance';
            tr.innerHTML = `
                <td>Building ${room.building}</td>
                <td>${room.floor}</td>
                <td><strong>${room.room_number}</strong></td>
                <td>${room.room_type}</td>
                <td><span class="badge ${badgeClass}">${badgeClass}</span></td>
                <td>
                    <button class="action-btn view" data-id="${room.room_id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" data-id="${room.room_id}"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 3. Modal Logic (Add / Edit / View) ---
    function openModal(mode, roomId = null) {
        currentMode = mode;
        currentRoomId = roomId;
        modal.classList.add('active');

        // Reset Inputs
        mRoomNo.value = '';
        mFloor.value = '';
        mBuilding.value = 'A';
        mStatus.value = 'available';
        
        // Default Type values
        if(roomTypes.length > 0) {
            mType.value = roomTypes[0].room_type;
            mType.dispatchEvent(new Event('change')); // Trigger auto-fill
        }

        if (mode === 'add') {
            modalTitle.textContent = 'Add New Room';
            setFormEditable(true);
            btnSave.style.display = 'inline-block';
            btnSave.textContent = 'Add Room';
        } else {
            const room = allRooms.find(r => r.room_id == roomId);
            if (!room) return;

            // Fill Data
            mRoomNo.value = room.room_number;
            mBuilding.value = room.building;
            mFloor.value = room.floor;
            mType.value = room.room_type;
            mStatus.value = room.room_status;
            
            // Trigger Change to fill readonly fields
            mType.dispatchEvent(new Event('change'));

            if (mode === 'edit') {
                modalTitle.textContent = 'Edit Room Details';
                setFormEditable(true);
                btnSave.style.display = 'inline-block';
                btnSave.textContent = 'Save Changes';
            } else { // View
                modalTitle.textContent = 'Room Details';
                setFormEditable(false);
                btnSave.style.display = 'none';
            }
        }
    }

    function setFormEditable(isEditable) {
        mRoomNo.disabled = !isEditable;
        mBuilding.disabled = !isEditable;
        mFloor.disabled = !isEditable;
        mType.disabled = !isEditable;
        mStatus.disabled = !isEditable;
    }

    // --- 4. Event Listeners ---

    // Click on Table (View/Edit)
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

    // Add Button
    addBtn.addEventListener('click', () => {
        openModal('add');
    });

    // Save Button (Submit)
    btnSave.addEventListener('click', async () => {
        const payload = {
            room_number: mRoomNo.value,
            building: mBuilding.value,
            floor: mFloor.value,
            room_type: mType.value,
            room_status: mStatus.value
        };

        const token = localStorage.getItem('token');
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

            if (res.ok) {
                alert(currentMode === 'add' ? 'Room added!' : 'Room updated!');
                closeModal();
                fetchRooms();
            } else {
                alert('Operation failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Search & Filter
    function filterRooms() {
        const text = searchInput.value.toLowerCase().trim();
        let status = filterSelect.value;

        if(filterSelect.value === 'maintenance') status = 'under_maintenance';
        
        const filtered = allRooms.filter(r => {
            const matchText = r.room_number.toLowerCase().includes(text);
            const matchStatus = status === 'all' || r.room_status === status;
            return matchText && matchStatus;
        });
        renderTable(filtered);
    }
    searchInput.addEventListener('input', filterRooms);
    filterSelect.addEventListener('change', filterRooms);

    // Modal Close
    function closeModal() {
        modal.classList.remove('active');
    }
    btnCancel.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });

    // Sidebar
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
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
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
    });

    // Init
    fetchRoomTypes().then(() => fetchRooms());
});