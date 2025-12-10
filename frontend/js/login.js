const API_URL = 'http://localhost:3030/api/auth';

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = document.getElementById('identifier');
    const password = document.getElementById('password');

    try{
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            header: {'Content-Type': 'application/json'},
            body: JSON.stringify({ identifier, password })
        });
        
        const data = await response.json();

        if(response.ok){
            const {token, user} = data; 
        }

        if(user.role === 'admin'){
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));

            window.location.href('page/admin')
        }
    }
});