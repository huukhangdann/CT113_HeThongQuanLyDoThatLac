/**
 * Hàm xử lý sự kiện đăng nhập khi submit form
 */
async function handleLogin() {
    // 1. Lấy giá trị từ các ô input thông qua ID
    const accountElement = document.getElementById('username-input') || document.getElementById('login-account');
    const passwordElement = document.getElementById('password-input');
    const accountInput = accountElement?.value.trim() || '';
    const passwordInput = passwordElement?.value || '';

    // Kiểm tra nhanh phía client
    if (!accountInput || !passwordInput) {
        alert("Vui lòng nhập đầy đủ tài khoản và mật khẩu!");
        return;
    }

    const payload = {
        email: accountInput,
        password: passwordInput
    };

    try {
        console.log("[Client] Đang gửi yêu cầu đăng nhập lên server...");

        // 2. Bắn Fetch API lên Backend Express
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            if (!result.user || typeof result.user !== "object" || !result.user.ND_id) {
                throw new Error("Máy chủ không trả về thông tin tài khoản hợp lệ.");
            }

            localStorage.setItem('currentUser', JSON.stringify(result.user));
            localStorage.setItem('ctu_user_name', result.user.ND_HoTen || '');
            localStorage.setItem('ctu_user_id', result.user.ND_id);
            localStorage.setItem('ctu_user_role', result.user.role || 'user');
            localStorage.setItem('ctu_user_logged_in', 'true');
            if (result.user.role === 'admin' && result.token) {
                localStorage.setItem('ctu_admin_token', result.token);
            } else {
                localStorage.removeItem('ctu_admin_token');
            }

            window.location.href = result.user.role === 'admin' ? 'admin.html' : 'index.html';
        } else {
            // Đăng nhập thất bại (sai mật khẩu, không tìm thấy email,...)
            console.warn("[Client] Đăng nhập thất bại:", result.message);
            alert(`Đăng nhập thất bại: ${result.message}`);
        }

    } catch (error) {
        console.error("[Client Error] Lỗi kết nối tới server:", error);
        alert(error.message || "Không thể kết nối tới server backend. Hãy kiểm tra xem server đã bật chưa nhé!");
    }
}