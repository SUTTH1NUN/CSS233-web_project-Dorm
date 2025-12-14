document.addEventListener('DOMContentLoaded', () => {
     // ข้อมูล Room Info จาก Database จำลอง (เพื่อให้ JS ดึงไปใช้)
        const roomInfoDB = {
            'Studio Suite': { size: 26, price: 5500, furniture: 'Air conditioner, Smart TV, Refrigerator, Free Wi-Fi, Work Desk, 1 King Bed' },
            '1 Bedroom Suite': { size: 45, price: 8500, furniture: 'AC, TV, Fridge, Microwave, Balcony, 1 King Bed + Living Area' },
            'Family Suite': { size: 75, price: 15000, furniture: '2 AC, 2 TV, Large Fridge, Full Kitchen, Bathtub, Living Room, 2 King Beds' }
        };

        const modal = document.getElementById('modal-overlay');
        const addBtn = document.getElementById('add-room-btn');
        const cancelBtn = document.querySelector('.btn-cancel');
        const saveBtn = document.getElementById('save-room-btn');
        
        // Element ใน Modal
        const mRoomNo = document.getElementById('m-room-no');
        const mBuilding = document.getElementById('m-building');
        const mFloor = document.getElementById('m-floor');
        const mType = document.getElementById('m-type');
        const mStatus = document.getElementById('m-status');
        const mSize = document.getElementById('m-size');
        const mPrice = document.getElementById('m-price');
        const mFurniture = document.getElementById('m-furniture');
        const modalTitle = document.querySelector('.modal-title');

        // ฟังก์ชันอัปเดต Info ตาม Type ที่เลือก (เผื่อเปลี่ยนใน Modal)
        function updateRoomInfoDisplay(type) {
            if(roomInfoDB[type]) {
                mSize.value = roomInfoDB[type].size;
                mPrice.value = roomInfoDB[type].price;
                mFurniture.value = roomInfoDB[type].furniture;
            } else {
                mSize.value = ''; mPrice.value = ''; mFurniture.value = '';
            }
        }

        mType.addEventListener('change', (e) => updateRoomInfoDisplay(e.target.value));

        // 1. ปุ่ม Add Room
        if(addBtn) {
            addBtn.addEventListener('click', () => {
                modal.style.display = 'flex';
                modalTitle.textContent = "Add New Room";
                
                // Clear ค่า
                mRoomNo.value = ''; mFloor.value = ''; 
                mType.value = 'Studio Suite'; 
                mStatus.value = 'available';
                updateRoomInfoDisplay('Studio Suite'); // Default info
            });
        }

        // 2. ปุ่ม View / Edit ในตาราง (ใช้ Event Delegation)
        document.getElementById('room-table-body').addEventListener('click', (e) => {
            // หาปุ่มที่ถูกกด
            const btn = e.target.closest('button');
            if(!btn) return;

            // หาแถวของปุ่มนั้น
            const row = btn.closest('tr');
            if(!row) return;

            // ดึงข้อมูลจาก Data Attribute ของแถว
            const roomData = row.dataset;

            if (btn.classList.contains('view') || btn.classList.contains('edit')) {
                modal.style.display = 'flex';
                modalTitle.textContent = btn.classList.contains('edit') ? "Edit Room" : "Room Details";

                // ใส่ข้อมูลลงใน Modal
                mRoomNo.value = roomData.room;
                mBuilding.value = roomData.build;
                mFloor.value = roomData.floor;
                mType.value = roomData.type;
                mStatus.value = roomData.status;

                // ดึงข้อมูล Room Info มาโชว์
                updateRoomInfoDisplay(roomData.type);
            }
        });

        // 3. ปิด Modal
        if(cancelBtn) cancelBtn.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target == modal) modal.style.display = 'none';
        });

        // 4. Sidebar Toggle (เหมือนเดิม)
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
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
        
});