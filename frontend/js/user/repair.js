/*
document.addEventListener('DOMContentLoaded', () => {
            
            // --- 1. จัดการ Menu Toggle (สำคัญที่สุด) ---
            const menuToggle = document.getElementById('menu-toggle');
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');

            // เช็คว่าเจอ Element ไหม (ถ้าเจอจะทำงาน)
            if (menuToggle && sidebar) {
                console.log("Menu elements found!"); // เช็คใน Console

                // กดปุ่ม 3 ขีด
                menuToggle.addEventListener('click', (e) => {
                    e.stopPropagation(); // ป้องกันการกดซ้อน
                    sidebar.classList.toggle('active'); // สลับ class active
                    if (overlay) overlay.classList.toggle('active');
                });

                // กดพื้นหลังดำเพื่อปิด
                if (overlay) {
                    overlay.addEventListener('click', () => {
                        sidebar.classList.remove('active');
                        overlay.classList.remove('active');
                    });
                }
            } else {
                console.error("Menu toggle or sidebar not found!");
            }

            // --- 2. จัดการ File Upload Preview (ของหน้าแจ้งซ่อม) ---
            const fileInput = document.getElementById('repair-image');
            const fileNameDisplay = document.getElementById('file-name'); 
            const uploadText = document.querySelector('.file-upload-wrapper p');

            if (fileInput) {
                fileInput.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        const name = this.files[0].name;
                        if(fileNameDisplay) {
                            fileNameDisplay.textContent = name;
                            fileNameDisplay.style.color = "#333";
                        }
                        if(uploadText) {
                            uploadText.textContent = "Selected: " + name;
                            uploadText.style.color = "#C4A808";
                            uploadText.style.fontWeight = "bold";
                        }
                    }
                });
            }
        });
*/
document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. CONFIGURATION & SETUP
    // =========================================
    // ✅ แก้ Port เป็น 3030 ให้ตรงกับ Backend ของคุณ
    const API_BASE = "http://localhost:3030/api"; 
    
    const getToken = () => localStorage.getItem('token'); 

    // ตรวจสอบ Token
    if (!getToken()) {
        alert("กรุณาเข้าสู่ระบบก่อน");
        window.location.href = "../../index.html";
        return;
    }

    // Selectors
    const form = document.getElementById('repair-form');
    const historyList = document.getElementById('history-list');
    
    // Image Elements (สำหรับ Preview UI)
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('repair-image');
    const previewImg = document.getElementById('image-preview');
    const uploadContent = document.querySelector('.upload-content');
    // const removeBtn = document.getElementById('remove-img-btn');


    // =========================================
    // 2. LOAD REPAIR HISTORY (ดึงประวัติ)
    // =========================================
    async function fetchRepairHistory() {
        historyList.innerHTML = '<p style="text-align:center; color:#888;">Loading history...</p>';

        try {
            // Backend ที่เราทำไว้ใช้ Route GET /api/repairs (ดึงของตัวเองผ่าน Token)
            const res = await fetch(`${API_BASE}/repairs`, { 
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!res.ok) throw new Error("Failed to fetch history");

            const repairs = await res.json();
            renderHistory(repairs);

        } catch (err) {
            console.error(err);
            historyList.innerHTML = '<p style="text-align:center; color:red;">ไม่สามารถโหลดข้อมูลได้</p>';
        }
    }

    // ฟังก์ชันสร้าง HTML สำหรับรายการประวัติ
    function renderHistory(repairs) {
        if (repairs.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; color:#aaa; margin-top:20px;">ยังไม่มีประวัติการแจ้งซ่อม</p>';
            return;
        }

        historyList.innerHTML = repairs.map(item => {
            // แปลงวันที่ให้สวยงาม
            const dateObj = new Date(item.created_at);
            const dateStr = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

            // เลือกสี Badge ตามสถานะ
            let badgeClass = 'pending';
            let statusText = 'Pending';

            switch(item.status) {
                case 'in_progress': badgeClass = 'process'; statusText = 'In Progress'; break;
                case 'completed': badgeClass = 'done'; statusText = 'Completed'; break;
                case 'cancelled': badgeClass = 'cancel'; statusText = 'Cancelled'; break;
            }

            return `
                <div class="history-item">
                    <div class="job-info">
                        <h4>${item.title || item.category}</h4> 
                        <p><i class="far fa-clock"></i> ${dateStr}</p>
                        <span class="cat-badge">${capitalize(item.category || item.title)}</span>
                    </div>
                    <div class="job-status">
                        <span class="status-badge ${badgeClass}">${statusText}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function capitalize(s) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    }

    fetchRepairHistory();


    // =========================================
    // 3. IMAGE PREVIEW LOGIC (แสดงรูปก่อนอัป)
    // =========================================
    // Logic การจัดการรูปภาพ (คลิก, Preview, ลบ) ยังคงเดิม
    //uploadArea.addEventListener('click', (e) => {
    //   if(e.target !== removeBtn) fileInput.click();
    //});

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if(file.size > 5 * 1024 * 1024) {
                alert("ไฟล์รูปภาพต้องขนาดไม่เกิน 5MB");
                this.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewImg.classList.remove('hidden');
                removeBtn.classList.remove('hidden');
                uploadContent.classList.add('hidden');
            }
            reader.readAsDataURL(file);
        }
    });
    /*
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        previewImg.src = '';
        previewImg.classList.add('hidden');
        removeBtn.classList.add('hidden');
        uploadContent.classList.remove('hidden');
    });
    */

    // =========================================
    // 4. SUBMIT FORM (ส่งข้อมูลไป Backend)
    // =========================================
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. เตรียมข้อมูล (FormData)
        const formData = new FormData();
        
        // ข้อมูล Text (key ต้องตรงกับ req.body ใน Controller)
        // Frontend ส่ง category มา แต่ Backend ใช้ issue_title
        formData.append('category', document.getElementById('repair_category').value); 
        formData.append('description', document.getElementById('repair_desc').value);
        formData.append('phone', document.getElementById('contact_number').value);
        // room_number ส่งไปเผื่อ แต่ Backend ดึง room_id จาก Token ที่ปลอดภัยกว่า
        formData.append('room_number', document.getElementById('room_number').value); 
        
        // ข้อมูล File (key 'image' ต้องตรงกับ upload.single('image') ใน Route)
        const file = fileInput.files[0];
        if (file) {
            formData.append('image', file);
        }

        // 2. UI Loading State
        const submitBtn = form.querySelector('.btn-submit');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            // 3. ยิง API (POST /api/repairs)
            const res = await fetch(`${API_BASE}/repairs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                body: formData
            });

            // ตรวจสอบ response ก่อนแปลงเป็น JSON
            const result = await res.json(); 

            if (res.ok) {
                // 4. สำเร็จ
                alert("✅ ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว!");
                
                // Reset Form
                form.reset();
                previewImg.classList.add('hidden');
                //removeBtn.classList.add('hidden');
                uploadContent.classList.remove('hidden');

                // Reload History ล่าสุดมาแสดง
                fetchRepairHistory();

            } else {
                throw new Error(result.message || result.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
            }

        } catch (err) {
            console.error("Submit Error:", err);
            // แสดงข้อความ Error ที่มาจาก Backend โดยตรง
            alert(`❌ ไม่สามารถส่งข้อมูลได้: ${err.message}`);
        } finally {
            // คืนค่าปุ่ม
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
        }
    });

});