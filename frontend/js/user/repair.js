document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3030/api/repairs';
    
    const repairForm = document.getElementById('repair-form');
    const roomDisplay = document.getElementById('room-display');
    const historyContainer = document.getElementById('history-container');
    const imageInput = document.getElementById('repair-image');
    const uploadText = document.querySelector('#upload-area p');
    
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const logoutBtn = document.getElementById('logout-btn');

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        window.location.href = '../../index.html';
        return;
    }

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

    async function fetchHistory() {
        try {
            const response = await fetch(`${API_URL}/my-history`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const repairs = await response.json();

            const title = historyContainer.querySelector('.form-title');
            historyContainer.innerHTML = '';
            historyContainer.appendChild(title);

            if (repairs.length === 0) {
                historyContainer.innerHTML += `<div style="text-align:center; color:#999; margin-top:20px;">No repair history found.</div>`;
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
                historyContainer.innerHTML += itemHtml;
            });

        } catch (error) {
            console.error('Error fetching history:', error);
        }
    }

    imageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            uploadText.textContent = this.files[0].name;
            uploadText.style.color = '#333';
        } else {
            uploadText.textContent = 'Click or Drag photo here';
        }
    });

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
                uploadText.textContent = 'Click or Drag photo here';
                fetchHistory();
            } else {
                alert(result.msg || 'Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Something went wrong');
        }
    });

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

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            window.location.href = '../../index.html';
        });
    }

    fetchRoomInfo();
    fetchHistory();
});