const test = require('node:test');
const assert = require('node:assert/strict');
const aiAnalysisService = require('./aiAnalysisService');

test('limits AI item type IDs to the current category list', () => {
    const schema = aiAnalysisService.buildCategorySchema([
        { id: 'NEW_TYPE', name: 'Danh mục mới' },
        { id: 'VI', name: 'Ví tiền' }
    ]);

    assert.deepEqual(schema.enum, ['NEW_TYPE', 'VI']);
    assert.match(schema.description, /NEW_TYPE.*Danh mục mới/);
    assert.match(schema.description, /VI.*Ví tiền/);
});

test('rejects an empty live category list for AI analysis', () => {
    assert.throws(
        () => aiAnalysisService.buildCategorySchema([]),
        /Danh mục loại đồ vật chưa sẵn sàng/
    );
});
