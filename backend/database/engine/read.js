const fs = require('fs');
const path = require('path');

function loadDatabase(dataFolderPath) {
    const tableNames = [
        "NguoiDung",
        "Lop",
        "VaiTro",
        "Nganh",
        "DonVi",
        "Toa",
        "Tang",
        "Phong",
        "DiaDiem",
        "LoaiDo",
        "TrangThaiBaoNhat",
        "HinhAnh",
        "BaoNhat",
        "BaoMat",
        "DanhGia",
        "YeucauNhanDo",
        "TuongThich"
    ];

    const database = {};

    tableNames.forEach(tableName => {
        try {
            const filePath = path.join(dataFolderPath, `${tableName}.json`);
            
            // Kiểm tra xem file có tồn tại hay không trước khi đọc
            if (fs.existsSync(filePath)) {
                const rawData = fs.readFileSync(filePath, 'utf-8');
                const parsedData = JSON.parse(rawData);
                
                // Gán vào map tổng theo đúng yêu cầu: { tableName: records }
                // Nếu cấu trúc file JSON của anh có dạng { table_name, records: {...} }, 
                // ta bóc lấy phần records bên trong cho tiện thao tác:
                database[tableName] = parsedData.records || parsedData;
            } else {
                console.warn(`Cảnh báo: Không tìm thấy file dữ liệu cho bảng ${tableName}.json`);
                database[tableName] = {};
            }
        } catch (error) {
            console.error(`Lỗi khi đọc file bảng ${tableName}:`, error.message);
            database[tableName] = {};
        }
    });

    return database;
}

module.exports = loadDatabase;