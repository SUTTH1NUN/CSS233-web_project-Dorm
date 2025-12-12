document.addEventListener('DOMContentLoaded', () => {
     const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    // 2. ตรวจสอบว่ามี Element ครบไหม
    if (menuToggle && sidebar) {
        
        // เมื่อกดปุ่ม 3 ขีด
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active'); // เติม class active เพื่อเลื่อนเมนูออกมา
            if(overlay) overlay.classList.add('active'); // โชว์พื้นหลังดำ
        });

        // เมื่อกดพื้นหลังสีดำ (Overlay)
        if(overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active'); // ซ่อนเมนู
                overlay.classList.remove('active'); // ซ่อนพื้นหลัง
            });
        }
    }

    // --- 2. Payment Modal Logic (เพิ่มใหม่) ---
    const addPaymentBtn = document.getElementById('add-payment-btn');
    const paymentModal = document.getElementById('payment-modal');
    const cancelBtn = document.querySelector('.btn-cancel');

    // เปิด Modal
    if (addPaymentBtn && paymentModal) {
        addPaymentBtn.addEventListener('click', () => {
            paymentModal.classList.add('active');
        });
    }

    // ปิด Modal (กดปุ่ม Cancel)
    if (cancelBtn && paymentModal) {
        cancelBtn.addEventListener('click', () => {
            paymentModal.classList.remove('active');
        });
    }

    // ปิด Modal (กดพื้นหลัง)
    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                paymentModal.classList.remove('active');
            }
        });
    }
    

    
    // 1. คำนวณค่าเช่าตามประเภทห้อง
function calcRent() {
    const select = document.getElementById('room_type_select');
    const rentInput = document.getElementById('room_fee');
    
    // เอาค่า value จาก dropdown มาใส่ในช่อง room_fee
    rentInput.value = parseFloat(select.value).toFixed(2);
    
    calcTotal(); // สั่งคำนวณยอดรวมใหม่
}

// 2. คำนวณค่าไฟ (หน่วยละ 8 บาท)
function calcElec() {
    const units = parseFloat(document.getElementById('elec_units').value) || 0;
    const rate = 8;
    const total = units * rate;
    
    document.getElementById('electricity_fee').value = total.toFixed(2);
    calcTotal();
}

// 3. คำนวณค่าน้ำ (หน่วยละ 15 บาท)
function calcWater() {
    const units = parseFloat(document.getElementById('water_units').value) || 0;
    const rate = 15;
    const total = units * rate;
    
    document.getElementById('water_fee').value = total.toFixed(2);
    calcTotal();
}

// 4. คำนวณยอดรวมทั้งหมด (Grand Total)
function calcTotal() {
    const rent = parseFloat(document.getElementById('room_fee').value) || 0;
    const elec = parseFloat(document.getElementById('electricity_fee').value) || 0;
    const water = parseFloat(document.getElementById('water_fee').value) || 0;
    
    const grandTotal = rent + elec + water;
    
    document.getElementById('total_amount').value = grandTotal.toFixed(2);
}

// 1. เลือก Element
    const calcBtn = document.getElementById('btn-calc-total');
    const roomTypeSelect = document.getElementById('room_type_select');
    const roomFeeInput = document.getElementById('room_fee');
    
    // Inputs
    const elecInput = document.getElementById('elec_units');
    const waterInput = document.getElementById('water_units');
    
    // Outputs
    const elecFeeOutput = document.getElementById('electricity_fee');
    const waterFeeOutput = document.getElementById('water_fee');
    const totalInput = document.getElementById('total_amount');
    
    // Summary Box
    const summaryBox = document.getElementById('calc-summary');
    const sumRoom = document.getElementById('sum-room');
    const sumElec = document.getElementById('sum-elec');
    const sumWater = document.getElementById('sum-water');
    const sumTotal = document.getElementById('sum-total');

    // 2. ฟังก์ชันเมื่อเปลี่ยนประเภทห้อง (Auto Fill ค่าเช่า)
    if (roomTypeSelect) {
        roomTypeSelect.addEventListener('change', () => {
            const fee = parseFloat(roomTypeSelect.value) || 0;
            roomFeeInput.value = fee.toFixed(2);
        });
    }

    // 3. ฟังก์ชันเมื่อกดปุ่ม "Calculate Total"
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            // ค่าเช่า
            const rent = parseFloat(roomFeeInput.value) || 0;
            
            // คำนวณค่าไฟ (หน่วยละ 8)
            const elecUnits = parseFloat(elecInput.value) || 0;
            const elecFee = elecUnits * 8;
            elecFeeOutput.value = elecFee.toFixed(2);

            // คำนวณค่าน้ำ (หน่วยละ 15)
            const waterUnits = parseFloat(waterInput.value) || 0;
            const waterFee = waterUnits * 15;
            waterFeeOutput.value = waterFee.toFixed(2);

            // ยอดรวม
            const total = rent + elecFee + waterFee;
            totalInput.value = total.toFixed(2);

            // แสดงกล่องสรุป
            sumRoom.textContent = rent.toLocaleString();
            sumElec.textContent = elecFee.toLocaleString();
            sumWater.textContent = waterFee.toLocaleString();
            sumTotal.textContent = total.toLocaleString(undefined, {minimumFractionDigits: 2});
            
            summaryBox.style.display = 'block'; // โชว์กล่อง
        });
    }

});