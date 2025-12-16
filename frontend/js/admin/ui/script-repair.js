document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3030/api/repairs';
    const SERVER_URL = 'http://localhost:3030';
    // --- UI Elements ---
    const tableBody = document.getElementById('table-body');
    const modal = document.getElementById('modal-overlay');
    const btnCancel = document.getElementById('btn-cancel');
    const closeX = document.getElementById('close-x');
    const repairForm = document.getElementById('repair-form');
    const searchInput = document.getElementById('search-repair');
    const filterSelect = document.getElementById('filter-status');
    const modalTitle = document.querySelector('.modal-title');
    const saveBtn = document.getElementById('save-repair-btn');
    
    // --- Form Inputs (Admin Modal) ---
    const mId = document.getElementById('repair-id');
    const mRoom = document.getElementById('repair-room');
    const mTopic = document.getElementById('repair-topic');
    const mDesc = document.getElementById('repair-desc');
    const mPhone = document.getElementById('repair-phone');
    const mPhotoArea = document.getElementById('photo-display-area'); // พื้นที่โชว์รูป
    const mComment = document.getElementById('repair-comment');
    const mStatus = document.getElementById('repair-status');
    const mResolvedDate = document.getElementById('repair-resolved-date');
    const resolvedGroup = document.getElementById('resolved-group');

    // --- Admin Image Upload Elements (Optional) ---
    const adminFileInput = document.getElementById('admin-file-input'); 
    const btnChangePhoto = document.getElementById('btn-change-photo');

    // --- Sidebar & Logout ---
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const logoutBtn = document.getElementById('logout-btn');

    let allRepairs = [];
    const token = sessionStorage.getItem('token');

    // --- 1. Fetch All Repairs (Load Table) ---
    async function fetchRepairs() {
        try {
            if (!token) {
                alert('Please login first');
                window.location.href = '../../index.html';
                return;
            }

            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                alert('Session expired');
                sessionStorage.removeItem('token');
                window.location.href = '../../index.html';
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch');
            
            allRepairs = await response.json();
            renderTable(allRepairs);
        } catch (error) {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:red;">Error loading data</td></tr>`;
        }
    }

    // --- 2. Render Table ---
    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:#999;">No repairs found.</td></tr>`;
            return;
        }

        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            
            let badgeClass = 'pending';
            if (item.repair_status === 'in_progress') badgeClass = 'process';
            else if (item.repair_status === 'completed') badgeClass = 'completed';
            else if (item.repair_status === 'cancelled') badgeClass = 'cancelled';

            const statusText = item.repair_status.replace('_', ' ');

            tr.innerHTML = `
                <td style="text-align: center;">${index + 1}</td>
                <td style="font-weight: 500;">${item.room_number}</td>
                <td>${item.issue_title}</td>
                <td>${item.first_name} ${item.last_name}</td>
                <td><span class="badge ${badgeClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn view" data-id="${item.repair_id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" data-id="${item.repair_id}"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 3. Filter Logic ---
    function filterRepairs() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusFilter = filterSelect.value;

        const filteredData = allRepairs.filter(item => {
            const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
            const matchesSearch = 
                item.room_number.toLowerCase().includes(searchTerm) ||
                item.issue_title.toLowerCase().includes(searchTerm) ||
                fullName.includes(searchTerm);
            const matchesStatus = (statusFilter === 'all') || (item.repair_status === statusFilter);
            return matchesSearch && matchesStatus;
        });
        renderTable(filteredData);
    }

    if(searchInput) searchInput.addEventListener('input', filterRepairs);
    if(filterSelect) filterSelect.addEventListener('change', filterRepairs);

    // --- 4. Open Modal (View/Edit) ---
    tableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.action-btn');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        const isEditMode = btn.classList.contains('edit');

        try {
            // ดึงข้อมูลล่าสุดจาก Server
            const res = await fetch(`${API_URL}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if(!res.ok) throw new Error('Failed to load detail');
            const data = await res.json();

            // เติมข้อมูลลง Form
            mId.value = data.repair_id;
            mRoom.value = data.room_number;
            mTopic.value = data.issue_title;
            mDesc.value = data.issue_description;
            mPhone.value = data.phone_number || '-';
            mComment.value = data.admin_note || '';
            mStatus.value = data.repair_status;

            // --- Image Logic (แสดงรูปจาก Server) ---
            if (data.img_path) {
                const fullImgUrl = `${SERVER_URL}${data.img_path}`;

                mPhotoArea.innerHTML = `
                    <img src="${fullImgUrl}" class="attached-image" alt="Evidence" style="max-width: 100%; border-radius: 8px;">
                    <p style="text-align:center; font-size:12px; color:#666; margin-top:5px;"></p>
                `;
            } else {
                mPhotoArea.innerHTML = `
                    <div class="photo-placeholder" style="text-align:center; padding:20px; background:#f9f9f9; border-radius:8px;">
                        <i class="fas fa-image" style="font-size:30px; color:#ccc;"></i>
                        <p style="color:#999; font-size:12px;">No photo attached</p>
                    </div>`;
            }

            // Reset Admin File Input (ถ้ามี)
            if(adminFileInput) adminFileInput.value = '';

            // --- Resolved Date Logic ---
            if (data.repair_status === 'completed') {
                resolvedGroup.style.display = 'block';
                if(data.resolved_date) {
                    const dateObj = new Date(data.resolved_date);
                    mResolvedDate.value = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                } else {
                    mResolvedDate.value = '';
                }
            } else {
                resolvedGroup.style.display = 'none';
                mResolvedDate.value = '';
            }

            // --- Set Mode ---
            if (isEditMode) {
                modalTitle.innerHTML = 'Update Repair Status';
                mComment.disabled = false;
                mStatus.disabled = false;
                // เปิดให้ Admin เปลี่ยนรูปได้ (ถ้ามีปุ่ม)
                if(btnChangePhoto) btnChangePhoto.style.display = 'inline-block';
                saveBtn.style.display = 'inline-flex';
            } else {
                modalTitle.innerHTML = 'View Repair Details';
                mComment.disabled = true;
                mStatus.disabled = true;
                // ซ่อนปุ่มเปลี่ยนรูป
                if(btnChangePhoto) btnChangePhoto.style.display = 'none';
                saveBtn.style.display = 'none';
            }

            modal.classList.add('active');

        } catch (error) {
            console.error(error);
            alert('Error loading details');
        }
    });

    // --- 5. Admin Image Preview Logic (Preview ทันทีที่เลือกไฟล์) ---
    // Trigger input file
    if(btnChangePhoto && adminFileInput) {
        btnChangePhoto.addEventListener('click', () => {
            adminFileInput.click();
        });
    }

    // Show Preview
    if(adminFileInput) {
        adminFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(event) {
                    mPhotoArea.innerHTML = `
                        <img src="${event.target.result}" class="attached-image" alt="New Preview" style="max-width: 100%; border-radius: 8px; border: 2px solid var(--primary-gold);">
                        <p style="text-align:center; font-size:12px; color:green; margin-top:5px;">New Image Selected</p>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 6. Status Change Logic ---
    if(mStatus) {
        mStatus.addEventListener('change', (e) => {
            if (e.target.value === 'completed') {
                resolvedGroup.style.display = 'block';
                // Auto fill today if empty
                if (!mResolvedDate.value) {
                    mResolvedDate.value = new Date().toISOString().split('T')[0];
                }
            } else {
                resolvedGroup.style.display = 'none';
                mResolvedDate.value = '';
            }
        });
    }

    // --- 7. Submit Update ---
    repairForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = mId.value;
        
        // หมายเหตุ: ปัจจุบัน Backend รองรับแค่ JSON update (status, note)
        // ถ้าต้องการอัปโหลดรูปใหม่จาก Admin ต้องแก้ Backend ให้รับ FormData (Multer) เหมือนฝั่ง Tenant
        const updateData = {
            repair_status: mStatus.value,
            admin_note: mComment.value
        };

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                alert('Update successful');
                closeModal();
                fetchRepairs();
            } else {
                const res = await response.json();
                alert(res.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong');
        }
    });

    // --- 8. Modal & Sidebar Controls ---
    const closeModal = () => {
        modal.classList.remove('active');
        repairForm.reset();
        if(adminFileInput) adminFileInput.value = ''; // Reset file input
    };

    if(btnCancel) btnCancel.addEventListener('click', closeModal);
    if(closeX) closeX.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if(overlay) overlay.classList.add('active');
        });
        if(overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    }

    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user_role');
            window.location.href = '../../index.html';
        });
    }

    // Init
    fetchRepairs();
});