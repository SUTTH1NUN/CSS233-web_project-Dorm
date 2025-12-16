// frontend/js/auth-guard.js

(function(){
    // --- 1. Constants & Configuration ---
    // กำหนด Path ของหน้า Login (ปรับแก้ได้ตามตำแหน่งไฟล์จริง)
    const LOGIN_PAGE = '/index.html'; 
    
    // --- 2. Get Credentials ---
    // เช็คทั้ง Session (Admin) และ Local (Tenant)
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    
    // รองรับทั้งการเก็บแบบ Object (user) หรือเก็บเฉพาะ Role (user_role)
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    const roleStr = sessionStorage.getItem('user_role') || localStorage.getItem('user_role');

    let userRole = null;

    // Logic: พยายามหา Role ของผู้ใช้
    if (roleStr) {
        userRole = roleStr;
    } else if (userStr) {
        try {
            const user = JSON.parse(userStr);
            userRole = user.role;
        } catch (e) {
            console.error("Auth Guard: Error parsing user data", e);
        }
    }

    // ฟังก์ชันสำหรับดีดกลับหน้า Login
    const redirectToLogin = (reason) => {
        console.warn(`Redirecting to login: ${reason}`);
        // alert(reason); // แนะนำให้ปิด Alert เพื่อ UX ที่ดี (ให้ดีดไปเงียบๆ หรือหน้า 403 แทน)
        
        // ใช้ origin + path เพื่อความชัวร์
        window.location.href = window.location.origin + LOGIN_PAGE;
    };

    // --- 3. Validation Logic ---

    // 3.1 เช็คว่ามี Token และ Role หรือไม่
    if (!token || !userRole) {
        redirectToLogin("No active session found");
        return; // จบการทำงานทันที
    }

    const currentPath = window.location.pathname;

    // 3.2 Admin Guard: ถ้าอยู่ในโฟลเดอร์ admin แต่ role ไม่ใช่ admin
    // ใช้ .includes('/admin/') เพื่อครอบคลุมทุกไฟล์ใน folder admin
    if (currentPath.includes('/admin/') && userRole !== 'admin') {
        redirectToLogin("Unauthorized access to Admin area");
        return;
    }

    // 3.3 Tenant Guard: ถ้าอยู่ในโฟลเดอร์ user แต่ role ไม่ใช่ tenant
    if (currentPath.includes('/user/') && userRole !== 'tenant') {
        // กรณี Admin เผลอเข้ามาหน้านี้ อาจจะ redirect ไปหน้า dashboard admin แทนก็ได้
        // แต่เบื้องต้นให้ดีดออกไปก่อนเพื่อความปลอดภัย
        redirectToLogin("Unauthorized access to Tenant area");
        return;
    }

    // ถ้าผ่านทุกเงื่อนไข ก็ปล่อยให้โหลดหน้าเว็บต่อไป...
    console.log(`Access granted as ${userRole}`);

})();