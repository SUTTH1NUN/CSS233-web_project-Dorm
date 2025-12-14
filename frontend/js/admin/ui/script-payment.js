/*
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
*/
/*
document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================
    // 1. MODAL TOGGLE LOGIC (เปิด-ปิด Modal)
    // =========================================
    const modal = document.getElementById('payment-modal');
    const openBtn = document.getElementById('add-payment-btn');
    const cancelBtn = document.getElementById('btn-cancel-modal');
    const overlay = document.getElementById('payment-modal'); // ใช้ overlay ปิดเมื่อคลิกข้างนอก

    // เปิด Modal
    if(openBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            // ตั้งค่าวันที่ปัจจุบันเป็น Default
            const today = new Date().toISOString().split('T')[0];
            document.querySelector('input[name="billing_date"]').value = today;
            document.querySelector('input[name="due_date"]').value = today;
        });
    }

    // ปิด Modal (ปุ่ม Cancel)
    if(cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.getElementById('add-payment-form').reset();
        });
    }

    // ปิด Modal (คลิกพื้นหลัง)
    window.onclick = function(event) {
        if (event.target == overlay) {
            modal.style.display = "none";
        }
    }

    // =========================================
    // 2. PAYMENT FORM LOGIC
    // =========================================
    
    const API_BASE = "https://api.example.com"; // URL สมมติ
    const form = document.getElementById('add-payment-form');
    const roomInput = document.getElementById('room_number');
    const roomFeeHidden = document.getElementById('room_fee_hidden');
    const totalInput = document.getElementById('total_amount');

    // Elec Elements
    const elecLast = document.getElementById('elec_last');
    const elecUnits = document.getElementById('elec_units');
    const elecCurr = document.getElementById('elec_curr');
    const elecFee = document.getElementById('elec_fee');

    // Water Elements
    const waterLast = document.getElementById('water_last');
    const waterUnits = document.getElementById('water_units');
    const waterCurr = document.getElementById('water_curr');
    const waterFee = document.getElementById('water_fee');

    // --- A. ฟังก์ชันดึงข้อมูลเมื่อพิมพ์เลขห้อง ---
    if (roomInput) {
        roomInput.addEventListener('change', async function() {
            const roomNo = this.value.trim();
            if (!roomNo) return;

            // Feedback ว่ากำลังโหลด
            elecLast.placeholder = "Loading...";
            waterLast.placeholder = "Loading...";

            try {
                // *** จำลองข้อมูล (Mock Data) ***
                // ถ้าใช้จริงให้ลบส่วนนี้แล้วใช้ fetch() ด้านล่าง
                console.log(`Fetching data for Room: ${roomNo}`);
                
                // สมมติว่าห้อง 101 ค่าเช่า 5500, มิเตอร์เก่า 1200 / 450
                const mockData = {
                    room_fee: 5500,
                    last_elec: 1200,
                    last_water: 450
                };

                // ใส่ข้อมูลลงในฟอร์ม
                roomFeeHidden.value = mockData.room_fee;
                elecLast.value = mockData.last_elec;
                waterLast.value = mockData.last_water;

                // รีเซ็ตช่องกรอก
                elecUnits.value = '';
                waterUnits.value = '';
                elecCurr.value = '';
                waterCurr.value = '';
                
                calculateTotal(); // คำนวณยอดเริ่มต้น

            } catch (err) {
                console.error("Error:", err);
                alert("Error fetching room data");
            }
        });
    }

    // --- B. ฟังก์ชันคำนวณ (Calculator) ---
    function calculateTotal() {
        // 1. ค่าห้อง
        const rent = parseFloat(roomFeeHidden.value) || 0;

        // 2. ไฟฟ้า (8 บาท/หน่วย)
        const eLast = parseFloat(elecLast.value) || 0;
        const eUnits = parseFloat(elecUnits.value) || 0;
        
        const eCurrValue = eLast + eUnits; // มิเตอร์ปัจจุบัน = เก่า + ใช้
        elecCurr.value = eCurrValue;       // แสดงผลมิเตอร์ปัจจุบัน
        
        const ePrice = eUnits * 8;         // ราคา = หน่วยที่ใช้ * 8
        elecFee.value = ePrice.toFixed(2);

        // 3. น้ำ (15 บาท/หน่วย)
        const wLast = parseFloat(waterLast.value) || 0;
        const wUnits = parseFloat(waterUnits.value) || 0;

        const wCurrValue = wLast + wUnits;
        waterCurr.value = wCurrValue;

        const wPrice = wUnits * 15;
        waterFee.value = wPrice.toFixed(2);

        // 4. รวมสุทธิ
        const total = rent + ePrice + wPrice;
        totalInput.value = total.toFixed(2);
    }

    // ผูก Event ให้คำนวณทันทีที่พิมพ์
    if(elecUnits) elecUnits.addEventListener('input', calculateTotal);
    if(waterUnits) waterUnits.addEventListener('input', calculateTotal);

    // --- C. บันทึกข้อมูล (Submit) ---
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateTotal(); // คำนวณรอบสุดท้าย

            const payload = {
                room_number: roomInput.value,
                billing_date: document.querySelector('input[name="billing_date"]').value,
                due_date: document.querySelector('input[name="due_date"]').value,
                
                // ข้อมูลมิเตอร์และราคา
                elec_last: parseFloat(elecLast.value),
                elec_curr: parseFloat(elecCurr.value),
                elec_fee: parseFloat(elecFee.value),
                
                water_last: parseFloat(waterLast.value),
                water_curr: parseFloat(waterCurr.value),
                water_fee: parseFloat(waterFee.value),

                total_amount: parseFloat(totalInput.value),
                status: document.querySelector('select[name="payment_status"]').value
            };

            console.log("Saving Invoice:", payload);
            alert(`Saved Successfully! Total: ${payload.total_amount} THB`);
            
            modal.style.display = 'none';
            form.reset();
        });
    }
});
*/

// /js/admin/ui/script-payment.js

document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // CONFIGURATION
    // =========================================
    const API_BASE = "http://localhost:3030/api";
    const PAYMENT_API = `${API_BASE}/payments`;
    const TENANT_API = `${API_BASE}/tenants`; 
    
    // Constants
    const ELEC_RATE = 8; // 8 THB/Unit
    const WATER_RATE = 15; // 15 THB/Unit
    
    let searchTimer;
    let roomData = null; // เก็บข้อมูลห้องพักที่ค้นหาได้ (เช่น prev_meter, room_fee)

    // =========================================
    // SELECTORS
    // =========================================
    const modalOverlay = document.getElementById('payment-modal');
    const form = document.getElementById('add-payment-form');
    const addPaymentBtn = document.getElementById('add-payment-btn');
    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-payment');
    const filterStatusSelect = document.getElementById('filter-status');

    // Form Inputs
    const roomNumberInput = document.getElementById('room_number');
    const roomFeeHidden = document.getElementById('room_fee_hidden');
    
    // Electricity Inputs
    const elecLastInput = document.getElementById('elec_last');
    const elecUnitsInput = document.getElementById('elec_units');
    const elecCurrInput = document.getElementById('elec_curr');
    const elecFeeInput = document.getElementById('elec_fee');

    // Water Inputs
    const waterLastInput = document.getElementById('water_last');
    const waterUnitsInput = document.getElementById('water_units');
    const waterCurrInput = document.getElementById('water_curr');
    const waterFeeInput = document.getElementById('water_fee');
    
    // Total
    const totalAmountInput = document.getElementById('total_amount');
    
    // Auth Check
    function getToken() {
        return sessionStorage.getItem('token');
    }

    // =========================================
    // MODAL HANDLERS
    // =========================================
    
    function openModal() {
        // Reset state & form
        roomData = null;
        form.reset();
        
        // Clear calculated fields (Readonly)
        elecLastInput.value = '';
        elecCurrInput.value = '';
        elecFeeInput.value = '';
        waterLastInput.value = '';
        waterCurrInput.value = '';
        waterFeeInput.value = '';
        totalAmountInput.value = '0.00';
        
        // Set Today's Date for Billing Date
        form.querySelector('[name="billing_date"]').valueAsDate = new Date();

        modalOverlay.classList.add('active');
        modalOverlay.style.display = 'flex';
        roomNumberInput.focus();
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        modalOverlay.style.display = 'none';
        roomNumberInput.classList.remove('input-highlight');
    }
    
    // =========================================
    // CALCULATIONS & ROOM DATA
    // =========================================
    
    /** * คำนวณค่าไฟ ค่าน้ำ และค่ารวม
     */
    function calculateTotal() {
        // 1. Get Units
        const elecUnits = parseFloat(elecUnitsInput.value) || 0;
        const waterUnits = parseFloat(waterUnitsInput.value) || 0;
        const roomFee = parseFloat(roomFeeHidden.value) || 0;

        // 2. Calculate Fees
        const elecFee = elecUnits * ELEC_RATE;
        const waterFee = waterUnits * WATER_RATE;
        const totalFee = roomFee + elecFee + waterFee;

        // 3. Update Readonly Fields
        elecFeeInput.value = elecFee.toFixed(2);
        waterFeeInput.value = waterFee.toFixed(2);
        totalAmountInput.value = totalFee.toFixed(2);
        
        // 4. Update Current Meter Readings (ถ้ามี Prev Meter)
        if (roomData) {
            // Note: ต้องมั่นใจว่า Backend ส่งค่าตัวเลขมา
            const elecLast = parseFloat(roomData.elec_last_meter);
            const waterLast = parseFloat(roomData.water_last_meter);
            
            // ใช้ toFixed(0) เพื่อแสดงค่ามิเตอร์เป็นจำนวนเต็มตามปกติ
            elecCurrInput.value = (elecLast + elecUnits).toFixed(0); 
            waterCurrInput.value = (waterLast + waterUnits).toFixed(0);
        }
    }
    
    /**
     * ดึงข้อมูลห้องพักและมิเตอร์ล่าสุด
     * (เป็นส่วนที่ถูกต้องแล้ว แต่เพิ่มการจัดรูปแบบของมิเตอร์เป็น 0 ตำแหน่งทศนิยม)
     */
    async function fetchRoomInfo(roomNumber) {
        if (!roomNumber) return;

        const url = `${TENANT_API}/room/${roomNumber}/billing-info`; 

        try {
            const token = getToken();
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert('Room Error: ' + (errorData.message || 'Room not found or not occupied.'));
                roomNumberInput.classList.add('input-highlight'); 
                roomData = null;
                // ต้องเคลียร์ข้อมูลมิเตอร์เก่าหากค้นหาไม่สำเร็จ
                elecLastInput.value = '';
                waterLastInput.value = '';
                roomFeeHidden.value = 0;
                calculateTotal();
                return;
            }

            const data = await res.json();
            roomData = data; 

            // 1. นำข้อมูลมาใส่ใน Fields Readonly (ใช้ toFixed(0) สำหรับมิเตอร์)
            elecLastInput.value = parseFloat(data.elec_last_meter).toFixed(0);
            waterLastInput.value = parseFloat(data.water_last_meter).toFixed(0);
            
            // 2. นำค่าเช่ามาเก็บใน Hidden Field
            roomFeeHidden.value = parseFloat(data.room_fee).toFixed(2);

            // 3. Trigger Calculation
            calculateTotal(); 

            roomNumberInput.classList.remove('input-highlight');
            elecUnitsInput.focus(); // ย้าย focus ไปที่ช่องหน่วยการใช้
        } catch (err) {
            console.error('Fetch Room Error:', err);
            alert('Server Error when fetching room info.');
        }
    }
    
    // =========================================
    // TABLE & ACTION HANDLERS
    // =========================================
    
    /**
     * Helper: สร้าง HTML สำหรับแสดงสถานะ
     */
    function formatStatus(status) {
        const text = status.charAt(0).toUpperCase() + status.slice(1);
        const className = status === 'paid' ? 'status-paid' : 'status-unpaid';
        return `<span class="${className}">${text}</span>`;
    }

    /**
     * Helper: สร้างแถวในตาราง
     */
    function createTableRow(invoice, index) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${invoice.room_number}</td>
            <td>${invoice.billing_date}</td>
            <td>${parseFloat(invoice.total_amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
            <td>${formatStatus(invoice.payment_status)}</td>
            <td>
                <button class="btn-action view-btn" data-id="${invoice.id}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-action status-toggle-btn" data-id="${invoice.id}" data-status="${invoice.payment_status}">
                    <i class="fas ${invoice.payment_status === 'paid' ? 'fa-undo' : 'fa-check'}"></i> ${invoice.payment_status === 'paid' ? 'Unmark Paid' : 'Mark Paid'}
                </button>
            </td>
        `;
        return row;
    }

    /**
     * ดึงข้อมูลใบแจ้งหนี้จาก Backend และแสดงผล
     */
    async function loadPayments(query = '') {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';
        
        const token = getToken();
        // เพิ่ม query parameters สำหรับการค้นหาและกรองสถานะ
        const url = `${PAYMENT_API}${query}`;

        try {
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                 tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load invoices.</td></tr>';
                 return;
            }

            const invoices = await res.json();
            
            tableBody.innerHTML = '';
            if (invoices.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">No invoices found.</td></tr>';
                return;
            }

            invoices.forEach((invoice, index) => {
                // สมมติว่า Backend ส่ง room_number และ total_amount มาให้พร้อมแล้ว
                invoice.room_number = invoice.room ? invoice.room.room_number : 'N/A';
                tableBody.appendChild(createTableRow(invoice, index));
            });

        } catch (error) {
            console.error('Load Payments Error:', error);
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Server connection error.</td></tr>';
        }
    }
    
    /**
     * สลับสถานะการจ่ายเงิน
     */
    async function togglePaymentStatus(invoiceId, currentStatus) {
        const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
        const token = getToken();

        // API ที่จะเรียก: PUT /api/payments/:id/status
        const url = `${PAYMENT_API}/${invoiceId}/status`; 

        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ payment_status: newStatus })
            });

            const result = await res.json();

            if (res.ok) {
                alert(`✅ Payment status updated to ${newStatus.toUpperCase()}`);
                // รีโหลดตารางเพื่อให้สถานะอัปเดต
                handleSearchAndFilter(); 
            } else {
                alert('Error updating status: ' + (result.message || 'Server Error'));
            }

        } catch (error) {
            console.error('Toggle Status Error:', error);
            alert('Cannot connect to server to update status.');
        }
    }
    
    /**
     * จัดการการค้นหาและกรอง
     */
    function handleSearchAndFilter() {
        const searchTerm = searchInput.value.trim();
        const statusFilter = filterStatusSelect.value; // 'all', 'paid', 'unpaid'
        
        let queryParams = [];
        
        // 1. Search Query (ค้นหาหมายเลขห้อง)
        if (searchTerm) {
            queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
        }
        
        // 2. Status Filter
        if (statusFilter && statusFilter !== 'all') {
            queryParams.push(`status=${statusFilter}`);
        }

        const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';
        
        // เรียก loadPayments ด้วย query string
        loadPayments(queryString);
    }
    
    // =========================================
    // EVENT LISTENERS
    // =========================================

    // 1. Room Number Search (debounce)
    roomNumberInput.addEventListener('input', () => {
        const roomNum = roomNumberInput.value.trim().toUpperCase(); // เปลี่ยนเป็นตัวใหญ่เพื่อความสม่ำเสมอ
        roomNumberInput.value = roomNum;
        clearTimeout(searchTimer);
        
        // เช็คความยาวก่อนเพื่อลดการยิง API
        if (roomNum.length >= 3) {
            searchTimer = setTimeout(() => fetchRoomInfo(roomNum), 500);
        }
    });

    // 2. Unit Calculation (Trigger Total Recalculation)
    [elecUnitsInput, waterUnitsInput].forEach(input => {
        input.addEventListener('input', calculateTotal);
    });

    // 3. Form Submit (Send to Backend) - โค้ดเดิมของคุณถูกแล้ว
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!roomData) {
            alert('กรุณาค้นหาห้องพักให้สำเร็จก่อนบันทึก (Room Data not loaded).');
            return;
        }
        // ตรวจสอบขั้นต่ำว่ามีการป้อนยูนิตหรือไม่ (ถ้าจำเป็น)
        if (parseFloat(elecUnitsInput.value) < 0 || parseFloat(waterUnitsInput.value) < 0) {
             alert('Usage units cannot be negative.');
             return;
        }

        const token = getToken();
        // *** ใช้ค่าที่คำนวณได้จาก UI เพื่อมั่นใจว่าถูกต้อง ***
        const payload = {
            room_id: roomData.room_id, 
            tenant_id: roomData.tenant_id,
            billing_date: form.elements['billing_date'].value,
            due_date: form.elements['due_date'].value,
            payment_status: form.elements['payment_status'].value,
            
            // Fees & Meters (ใช้ค่าที่คำนวณและดึงมา)
            room_fee: parseFloat(roomFeeHidden.value),
            
            elec_last_meter: parseFloat(elecLastInput.value),
            elec_units: parseFloat(elecUnitsInput.value) || 0,
            elec_current_meter: parseFloat(elecCurrInput.value), // ค่าที่คำนวณแล้ว
            elec_fee: parseFloat(elecFeeInput.value),

            water_last_meter: parseFloat(waterLastInput.value),
            water_units: parseFloat(waterUnitsInput.value) || 0,
            water_current_meter: parseFloat(waterCurrInput.value), // ค่าที่คำนวณแล้ว
            water_fee: parseFloat(waterFeeInput.value),

            total_amount: parseFloat(totalAmountInput.value),
        };
        //... (โค้ด POST เดิม) ...
        try {
            const res = await fetch(PAYMENT_API, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok) {
                alert('✅ Invoice created successfully!');
                closeModal();
                loadPayments(); 
            } else {
                alert('Error: ' + (result.message || result.error || 'Server Error'));
            }

        } catch (error) {
            console.error('Submit Error:', error);
            alert('Cannot connect to server.');
        }
    });

    // 4. Modal Open/Close
    addPaymentBtn.addEventListener('click', openModal);
    cancelModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // 5. Search & Filter
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(handleSearchAndFilter, 300); // Debounce search
    });
    filterStatusSelect.addEventListener('change', handleSearchAndFilter);

    // 6. Table Action Delegation (สำหรับ Mark Paid/Unpaid)
    tableBody.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('.status-toggle-btn');
        if (toggleBtn) {
            const invoiceId = toggleBtn.dataset.id;
            const currentStatus = toggleBtn.dataset.status;
            if (confirm(`Are you sure you want to change the status of Invoice #${invoiceId} to ${currentStatus === 'paid' ? 'UNPAID' : 'PAID'}?`)) {
                 togglePaymentStatus(invoiceId, currentStatus);
            }
        }
        // View Button: ถ้าต้องการให้ View Button ทำงาน ก็เพิ่มโค้ดที่นี่
    });

    // 7. Initial Load
    loadPayments(); 
});