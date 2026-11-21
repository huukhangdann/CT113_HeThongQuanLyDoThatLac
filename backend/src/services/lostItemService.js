const path = require('path');
const {saveRecord} = require('../../database/engine/write');

/**
 * Xử lý logic nghiệp vụ tạo tin mất đồ kèm mảng hình ảnh và các thuộc tính màu sắc chuẩn xác
 */
exports.createLostItemWithMultipleImages = (db, reqBody, reqFiles) => {
    const dbFolderPath = path.join(__dirname, '../../database/records');

    // Lấy dữ liệu từ form gửi lên
    const { 
        bmId, 
        timeMat, 
        moTa, 
        mauChuDao, 
        mauPhu1, 
        mauPhu2, 
        mauPhu3, 
        ndId, 
        doId, 
        ldId,
        locationText
    } = reqBody;

    const normalizedLdId = String(ldId || '').trim().toUpperCase();
    const category = Object.values(db.LoaiDo || {}).find(
        record => String(record.LD_id || '').trim().toUpperCase() === normalizedLdId
    );
    if (!category) {
        const error = new Error('Loại đồ vật không hợp lệ.');
        error.statusCode = 400;
        throw error;
    }
    if (!ndId || !Object.values(db.NguoiDung || {}).some(
        record => String(record.ND_id || '') === String(ndId)
    )) {
        const error = new Error('Mã người dùng không tồn tại trong hệ thống.');
        error.statusCode = 400;
        throw error;
    }

    // 1. Xử lý mảng hình ảnh (Lưu vào bảng HinhAnh theo đúng format yêu cầu)
    const listImageIds = [];
    if (reqFiles && reqFiles.length > 0) {
        reqFiles.forEach((file, index) => {
            const haId = index === 0 ? "HA_" + Date.now() : `HA_${Date.now()}_${index}`;
            const imagePayload = {
                HA_id: haId,
                HA_URL: `/uploads/${file.filename}`, // Hoặc đường dẫn URL thực tế
                HA_Ten: file.originalname
            };

            // Lưu từng record ảnh vào bảng HinhAnh và đồng bộ vào RAM tổng
            saveRecord(dbFolderPath, "HinhAnh", haId, imagePayload, db);
            listImageIds.push(haId);
        });
    }

    // Lấy id của ảnh đầu tiên làm đại diện cho bảng BaoMat (hoặc chuỗi rỗng nếu không có ảnh)
    const primaryImageId = listImageIds.length > 0 ? listImageIds[0] : "";

    // 2. Tạo payload cho bảng BaoMat (Đảm bảo nếu không có màu phụ thì là chuỗi rỗng "")
    const newLossPayload = {
        BM_id: bmId || `BM_${Date.now()}`,
        BM_ThoiGianMat: timeMat ? Number(timeMat) : Date.now(),
        BM_ThoiGianDang: Date.now(),
        BM_MoTa: moTa || "",
        BM_DiaDiem: String(locationText || '').trim(),
        BM_TimThay: false,
        BM_MauChuDao: mauChuDao || "#000000",
        BM_MauPhu1: mauPhu1 || "",
        BM_MauPhu2: mauPhu2 || "",
        BM_MauPhu3: mauPhu3 || "",
        ND_id: ndId || "",
        DO_id: doId || "",
        LD_id: category.LD_id,
        HA_id: primaryImageId
    };

    // 3. Lưu record vào bảng BaoMat và đồng bộ ngay vào RAM tổng (`db.BaoMat`)
    if (!saveRecord(dbFolderPath, "BaoMat", newLossPayload.BM_id, newLossPayload, db)) {
        const error = new Error('Không thể lưu bài đăng báo mất.');
        error.statusCode = 500;
        throw error;
    }

    return {
        lossItem: newLossPayload,
        uploadedImagesCount: listImageIds.length
    };
};