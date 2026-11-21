const fs = require('fs');
const { GoogleGenAI, Type } = require('@google/genai');

// Khởi tạo Gemini client (tự động lấy GEMINI_API_KEY từ file .env)
const ai = new GoogleGenAI({ apiKey: '' });

const buildCategorySchema = categories => {
    const availableCategories = (Array.isArray(categories) ? categories : [])
        .map(category => ({
            id: String(category.id || '').trim(),
            name: String(category.name || '').trim()
        }))
        .filter(category => category.id && category.name);
    if (availableCategories.length === 0) {
        throw new Error('Danh mục loại đồ vật chưa sẵn sàng.');
    }

    return {
        type: Type.STRING,
        enum: availableCategories.map(category => category.id),
        description: `Chỉ chọn mã loại đồ trong danh mục hiện có: ${availableCategories
            .map(category => `'${category.id}': ${category.name}`)
            .join('; ')}.`
    };
};

exports.buildCategorySchema = buildCategorySchema;

exports.analyzeFoundItemImagesWithSchema = async (imageFiles, categories) => {
    if (!imageFiles || imageFiles.length === 0) {
        throw new Error("Vui lòng cung cấp ít nhất 1 hình ảnh!");
    }

    const categorySchema = buildCategorySchema(categories);

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
                            ...categorySchema
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