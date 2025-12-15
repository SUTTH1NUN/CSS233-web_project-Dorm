document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3030/api/repairs';
    
    const tableBody = document.getElementById('table-body');
    const modal = document.getElementById('modal-overlay');
    const btnCancel = document.getElementById('btn-cancel');
    const closeX = document.getElementById('close-x');
    const repairForm = document.getElementById('repair-form');
    const searchInput = document.getElementById('search-repair');
    const filterSelect = document.getElementById('filter-status');
    const modalTitle = document.querySelector('.modal-title');
    const saveBtn = document.getElementById('save-repair-btn');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const logoutBtn = document.getElementById('logout-btn');

    const mId = document.getElementById('repair-id');
    const mRoom = document.getElementById('repair-room');
    const mTopic = document.getElementById('repair-topic');
    const mDesc = document.getElementById('repair-desc');
    const mPhone = document.getElementById('repair-phone');
    const mPhotoArea = document.getElementById('photo-display-area');
    const mComment = document.getElementById('repair-comment');
    const mStatus = document.getElementById('repair-status');
    const mResolvedDate = document.getElementById('repair-resolved-date');
    const resolvedGroup = document.getElementById('resolved-group');

    let allRepairs = [];

    async function fetchRepairs() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
            }

            const response = await fetch(API_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch');
            
            allRepairs = await response.json();
            renderTable(allRepairs);
        } catch (error) {
            console.error('Error:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:red;">Error loading data</td></tr>`;
        }
    }

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

    searchInput.addEventListener('input', filterRepairs);
    filterSelect.addEventListener('change', filterRepairs);

    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.action-btn');
        if (!btn) return;

        const id = parseInt(btn.getAttribute('data-id'));
        const data = allRepairs.find(r => r.repair_id === id);
        const isEditMode = btn.classList.contains('edit');

        if (data) {
            mId.value = data.repair_id;
            mRoom.value = data.room_number;
            mTopic.value = data.issue_title;
            mDesc.value = data.issue_description;
            mPhone.value = data.phone_number || '-';
            mComment.value = data.admin_note || '';
            mStatus.value = data.repair_status;

            if (data.img_path) {
                mPhotoArea.innerHTML = `<img src="${data.img_path}" class="attached-image" alt="Evidence">`;
            } else {
                mPhotoArea.innerHTML = `<div class="photo-placeholder"><i class="fas fa-image" style="font-size:30px; color:#ccc;"></i><p style="color:#999; font-size:12px;">No photo attached</p></div>`;
            }

            if (data.repair_status === 'completed') {
                resolvedGroup.style.display = 'block';
                if(data.resolved_date) {
                    const dateObj = new Date(data.resolved_date);
                    mResolvedDate.value = dateObj.toISOString().split('T')[0];
                }
            } else {
                resolvedGroup.style.display = 'none';
                mResolvedDate.value = '';
            }

            if (isEditMode) {
                modalTitle.innerHTML = '<i class="fas fa-edit"></i> Update Repair Status';
                mComment.disabled = false;
                mStatus.disabled = false;
                saveBtn.style.display = 'inline-flex';
            } else {
                modalTitle.innerHTML = '<i class="fas fa-eye"></i> View Repair Details';
                mComment.disabled = true;
                mStatus.disabled = true;
                saveBtn.style.display = 'none';
            }

            modal.classList.add('active');
        }
    });

    mStatus.addEventListener('change', (e) => {
        if (e.target.value === 'completed') {
            resolvedGroup.style.display = 'block';
            if (!mResolvedDate.value) {
                mResolvedDate.value = new Date().toISOString().split('T')[0];
            }
        } else {
            resolvedGroup.style.display = 'none';
        }
    });

    repairForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = mId.value;
        const status = mStatus.value;
        const note = mComment.value;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    repair_status: status,
                    admin_note: note
                })
            });

            if (response.ok) {
                alert('Update successful');
                closeModal();
                fetchRepairs();
            } else {
                alert('Failed to update');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong');
        }
    });

    const closeModal = () => {
        modal.classList.remove('active');
        repairForm.reset();
    };

    btnCancel.addEventListener('click', closeModal);
    closeX.addEventListener('click', closeModal);
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
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            window.location.href = '../../index.html';
        });
    }

    fetchRepairs();
});