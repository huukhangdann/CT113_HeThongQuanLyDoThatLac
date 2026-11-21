//[location, time_logistic, color, keyword]
import {LostAndFoundNeuralMatcher} from "../utils/Matrix.js"

const lostItem1 = {
    location: ["Khu A", "Tầng 2", "Phòng C1-201"],
    time: 1730700000000, // Thời điểm mất (Timestamp)
    colorprimary: "#1A1A1A", // Màu đen chính
    colorsecondary: ["#333333", "#000000", "#555555"], // Màu phụ
    description: "ví da màu đen đựng thẻ sinh viên"
};

// Tin đăng Nhặt được (Found) - Khớp thời gian ngắn, cùng khu vực, màu chuẩn
const foundItem1 = {
    location: ["Khu A", "Tầng 2", "Phòng C1-203"],
    time: 1730701800000, // Chênh lệch khoảng 30 phút (tính ra điểm logistic rất cao)
    colorprimary: "#1C1C1C", // HEX gần như y hệt
    colorsecondary: ["#333333", "#222222", "#444444"],
    description: "nhặt được ví da đen rơi ở hành lang"
};

const lostItem2 = {
    location: ["Khu KTX", "Tòa B", "Phòng B402"],
    time: 1730000000000, // Cách đây nhiều ngày
    colorprimary: "#C0C0C0", // Màu bạc (Laptop)
    colorsecondary: ["#808080", "#FFFFFF", "#333333"],
    description: "laptop dell gaming màu bạc dán sticker"
};

// Tin đăng Nhặt được (Found) - Lệch địa điểm hoàn toàn, lệch thời gian xa, màu sắc trái ngược
const foundItem2 = {
    location: ["Bãi xe", "Cổng chính", "Khu CNTT"],
    time: 1730700000000, // Thời gian cực kỳ lệch
    colorprimary: "#FF0000", // Màu đỏ rực (Chìa khóa)
    colorsecondary: ["#000000", "#FFD700", "#FFFFFF"],
    description: "chìa khóa xe máy có móc khóa hình gấu"
};

const lostItemMid = {
    location: ["Khu C", "Tầng trệt", "Sảnh chính"],
    time: 1730700000000, 
    colorprimary: "#0000FF", // Xanh dương
    colorsecondary: ["#FFFFFF", "#000000", "#CCCCCC"],
    description: "balo chống nước màu xanh đựng tài liệu học tập"
};

// Tin đăng Nhặt được (Found) - Cùng khu C nhưng khác sảnh, lệch thời gian kha khá (vài chục tiếng), màu sắc hơi đổi khác một chút
const foundItemMid = {
    location: ["Khu C", "Tầng 1", "Hành lang dãy A"],
    time: 1730850000000, // Lệch thời gian kha khá -> Kéo điểm logistic xuống mức trung bình (~0.5)
    colorprimary: "#1E90FF", // Xanh navy / sáng hơn một chút
    colorsecondary: ["#FFFFFF", "#AAAAAA", "#333333"],
    description: "nhặt được túi xách vải màu xanh ở khu giảng đường"
};

// Tin đăng Mất (Lost)
const lostItemMidExtreme = {
    location: ["Cơ sở chính", "Khu hiệu bộ", "Phòng họp 2"],
    time: 1730700000000, 
    colorprimary: "#4169E1", // Xanh Royal
    colorsecondary: ["#FFFFFF", "#000000", "#808080"],
    description: "sạc dự phòng màu xanh dương dung lượng lớn"
};

// Tin đăng Nhặt được (Found) - Cùng cơ sở, thời gian lệch kha khá (đẩy điểm logistic về tầm 0.5), màu hơi na ná, mô tả hơi khác chút
const foundItemMidExtreme = {
    location: ["Cơ sở chính", "Khu A", "Sảnh lớn"],
    time: 1730760000000, // Chênh lệch khoảng gần một ngày -> Điểm logistic sẽ lơ lửng tầm 0.5
    colorprimary: "#4682B4", // Xanh Steel (hơi khác một chút xíu)
    colorsecondary: ["#FFFFFF", "#111111", "#999999"],
    description: "nhặt được cục pin sạc màu xanh để ở ghế đá"
};


function hexToRgb(hex) {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    // Dùng Regex để tách các cụm màu Red, Green, Blue
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const ColorDistance = (colorA, colorB) => {
    const ColorA_RGB = hexToRgb(colorA);
    const ColorB_RGB = hexToRgb(colorB);

    return ColorA_RGB && ColorB_RGB ? Math.sqrt(ColorA_RGB.r * ColorB_RGB.r + ColorA_RGB.g * ColorB_RGB.g + ColorA_RGB.b * ColorB_RGB.b) : 0;
}

const ColorSimilarity = (colorA, colorB, default_value) => {
    return Math.max(0, 1 - (ColorDistance(colorA, colorB) / default_value));
}

const FeatureScoreVector = (found, loss) => {
    const ScoreVector = []

    //LOCATION
    const location_score = [0.3, 0.6, 1.0];

    let i = 0;
    let locationCore = 0;
    for (const location of found.location) {
        if (location == loss.location[i]) {
            locationCore = location_score[i];
            i++;
        } else break;
    }
    ScoreVector.push(locationCore);

    //TIME
    const timeScore = 1.0 / (1.0 + Math.exp(0.1 * (Math.abs(found.time /1000 / 3600 - loss.time/ 1000 / 3600) - 48)));
    ScoreVector.push(timeScore)

    //COLOR
    const Dmax = 441.673;
    const colorprimaryScore = ColorSimilarity(found.colorprimary, loss.colorprimary, Dmax);

    let sum = 0;
    for (let i = 0; i < found.colorsecondary.length; i++) {
        const temp = []
        for (let j = 0; j < loss.colorsecondary.length; j++) {
            temp.push(ColorSimilarity(found.colorsecondary[i], loss.colorsecondary[j], Dmax));
        }
        if (temp) sum += Math.max(...temp);
    }

    const colorsecondaryScore = sum / found.colorsecondary.length;
    const colorScore = 0.7 * colorprimaryScore + 0.3 * colorsecondaryScore;
    ScoreVector.push(colorScore);

    //DESCRIPTION
    const TokenFoundDes = String(found.description).split(" ");
    const TokenLossDes = String(loss.description).split(" ");

    let union = 0;
    for (let i = 0; i < TokenFoundDes.length; i++) {
        if (TokenLossDes.includes(TokenFoundDes[i])) union += 1;
    }

    const combinedArray = TokenFoundDes.concat(TokenLossDes);

    const uniqueWords = combinedArray.filter((word, index) => {
        return combinedArray.indexOf(word) === index;
    });

    const insection = uniqueWords.length;

    ScoreVector.push(union / insection);

    return ScoreVector;
}

const vector = FeatureScoreVector(foundItem1, lostItem1)
const vector1 = FeatureScoreVector(foundItem2, lostItem2)
const vector2 = FeatureScoreVector(foundItemMid, lostItemMid)
const vector3 = FeatureScoreVector(foundItemMidExtreme, lostItemMidExtreme)
console.log(vector);
console.log(vector1);
console.log(vector2);
console.log(vector3);



const c = new LostAndFoundNeuralMatcher()
const ouput = c.predict(vector[0], vector[1], vector[2], vector[3])
const ouput1 = c.predict(vector1[0], vector1[1], vector1[2], vector1[3])
const ouput2 = c.predict(vector2[0], vector2[1], vector2[2], vector2[3])
const ouput3 = c.predict(vector3[0], vector3[1], vector3[2], vector3[3])
console.log(ouput);
console.log(ouput1)
console.log(ouput2)
console.log(ouput3)