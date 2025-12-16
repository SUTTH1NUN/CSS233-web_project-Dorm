document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3030/api/repairs';
    
    // --- Elements ---
    const repairForm = document.getElementById('repair-form');
    const roomDisplay = document.getElementById('room-display');
    const historyContainer = document.getElementById('history-container');
    
    // Upload Elements
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('repair-image');
    const placeholder = document.getElementById('upload-placeholder'); // ไอคอน+ข้อความ
    const imgPreview = document.getElementById('repair-img-preview'); // tag img เปล่าๆ
    
    // Sidebar & Layout
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const logoutBtn = document.getElementById('logout-btn');

    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        window.location.href = '../../index.html';
        return;
    }

    // 1. Fetch Room Info
    async function fetchRoomInfo() {
        try {
            const response = await fetch(`${API_URL}/my-room`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                roomDisplay.value = data.room_number || 'No Active Room';
            }
        } catch (error) {
            console.error('Error fetching room:', error);
            roomDisplay.value = 'Error';
        }
    }

    // 2. Fetch Repair History
    async function fetchHistory() {
        try {
            const response = await fetch(`${API_URL}/my-history`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const repairs = await response.json();

            // Reset Container but keep Title
            const title = historyContainer.querySelector('.form-title');
            historyContainer.innerHTML = '';
            if(title) historyContainer.appendChild(title);

            if (repairs.length === 0) {
                const noData = document.createElement('div');
                noData.style.textAlign = 'center';
                noData.style.color = '#999';
                noData.style.marginTop = '20px';
                noData.innerText = 'No repair history found.';
                historyContainer.appendChild(noData);
                return;
            }

            repairs.forEach(repair => {
                const dateObj = new Date(repair.request_date);
                const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                let badgeClass = 'pending';
                let statusText = repair.repair_status;

                if (statusText === 'in_progress') { badgeClass = 'process'; statusText = 'In Progress'; }
                else if (statusText === 'completed') { badgeClass = 'completed'; statusText = 'Completed'; }
                else if (statusText === 'cancelled') { badgeClass = 'cancelled'; statusText = 'Cancelled'; }
                else { statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1); }

                const itemHtml = `
                    <div class="history-item">
                        <div class="job-info">
                            <h4>${repair.issue_description.substring(0, 30)}...</h4>
                            <p><i class="far fa-clock"></i> ${dateStr}</p>
                            <span class="cat-badge">${repair.issue_title}</span>
                        </div>
                        <div class="job-status">
                            <span class="status-badge ${badgeClass}">${statusText}</span>
                        </div>
                    </div>
                `;
                // ใช้ insertAdjacentHTML เพื่อไม่ให้ทับ Title
                historyContainer.insertAdjacentHTML('beforeend', itemHtml);
            });

        } catch (error) {
            console.error('Error fetching history:', error);
        }
    }

    // --- 3. Upload Preview Logic (UPDATED) ---
    
    // A. คลิกที่กล่อง upload-area แล้วให้ไป trigger input file
    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });
    }

    // B. เมื่อเลือกไฟล์ ให้แสดง Preview
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];

            if (file) {
                // เช็คประเภทไฟล์
                if (!file.type.startsWith('image/')) {
                    alert('Please select an image file only.');
                    this.value = ''; // Reset input
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    // ซ่อน Placeholder
                    if(placeholder) placeholder.style.display = 'none';
                    // โชว์รูป
                    if(imgPreview) {
                        imgPreview.src = event.target.result;
                        imgPreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            } else {
                // กรณี User กด Cancel หรือลบไฟล์
                if(placeholder) placeholder.style.display = 'block';
                if(imgPreview) {
                    imgPreview.style.display = 'none';
                    imgPreview.src = '#';
                }
            }
        });
    }

    // 4. Submit Form
    repairForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const category = document.getElementById('issue-category').value;
        const desc = document.getElementById('issue-desc').value;
        const phone = document.getElementById('phone-number').value;
        const file = imageInput.files[0];

        const formData = new FormData();
        formData.append('issue_category', category);
        formData.append('issue_description', desc);
        formData.append('phone_number', phone);
        if (file) {
            formData.append('image', file);
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert('Request submitted successfully!');
                repairForm.reset();
                
                // Reset Upload Area ให้กลับไปเป็น Placeholder
                if(placeholder) placeholder.style.display = 'block';
                if(imgPreview) {
                    imgPreview.style.display = 'none';
                    imgPreview.src = '#';
                }

                fetchHistory(); // โหลดประวัติใหม่
            } else {
                alert(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong');
        }
    });

    // Sidebar Logic
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            if(overlay) overlay.classList.add('active');
        });
    }
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            window.location.href = '../../index.html';
        });
    }

    // Init Data
    fetchRoomInfo();
    fetchHistory();
});