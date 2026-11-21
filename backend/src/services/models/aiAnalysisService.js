const fs = require('fs');
const { GoogleGenAI, Type } = require('@google/genai');

// Khởi tạo Gemini client (tự động lấy GEMINI_API_KEY từ file .env)
const ai = new GoogleGenAI({ apiKey: '' });

exports.analyzeFoundItemImagesWithSchema = async (imageFiles) => {
    if (!imageFiles || imageFiles.length === 0) {
        throw new Error("Vui lòng cung cấp ít nhất 1 hình ảnh!");
    }

    // Chuyển mảng file (từ multer trên Node.js) thành Base64 inlineData
    const imageParts = imageFiles.map(file => {
        let base64Data;
        if (file.buffer) {
            // Nếu dùng multer.memoryStorage()
            base64Data = file.buffer.toString('base64');
        } else if (file.path) {
            // Nếu dùng multer.diskStorage() hoặc dest: 'uploads/'
            base64Data = fs.readFileSync(file.path).toString('base64');
        } else {
            throw new Error("Định dạng file upload không hợp lệ (thiếu buffer hoặc path).");
        }

        return {
            inlineData: {
                data: base64Data,
                mimeType: file.mimetype || file.type || 'image/jpeg'
            }
        };
    });

    try {
        const response = await ai.models.generateContent({
            // Lưu ý: Kiểm tra lại tên model hợp lệ (ví dụ: 'gemini-2.5-flash-lite' hoặc 'gemini-2.5-flash')
            model: 'gemini-3.5-flash-lite', 
            contents: [
                ...imageParts,
                "Hãy phân tích các hình ảnh đồ vật thất lạc này và trích xuất thông tin chi tiết."
            ],
            config: {
                systemInstruction: "Bạn là trợ lý AI chuyên phân tích đồ vật thất lạc tại trường đại học. Hãy quan sát kỹ hình ảnh và điền thông tin chính xác.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "Tiêu đề ngắn gọn mô tả món đồ nhặt được."
                        },
                        type_id: {
                            type: Type.STRING,
                            description: "BẮT BUỘC phải chọn đúng MÃ LD_id viết tắt trong danh mục sau: 'DT': { 'LD_id': 'DT', 'LD_Ten': 'Điện thoại di động' }, 'LT': { 'LD_id': 'LT', 'LD_Ten': 'Laptop' }, 'MTB': { 'LD_id': 'MTB', 'LD_Ten': 'Máy tính bảng / iPad' }, 'TN': { 'LD_id': 'TN', 'LD_Ten': 'Tai nghe / AirPods / Earphone' }, 'SAC': { 'LD_id': 'SAC', 'LD_Ten': 'Sạc dự phòng / Pin dự phòng' }, 'CAP': { 'LD_id': 'CAP', 'LD_Ten': 'Cáp sạc / Dây sạc' }, 'USB': { 'LD_id': 'USB', 'LD_Ten': 'USB / Ổ cứng di động' }, 'CHUOT': { 'LD_id': 'CHUOT', 'LD_Ten': 'Chuột máy tính' }, 'BANPHIM': { 'LD_id': 'BANPHIM', 'LD_Ten': 'Bàn phím' }, 'LOA': { 'LD_id': 'LOA', 'LD_Ten': 'Loa bluetooth / Loa mini' }, 'DHDT': { 'LD_id': 'DHDT', 'LD_Ten': 'Đồng hồ thông minh / Smartwatch' }, 'MAYANH': { 'LD_id': 'MAYANH', 'LD_Ten': 'Máy ảnh / Camera' }, 'THE': { 'LD_id': 'THE', 'LD_Ten': 'Thẻ sinh viên' }, 'CCCD': { 'LD_id': 'CCCD', 'LD_Ten': 'Căn cước công dân / CMND' }, 'GPLX': { 'LD_id': 'GPLX', 'LD_Ten': 'Giấy phép lái xe' }, 'ATM': { 'LD_id': 'ATM', 'LD_Ten': 'Thẻ ngân hàng / Thẻ ATM' }, 'BHXH': { 'LD_id': 'BHXH', 'LD_Ten': 'Thẻ bảo hiểm y tế' }, 'VE': { 'LD_id': 'VE', 'LD_Ten': 'Vé xe buýt / Thẻ gửi xe' }, 'SACH': { 'LD_id': 'SACH', 'LD_Ten': 'Sách giáo khoa / Giáo trình' }, 'VO': { 'LD_id': 'VO', 'LD_Ten': 'Vở / Tập ghi chép' }, 'BUT': { 'LD_id': 'BUT', 'LD_Ten': 'Bút / Viết / Bút chì' }, 'THUOC': { 'LD_id': 'THUOC', 'LD_Ten': 'Thước kẻ / Eke / Compa' }, 'MAYTINH': { 'LD_id': 'MAYTINH', 'LD_Ten': 'Máy tính cầm tay / Calculator' }, 'FILE': { 'LD_id': 'FILE', 'LD_Ten': 'Bìa hồ sơ / File tài liệu' }, 'BALO': { 'LD_id': 'BALO', 'LD_Ten': 'Balo / Cặp sách' }, 'TUI': { 'LD_id': 'TUI', 'LD_Ten': 'Túi xách / Túi đeo chéo' }, 'VI': { 'LD_id': 'VI', 'LD_Ten': 'Ví tiền' }, 'CHIA': { 'LD_id': 'CHIA', 'LD_Ten': 'Chìa khóa (nhà / xe / phòng)' }, 'KINH': { 'LD_id': 'KINH', 'LD_Ten': 'Mắt kính / Kính cận' }, 'KINHM': { 'LD_id': 'KINHM', 'LD_Ten': 'Kính mát' }, 'NON': { 'LD_id': 'NON', 'LD_Ten': 'Nón / Mũ' }, 'AO': { 'LD_id': 'AO', 'LD_Ten': 'Áo khoác / Áo mưa' }, 'GIAY': { 'LD_id': 'GIAY', 'LD_Ten': 'Giày / Dép' }, 'TUIDT': { 'LD_id': 'TUIDT', 'LD_Ten': 'Túi đựng điện thoại' }, 'DAYDT': { 'LD_id': 'DAYDT', 'LD_Ten': 'Dây đeo điện thoại / Dây đeo thẻ' }, 'DH': { 'LD_id': 'DH', 'LD_Ten': 'Đồng hồ đeo tay' }, 'DAYCH': { 'LD_id': 'DAYCH', 'LD_Ten': 'Dây chuyền / Vòng cổ' }, 'VONG': { 'LD_id': 'VONG', 'LD_Ten': 'Vòng tay / Lắc tay' }, 'NHAN': { 'LD_id': 'NHAN', 'LD_Ten': 'Nhẫn' }, 'BONG_TAI': { 'LD_id': 'BONG_TAI', 'LD_Ten': 'Bông tai' }, 'XE': { 'LD_id': 'XE', 'LD_Ten': 'Xe đạp' }, 'XEDAPDIEN': { 'LD_id': 'XEDAPDIEN', 'LD_Ten': 'Xe đạp điện / Xe máy điện' }, 'MU': { 'LD_id': 'MU', 'LD_Ten': 'Mũ bảo hiểm' }, 'GANG': { 'LD_id': 'GANG', 'LD_Ten': 'Găng tay' }, 'AOMM': { 'LD_id': 'AOMM', 'LD_Ten': 'Áo mưa bộ' }, 'BONG_THE_THAO': { 'LD_id': 'BONG_THE_THAO', 'LD_Ten': 'Bóng (đá / rổ / chuyền)' }, 'VOT': { 'LD_id': 'VOT', 'LD_Ten': 'Vợt cầu lông / Vợt tennis' }, 'GIAYTT': { 'LD_id': 'GIAYTT', 'LD_Ten': 'Giày thể thao' }, 'BINH': { 'LD_id': 'BINH', 'LD_Ten': 'Bình nước / Bình giữ nhiệt' }, 'O': { 'LD_id': 'O', 'LD_Ten': 'Ô / Dù' }, 'THUOC_Y': { 'LD_id': 'THUOC_Y', 'LD_Ten': 'Thuốc / Hộp thuốc cá nhân' }, 'KHAN': { 'LD_id': 'KHAN', 'LD_Ten': 'Khăn / Khẩu trang' }, 'DUONG': { 'LD_id': 'DUONG', 'LD_Ten': 'Đồ trang điểm / Mỹ phẩm' }, 'KHAC': { 'LD_id': 'KHAC', 'LD_Ten': 'Khác' }, hoặc 'KHAC' nếu không có trong danh sách."
                        },
                        color: {
                            type: Type.OBJECT,
                            properties: {
                                primary: {
                                    type: Type.STRING,
                                    description: "Mã màu chủ đạo dạng HEX của hình ảnh trên, ví dụ #1c1c1c"
                                },
                                secondary: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "Mảng chứa từ 0 đến tối đa 3 mã màu phụ dạng HEX của hình ảnh trên"
                                }
                            },
                            required: ["primary", "secondary"]
                        },
                        des: {
                            type: Type.STRING,
                            description: "Mô tả chi tiết đặc điểm nhận dạng, vết xước, nhãn hiệu của món đồ trong hình ảnh trên."
                        }
                    },
                    required: ["title", "type_id", "color", "des"]
                },
                temperature: 0.1
            }
        });

        const parsedJson = JSON.parse(response.text);
        return parsedJson;

    } catch (error) {
        console.error("Lỗi Structured Output:", error);
        throw error;
    }
};