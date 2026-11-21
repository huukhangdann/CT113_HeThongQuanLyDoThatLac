const aiAnalysisService = require('../services/models/aiAnalysisService');

exports.analyzeImagesDraftController = async (req, res) => {
    try {
        // Chỉ gọi service phân tích lấy JSON trả về, không lưu database, không lưu ổ cứng
        const analysisResult = await aiAnalysisService.analyzeFoundItemImagesWithSchema(req.files);

        return res.status(200).json({
            success: true,
            message: "AI đã phân tích nháp thành công!",
            data: analysisResult
        });

    } catch (error) {
        console.error("[Controller Error]:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};