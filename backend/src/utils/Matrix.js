// neural_matcher.js

class LostAndFoundNeuralMatcher {
    constructor() {
        // Trọng số tầng ẩn (12 neurones x 4 inputs) từ C++ truyền sang
        this.w1 = [
            [-0.534486, -0.326029, -1.52909,  0.53758],
            [ 0.857345, -0.718911, -0.534798, -0.219523],
            [-1.07455,  -0.0990441,-0.833213, -0.0726988],
            [ 0.0817007,-0.012346, -0.702757,  0.274124],
            [ 2.93134,  -3.72506,  -2.98468,  1.20575],
            [ 3.16896,   2.13991,   1.74566, -0.15724],
            [-0.023242, -1.17074,  -0.962,    0.301176],
            [ 0.283295,  0.831814, -0.815517, 0.789467],
            [-0.899306, -0.651112, -0.280737, 0.293319],
            [ 0.553888,  1.0509,    1.15673,  0.0542048],
            [ 3.60316,   2.07155,   1.80733, -0.0420475],
            [-0.824136, -0.915297,  0.500763, -0.469859]
        ];

        // Bias tầng ẩn (12 chiều)
        this.b1 = [
            2.48416, -0.120073, 0.00199607, -0.24103,
            1.57312, -3.68402,   0.084958,   -0.303795,
            2.32948, -1.58451,  -3.85723,   -0.0137937
        ];

        // Trọng số tầng đầu ra (1 x 12)
        this.w2 = [
            -2.4796,  0.260862, -0.0824189, 0.170494,
            -5.29246, 4.73339,  -0.206375,  0.270672,
            -2.3095,  1.80984,   5.02562,   0.51187
        ];

        // Bias đầu ra
        this.b2 = -2.67925;
    }

    // Hàm kích hoạt Leaky ReLU
    leakyRelu(x, alpha = 0.01) {
        return x > 0 ? x : alpha * x;
    }

    // Hàm kích hoạt Sigmoid
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    predict(locationScore, timeScore, colorScore, keywordScore) {
        const inputs = [locationScore, timeScore, colorScore, keywordScore];
        const hiddenLayerOutput = [];

        for (let i = 0; i < 12; i++) {
            let sum = this.b1[i];
            for (let j = 0; j < 4; j++) {
                sum += this.w1[i][j] * inputs[j];
            }
            hiddenLayerOutput.push(this.leakyRelu(sum));
        }

        let finalSum = this.b2;
        for (let i = 0; i < 12; i++) {
            finalSum += this.w2[i] * hiddenLayerOutput[i];
        }

        return this.sigmoid(finalSum);
    }
}

module.exports = { LostAndFoundNeuralMatcher };