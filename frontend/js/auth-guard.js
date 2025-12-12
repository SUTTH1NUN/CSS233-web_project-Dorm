// frontend/js/auth-guard.js
(function(){
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    indexPage = window.location.origin + '/index.html';


    if(!token || !user){
        console.log('go login');
        alert('go back to login');

        window.location.href = indexPage;
        return;
    }

    const currentPage = window.location.pathname;
    if(currentPage.includes('/pages/admin/dashboard.html') && user.role !== 'admin'){
        console.log('hacker!!')
        alert('แปลกๆน้าาาา hacker ป่าวเนี่ย');

        window.location.href = indexPage;
    }

    if(currentPage.includes('/pages/user/dash-board.html') && user.role !== 'tenant'){
        console.log('admin มาหน้านี้ทำไม');
        alert('admin มาหน้านี้ทำไม');

        window.location.href = indexPage;
    }

})();