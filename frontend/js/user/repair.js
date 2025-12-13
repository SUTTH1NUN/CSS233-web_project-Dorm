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