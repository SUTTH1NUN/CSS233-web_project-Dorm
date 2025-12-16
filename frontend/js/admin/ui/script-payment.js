document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE = 'http://localhost:3030/api/payments';
    const RATES = {
        ELECTRICITY: 8, // บาทต่อหน่วย
        WATER: 15       // บาทต่อหน่วย
    };

    // --- State Variables ---
    let currentMode = 'create'; // 'create', 'edit', 'view'
    let currentPaymentId = null;
    let currentContractId = null;
    let allPaymentsData = []; 

    // --- UI Elements ---
    const modal = document.getElementById('payment-modal');
    const modalTitle = document.querySelector('.modal-title');
    const tableBody = document.getElementById('table-body');
    const form = document.getElementById('add-payment-form');
    const summaryBox = document.getElementById('calc-summary');
    
    // Buttons
    const addBtn = document.getElementById('add-payment-btn');
    const cancelBtn = document.querySelector('.btn-cancel');
    const saveBtn = document.getElementById('btn-save-invoice');
    const calcBtn = document.getElementById('btn-calc-total');

    // Inputs
    const searchInput = document.getElementById('search-payment');
    const filterStatus = document.getElementById('filter-status');
    
    // Form Inputs
    const mRoom = document.getElementById('m_room_id');
    const mDate = document.getElementById('m_billing_date');
    const mDueDate = document.getElementById('m_due_date');
    const mStatus = document.getElementById('m_status');
    const mTotal = document.getElementById('total_amount');
    const roomTypeSelect = document.getElementById('room_type_select');
    const roomFeeInput = document.getElementById('room_fee');

    // Meter Inputs
    const elecLast = document.getElementById('elec_last');
    const elecCurrent = document.getElementById('elec_current');
    const elecPrice = document.getElementById('elec_total_price');
    const waterLast = document.getElementById('water_last');
    const waterCurrent = document.getElementById('water_current');
    const waterPrice = document.getElementById('water_total_price');

    // --- Helpers ---
    const getToken = () => sessionStorage.getItem('token');
    
    const formatCurrency = (amount) => parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    
    const formatDateForInput = (isoDate) => {
        if (!isoDate) return '';
        return new Date(isoDate).toISOString().split('T')[0];
    };

    const formatDateDisplay = (isoDate) => {
        return new Date(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // --- 1. Fetch & Render Data ---
    async function fetchPayments() {
        const token = getToken();
        if(!token) {
            window.location.href = '../../index.html';
            return;
        }

        try {
            const res = await fetch(API_BASE, { 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
            
            if (!res.ok) throw new Error("Failed to fetch payments");

            const data = await res.json();
            allPaymentsData = data; // เก็บข้อมูลดิบลงตัวแปร Global
            applyFilters();         // เรียกใช้ Filter เพื่อแสดงผล

        } catch (error) {
            console.error('Fetch Error:', error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error loading data</td></tr>`;
        }
    }

    // --- 2. Filter Logic (Client-Side) ---
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = filterStatus.value;

        const filteredData = allPaymentsData.filter(item => {
            const matchStatus = (statusValue === 'all' || statusValue === '') || (item.payment_status === statusValue);
            const matchRoom = item.room_number.toLowerCase().includes(searchTerm);
            return matchStatus && matchRoom;
        });

        renderTable(filteredData);
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        
        if(data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#999;">No records found</td></tr>`;
            return;
        }

        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${item.room_number}</strong></td>
                <td>${formatDateDisplay(item.billing_date)}</td>
                <td class="amount">฿ ${formatCurrency(item.total_amount)}</td>
                <td><span class="badge ${item.payment_status}">${item.payment_status}</span></td>
                <td>
                    <button class="action-btn look" onclick="handleView(${item.payment_id})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn edit" onclick="handleEdit(${item.payment_id})"><i class="fas fa-pen"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- 3. Modal Actions (Create / Edit / View) ---
    async function openModal(mode, id = null) {
        currentMode = mode;
        currentPaymentId = id;
        
        modal.classList.add('active');
        form.reset();
        summaryBox.style.display = 'none';
        
        // Reset Inputs State
        mRoom.disabled = false;
        enableInputs(true);

        // UI Setup based on Mode
        if (mode === 'create') {
            setupCreateMode();
        } else {
            await setupEditOrViewMode(mode, id);
        }
    }

    function setupCreateMode() {
        modalTitle.textContent = 'Create New Invoice';
        mDate.value = new Date().toISOString().split('T')[0];
        currentContractId = null;
        
        if(saveBtn) saveBtn.style.display = 'block';
        if(calcBtn) calcBtn.style.display = 'flex';
    }

    async function setupEditOrViewMode(mode, id) {
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            // Fill Form Data
            currentContractId = data.contract_id;
            mRoom.value = data.room_number;
            mDate.value = formatDateForInput(data.billing_date);
            mDueDate.value = formatDateForInput(data.due_date);
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

            // Mode Specific UI
            mRoom.disabled = true; // Lock Room Number

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

        } catch (err) {
            console.error(err);
            alert("Error loading payment details");
            closeModal();
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        form.reset();
    }

    function enableInputs(enable) {
        const inputs = form.querySelectorAll('input:not(.input-readonly), select');
        inputs.forEach(inp => inp.disabled = !enable);
    }

    // --- 4. Auto Fetch Room Info (Create Mode) ---
    mRoom.addEventListener('blur', async () => {
        if (currentMode !== 'create') return; 

        const roomNo = mRoom.value.trim();
        if (!roomNo) return;

        try {
            const token = getToken();
            const res = await fetch(`${API_BASE}/billing-info/${roomNo}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                currentContractId = data.contract_id;
                
                // Set Last Meter & Room Price
                elecLast.value = data.last_elec;
                waterLast.value = data.last_water;
                roomFeeInput.value = data.room_price;
                roomTypeSelect.value = parseInt(data.room_price); 
                
                // Clear Current Meter & Focus
                elecCurrent.value = '';
                waterCurrent.value = '';
                elecCurrent.focus();
            } else {
                alert(data.message || 'Room not found or no active contract.');
                mRoom.value = '';
                currentContractId = null;
            }
        } catch (error) { console.error(error); }
    });

    // --- 5. Calculation Logic ---
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const rent = parseFloat(roomFeeInput.value) || 0;
            
            // Electricity
            const eLast = parseFloat(elecLast.value) || 0;
            const eCurr = parseFloat(elecCurrent.value) || 0;
            const eUnits = Math.max(0, eCurr - eLast);
            const eTotal = eUnits * RATES.ELECTRICITY;
            elecPrice.value = eTotal.toFixed(2);

            // Water
            const wLast = parseFloat(waterLast.value) || 0;
            const wCurr = parseFloat(waterCurrent.value) || 0;
            const wUnits = Math.max(0, wCurr - wLast);
            const wTotal = wUnits * RATES.WATER;
            waterPrice.value = wTotal.toFixed(2);

            // Grand Total
            const grandTotal = rent + eTotal + wTotal;
            mTotal.value = grandTotal.toFixed(2);

            // Update Summary Display
            document.getElementById('units-elec-display').textContent = eUnits;
            document.getElementById('units-water-display').textContent = wUnits;
            document.getElementById('sum-total-display').textContent = formatCurrency(grandTotal);
            
            summaryBox.style.display = 'block';
        });
    }
    
    // Sync Room Fee with Dropdown
    if (roomTypeSelect) {
        roomTypeSelect.addEventListener('change', () => {
            const fee = parseFloat(roomTypeSelect.value) || 0;
            roomFeeInput.value = fee.toFixed(2);
        });
    }

    // --- 6. Form Submit ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!currentContractId) {
            alert('Error: No Contract ID found. Please re-check the room number.');
            return;
        }

        const payload = {
            contract_id: currentContractId,
            billing_date: mDate.value,
            due_date: mDueDate.value || null,
            electricity_meter_last: parseFloat(elecLast.value) || 0,
            electricity_meter_current: parseFloat(elecCurrent.value) || 0,
            electricity_fee: parseFloat(elecPrice.value) || 0,
            water_meter_last: parseFloat(waterLast.value) || 0,
            water_meter_current: parseFloat(waterCurrent.value) || 0,
            water_fee: parseFloat(waterPrice.value) || 0,
            room_fee: parseFloat(roomFeeInput.value) || 0,
            total_amount: parseFloat(mTotal.value) || 0,
            payment_status: mStatus.value
        };

        const token = getToken();
        let url = API_BASE;
        let method = 'POST';

        if (currentMode === 'edit') {
            url = `${API_BASE}/${currentPaymentId}`;
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

            const data = await res.json();

            if (res.ok) {
                alert(data.message || (currentMode === 'create' ? 'Invoice created!' : 'Invoice updated!'));
                closeModal();
                fetchPayments(); // Refresh Table
            } else {
                alert('Operation failed: ' + (data.message || 'Unknown error'));
            }
        } catch (error) { 
            console.error(error);
            alert("Server Error");
        }
    });

    // --- 7. Event Listeners ---
    
    // Expose functions to window for onclick in HTML
    window.handleView = (id) => openModal('view', id);
    window.handleEdit = (id) => openModal('edit', id);

    // Filter Listeners
    if(searchInput) searchInput.addEventListener('input', applyFilters); // เปลี่ยนจาก keyup เป็น input เพื่อความลื่นไหล
    if(filterStatus) filterStatus.addEventListener('change', applyFilters);

    // Modal & Sidebar
    addBtn.addEventListener('click', () => openModal('create'));
    cancelBtn.addEventListener('click', closeModal);
    
    // ปิด Modal เมื่อคลิกพื้นหลัง
    window.addEventListener('click', (e) => { 
        if (e.target === modal) closeModal(); 
    });

    // Sidebar Toggle Logic
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (menuToggle && sidebar) {
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

    // Initialize
    fetchPayments();
});