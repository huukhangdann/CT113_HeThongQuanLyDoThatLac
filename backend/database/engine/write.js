const fs = require('fs');
const path = require('path');

/**
 * Thêm hoặc cập nhật record vào file JSON VÀ đồng bộ trực tiếp vào RAM database tổng.
 * @param {string} dataFolderPath - Thư mục chứa các file JSON
 * @param {string} tableName - Tên bảng (ví dụ: 'BaoMat', 'NguoiDung')
 * @param {string} recordId - ID của record (ví dụ: 'BM_002')
 * @param {object} payload - Dữ liệu record
 * @param {object} [globalDb] - (Tùy chọn) Biến db tổng đang lưu trên RAM để đồng bộ trực tiếp
 */
function saveRecord(dataFolderPath, tableName, recordId, payload, globalDb = null) {
    const filePath = path.join(dataFolderPath, `${tableName}.json`);

    try {
        let tableData = {
            table_name: tableName,
            table_relation: [],
            records: {}
        };

        // 1. Đọc file cũ nếu có để giữ cấu trúc
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            tableData = JSON.parse(rawData);
        }

        if (!tableData.records) {
            tableData.records = {};
        }

        // 2. Ghi record mới vào dữ liệu bảng
        tableData.records[recordId] = payload;

        // 3. Ghi đè xuống file JSON trên ổ cứng ngay lập tức
        fs.writeFileSync(filePath, JSON.stringify(tableData, null, 4), 'utf-8');

        // 4. ĐỒNG BỘ NGAY LẬP TỨC VÀO BIẾN DB TỔNG TRÊN RAM (Nếu có truyền vào)
        if (globalDb) {
            // Đảm bảo bảng trên RAM đã tồn tại object
            if (!globalDb[tableName]) {
                globalDb[tableName] = {};
            }
            // Cập nhật record mới vào RAM
            globalDb[tableName][recordId] = payload;
            console.log(`[RAM Sync] Đã đồng bộ thành công record [${recordId}] vào RAM của bảng [${tableName}]!`);
        }

        console.log(`[Database File] Đã ghi thành công record [${recordId}] xuống file [${tableName}.json]!`);
        return true;
    } catch (error) {
        console.error(`[Database Error] Không thể ghi record vào bảng ${tableName}:`, error.message);
        return false;
    }
}

module.exports = {saveRecord};