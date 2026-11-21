const test = require('node:test');
const assert = require('node:assert/strict');
const { FeatureScoreVector } = require('./featureScoreVector');

test('FeatureScoreVector handles empty secondary colors and identical attributes', () => {
    const item = {
        location: ['C1', 'Tầng 2'],
        time: 1000,
        colorprimary: '#123456',
        colorsecondary: [],
        description: 'Ví da màu nâu'
    };

    const [location, time, color, description] = FeatureScoreVector(item, item);

    assert.equal(location, 0.6);
    assert.equal(time, 1 / (1 + Math.exp(-4.8)));
    assert.equal(color, 0.85);
    assert.equal(description, 1);
});
