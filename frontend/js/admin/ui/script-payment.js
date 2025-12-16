// js/admin/ui/script-payment.js

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3030/api/payments';
    
    // UI Elements
    const modal = document.getElementById('payment-modal');
    const modalTitle = document.querySelector('.modal-title');
    const tableBody = document.getElementById('table-body');
    const addBtn = document.getElementById('add-payment-btn');
    const cancelBtn = document.querySelector('.btn-cancel');
    const saveBtn = document.getElementById('btn-save-invoice'); // ต้องมั่นใจว่าใน HTML มี id นี้ที่ปุ่ม Save
    const calcBtn = document.getElementById('btn-calc-total');
    const summaryBox = document.getElementById('calc-summary');
    const form = document.getElementById('add-payment-form');

    // Inputs
    const mRoom = document.getElementById('m_room_id');
    const mDate = document.getElementById('m_billing_date');
    const mDueDate = document.getElementById('m_due_date');
    const mStatus = document.getElementById('m_status');
    const mTotal = document.getElementById('total_amount');
    const roomTypeSelect = document.getElementById('room_type_select');
    const roomFeeInput = document.getElementById('room_fee');

    // Meters
    const elecLast = document.getElementById('elec_last');
    const elecCurrent = document.getElementById('elec_current');
    const elecPrice = document.getElementById('elec_total_price');

    const waterLast = document.getElementById('water_last');
    const waterCurrent = document.getElementById('water_current');
    const waterPrice = document.getElementById('water_total_price');

    // State Variables (ตัวแปรสำคัญ)
    let currentMode = 'create'; // 'create', 'edit', 'view'
    let currentPaymentId = null;
    let currentContractId = null;

    // เพิ่มตัวแปร global เก็บข้อมูลทั้งหมด
    let allPaymentsData = []; 

    const searchInput = document.getElementById('search-payment');
    const filterStatus = document.getElementById('filter-status');

    // --- 1. Fetch Data (ดึงครั้งเดียว เก็บลงตัวแปร) ---
    async function fetchPayments() {
        try {
            const token = sessionStorage.getItem('token');
            if(!token) return;

            const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            
            // เก็บข้อมูลดิบไว้ในตัวแปร Global
            allPaymentsData = data; 
            
            // เรียกฟังก์ชันกรองและแสดงผล (เริ่มต้นคือแสดงทั้งหมด)
            applyFilters();

        } catch (error) { console.error('Error fetching payments:', error); }
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = filterStatus.value;

        // กรองข้อมูลจาก allPaymentsData
        const filteredData = allPaymentsData.filter(item => {
            
            const matchStatus = (statusValue === 'all' || statusValue === '') || (item.payment_status === statusValue);
            
            // 2. เช็คเลขห้อง
            const matchRoom = item.room_number.toLowerCase().includes(searchTerm);

            // ต้องผ่านทั้งสองเงื่อนไข
            return matchStatus && matchRoom;
        });

        renderTable(filteredData);
    }

    // --- 3. Render Table (วาดตาราง) ---
    function renderTable(data) {
        tableBody.innerHTML = '';
        
        if(data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#999;">No records found</td></tr>`;
            return;
        }

        data.forEach((item, index) => {
            const dateStr = new Date(item.billing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const amount = parseFloat(item.total_amount).toLocaleString();
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${item.room_number}</strong></td>
                <td>${dateStr}</td>
                <td class="amount">฿ ${amount}</td>
                <td><span class="badge ${item.payment_status}">${item.payment_status}</span></td>
                <td>
                    <button class="action-btn look" data-id="${item.payment_id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" data-id="${item.payment_id}"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 4. Event Listeners สำหรับ Filter ---
    
    // เมื่อพิมพ์ค้นหา -> กรองทันที
    if(searchInput) {
        searchInput.addEventListener('keyup', applyFilters);
    }

    // เมื่อเปลี่ยน Dropdown Status -> กรองทันที
    if(filterStatus) {
        filterStatus.addEventListener('change', applyFilters);
    }

    // --- 2. Open Modal Logic ---
    async function openModal(mode, id = null) {
        currentMode = mode;
        currentPaymentId = id; // เก็บ ID ไว้ใช้ตอน Save
        
        modal.classList.add('active');
        form.reset();
        summaryBox.style.display = 'none';
        
        // Reset State
        mRoom.disabled = false;
        enableInputs(true);

        // จัดการปุ่มตามโหมด
        if (mode === 'create') {
            modalTitle.textContent = 'Create New Invoice';
            mDate.value = new Date().toISOString().split('T')[0];
            currentContractId = null; // Reset Contract ID เสมอเมื่อสร้างใหม่
            
            // Show Buttons
            if(saveBtn) saveBtn.style.display = 'block';
            if(calcBtn) calcBtn.style.display = 'flex';
        } 
        else {
            // Edit or View Mode
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch(`${API_URL}/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                // Fill Data
                currentContractId = data.contract_id; // **สำคัญ** ต้องดึง Contract ID กลับมาด้วย
                mRoom.value = data.room_number;
                mDate.value = data.billing_date.split('T')[0];
                mDueDate.value = data.due_date ? data.due_date.split('T')[0] : '';
                mStatus.value = data.payment_status;
                
                roomTypeSelect.value = parseInt(data.room_fee);
                roomFeeInput.value = data.room_fee;

                elecLast.value = data.electricity_meter_last;
                elecCurrent.value = data.electricity_meter_current;
                elecPrice.value = data.electricity_fee;

                waterLast.value = data.water_meter_last;
                waterCurrent.value = data.water_meter_current;
                waterPrice.value = data.water_fee;

                mTotal.value = data.total_amount;

                // Lock Room Number (ห้ามแก้เลขห้องตอน Edit)
                mRoom.disabled = true; 

                if (mode === 'view') {
                    modalTitle.textContent = 'Invoice Details';
                    if(saveBtn) saveBtn.style.display = 'none';
                    if(calcBtn) calcBtn.style.display = 'none';
                    enableInputs(false); // Read-only
                } else {
                    modalTitle.textContent = 'Edit Invoice';
                    if(saveBtn) saveBtn.style.display = 'block';
                    if(calcBtn) calcBtn.style.display = 'flex';
                }

            } catch (err) { console.error(err); }
        }
    }

    // --- 3. Submit Form ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validation
        if (!currentContractId) {
            alert('Error: No Contract ID found. Please re-select the room.');
            return;
        }

        const payload = {
            contract_id: currentContractId,
            billing_date: mDate.value,
            due_date: mDueDate.value,
            electricity_meter_last: parseFloat(elecLast.value),
            electricity_meter_current: parseFloat(elecCurrent.value),
            electricity_fee: parseFloat(elecPrice.value),
            water_meter_last: parseFloat(waterLast.value),
            water_meter_current: parseFloat(waterCurrent.value),
            water_fee: parseFloat(waterPrice.value),
            room_fee: parseFloat(roomFeeInput.value),
            total_amount: parseFloat(mTotal.value),
            payment_status: mStatus.value
        };

        const token = sessionStorage.getItem('token');
        let url = API_URL;
        let method = 'POST';

        // เช็ค Mode เพื่อเปลี่ยน URL และ Method
        if (currentMode === 'edit') {
            if(!currentPaymentId) {
                alert("Error: Payment ID missing for update.");
                return;
            }
            url = `${API_URL}/${currentPaymentId}`; // ส่ง ID ไปใน URL
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
                alert(currentMode === 'create' ? 'Invoice created!' : 'Invoice updated!');
                modal.classList.remove('active');
                fetchPayments();
            } else {
                const errData = await res.json();
                alert('Operation failed: ' + (errData.msg || 'Unknown error'));
            }
        } catch (error) { console.error(error); }
    });

    // --- 4. Auto Fetch Room Info (เฉพาะตอน Create) ---
    mRoom.addEventListener('blur', async () => {
        // ถ้าอยู่ในโหมด Edit ไม่ต้องดึงข้อมูลใหม่ เพราะจะทำให้ค่า Last Meter เพี้ยนไปเป็นของล่าสุด
        if (currentMode !== 'create') return; 

        const roomNo = mRoom.value.trim();
        if (!roomNo) return;

        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`${API_URL}/billing-info/${roomNo}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                currentContractId = data.contract_id;
                elecLast.value = data.last_elec;
                waterLast.value = data.last_water;
                
                roomFeeInput.value = data.room_price;
                roomTypeSelect.value = parseInt(data.room_price); 
                
                elecCurrent.value = '';
                waterCurrent.value = '';
                elecCurrent.focus();
            } else {
                alert('Room not found or no active contract.');
                mRoom.value = '';
                currentContractId = null;
            }
        } catch (error) { console.error(error); }
    });

    // --- Helper & Calc Logic (เหมือนเดิม) ---
    function enableInputs(enable) {
        const inputs = form.querySelectorAll('input:not(.input-readonly), select');
        inputs.forEach(inp => inp.disabled = !enable);
    }

    calcBtn.addEventListener('click', () => {
        const rent = parseFloat(roomFeeInput.value) || 0;
        
        const eLast = parseFloat(elecLast.value) || 0;
        const eCurr = parseFloat(elecCurrent.value) || 0;
        const eUnits = Math.max(0, eCurr - eLast);
        const eTotal = eUnits * 8;
        elecPrice.value = eTotal.toFixed(2);

        const wLast = parseFloat(waterLast.value) || 0;
        const wCurr = parseFloat(waterCurrent.value) || 0;
        const wUnits = Math.max(0, wCurr - wLast);
        const wTotal = wUnits * 15;
        waterPrice.value = wTotal.toFixed(2);

        const grandTotal = rent + eTotal + wTotal;
        mTotal.value = grandTotal.toFixed(2);

        document.getElementById('units-elec-display').textContent = eUnits;
        document.getElementById('units-water-display').textContent = wUnits;
        document.getElementById('sum-total-display').textContent = grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2});
        summaryBox.style.display = 'block';
    });
    
    roomTypeSelect.addEventListener('change', () => {
        const fee = parseFloat(roomTypeSelect.value) || 0;
        roomFeeInput.value = fee.toFixed(2);
    });

    // Table Events
    tableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('.action-btn');
        if (!btn) return;
        const id = btn.dataset.id;
        
        if (btn.classList.contains('look')) openModal('view', id);
        else if (btn.classList.contains('edit')) openModal('edit', id);
    });

    // Modal Events
    addBtn.addEventListener('click', () => openModal('create'));
    cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

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

    fetchPayments();
});