const API_URL = 'http://localhost:3030/api/auth';

const identifierInput = document.getElementById('identifier');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');

async function handleLogin() {
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value.trim();

    if (!identifier || !password) {
        alert('กรุณากรอก Username/Email และ Password');
        return;
    }

    const originalBtnText = loginBtn.innerText;
    loginBtn.innerText = 'กำลังเข้าสู่ระบบ...';
    loginBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
        });
        
        const data = await response.json();

        if (response.ok) {
            const { token, user } = data; 

            if (user.role === 'admin') {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(user));
                
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                window.location.href = '/pages/admin/dashboard.html';
            } else {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');

                window.location.href = '/pages/user/dash-board.html';
            }
        } else {
            alert(data.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert('ไม่สามารถเชื่อมต่อ Server ได้ กรุณาลองใหม่ภายหลัง');
    } finally {
        loginBtn.innerText = originalBtnText;
        loginBtn.disabled = false;
    }
}

loginBtn.addEventListener('click', handleLogin);

identifierInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleLogin();
});
passwordInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleLogin();
});