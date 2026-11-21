exports.authenticateUser = (db, account, password) => {
    // 1. Kiểm tra xem bảng NguoiDung có tồn tại trên RAM không
    if (!db || !db.NguoiDung) {
        throw new Error("Database chưa được khởi tạo hoặc thiếu bảng NguoiDung trên RAM!");
    }

    // 2. Tìm theo email, mã số sinh viên hoặc số điện thoại
    const users = Object.values(db.NguoiDung);
    const normalizedAccount = String(account).trim().toLowerCase();
    const foundUser = users.find(user =>
        [user.ND_email, user.ND_id, user.ND_SDT]
            .some(value => String(value || "").trim().toLowerCase() === normalizedAccount)
    );

    if (!foundUser) {
        throw new Error("Tài khoản đăng nhập không tồn tại trong hệ thống!");
    }

    // 3. Kiểm tra mật khẩu (So sánh trực tiếp chuỗi mật khẩu)
    if (foundUser.ND_MatKhau !== password) {
        throw new Error("Mật khẩu không chính xác, vui lòng thử lại!");
    }

    // 4. Trả về thông tin user (loại bỏ mật khẩu ra cho an toàn)
    const { ND_MatKhau, ...userInfo } = foundUser;
    return userInfo;
};