document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_URL = 'http://localhost:3030/api/auth/login';
    
    // กำหนด Path ปลายทางของแต่ละ Role
    const REDIRECT_PATHS = {
        ADMIN: '/pages/admin/dashboard.html',
        TENANT: '/pages/user/user.html'
    };

    // --- UI Elements ---
    const identifierInput = document.getElementById('identifier');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');

    // --- Helper: Manage Storage ---
    const saveSession = (token, user) => {
        // 1. ล้างข้อมูลเก่าทั้งหมดก่อน เพื่อความชัวร์ (ป้องกัน Token ตีกัน)
        localStorage.clear();
        sessionStorage.clear();

        // 2. แยกเก็บตาม Role
        if (user.role === 'admin') {
            // Admin: เก็บใน Session (ปิด Browser หาย)
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
            sessionStorage.setItem('user_role', 'admin'); // เก็บ Role แยกเพื่อให้ Auth Guard เช็คง่าย
        } else {
            // Tenant: เก็บใน Local (จำค่าไว้)
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('user_role', 'tenant');
        }
    };

    // --- Main Logic ---
    async function handleLogin(e) {
        if (e) e.preventDefault(); // ป้องกัน Form Submit (ถ้ามี tag <form>)

        const identifier = identifierInput.value.trim();
        const password = passwordInput.value.trim();

        // Validation
        if (!identifier || !password) {
            alert('กรุณากรอก Username/Email และ Password');
            return;
        }

        // UI Loading State
        const originalBtnText = loginBtn.innerText;
        loginBtn.innerText = 'กำลังเข้าสู่ระบบ...';
        loginBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            
            const data = await response.json();

            if (response.ok) {
                // Login Success
                const { token, user } = data; 
                
                // Save Token & User info
                saveSession(token, user);

                // Redirect
                if (user.role === 'admin') {
                    window.location.href = REDIRECT_PATHS.ADMIN;
                } else {
                    window.location.href = REDIRECT_PATHS.TENANT;
                }

            } else {
                // Login Failed (Backend ส่ง error มา)
                alert(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            }

        } catch (error) {
            console.error('Login Error:', error);
            alert('ไม่สามารถเชื่อมต่อ Server ได้ กรุณาลองใหม่ภายหลัง');
        } finally {
            // Reset Button state
            loginBtn.innerText = originalBtnText;
            loginBtn.disabled = false;
        }
    }

    // --- Event Listeners ---
    
    // คลิกปุ่ม Login
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // กด Enter ในช่อง Input (ใช้ keydown แทน keypress ที่เริ่มเก่าแล้ว)
    const handleEnterKey = (e) => {
        if (e.key === 'Enter') handleLogin(e);
    };

    if (identifierInput) identifierInput.addEventListener('keydown', handleEnterKey);
    if (passwordInput) passwordInput.addEventListener('keydown', handleEnterKey);
});