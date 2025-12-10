const API_URL = 'http://localhost:3030/api/auth';

const identifierInput = document.getElementById('identifier');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');

async function handleLogin() {
    const identifier = identifierInput.value.trim();
    const password = passwordInput.value.trim();

    if (!identifier || !password) {
        alert('กรุณากรอก Username และ Password');
        return;
    }

    try{
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ identifier, password })
        });
        
        const data = await response.json();

        if(response.ok){
            const {token, user} = data; 

            if(user.role === 'admin'){
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(user));

                window.location.href = '/pages/admin/dashboard.html';
            }
            else{
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                window.location.href = '/pages/user/dash-board.html';
            }

        }
        else{
            alert(data.error || 'login fail');
        }
    }
    catch (error){
        console.log('Error', error);
        alert('can not connect to server');
    }
}

loginBtn.addEventListener('click', handleLogin);

identifierInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleLogin();
});
passwordInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleLogin();
});