const assert = require('power-assert');
const requestHelper = require('../../helper/requestHelper');

describe('API GET /api/todos/ TEST', () => {
    it('正常系のテスト', async () => {
        const response = await requestHelper.request({
            method: 'get',
            endPoint: '/api/todos',
            statusCode: 200
        });
        const todos = response.body.data;
        assert.strictEqual(Array.isArray(todos), true);
        assert.strictEqual(todos.length > 1, true);
        todos.forEach(todo => {
            assert.strictEqual(typeof todo.id, 'number');
            assert.strictEqual(typeof todo.title, 'string');
            assert.strictEqual(typeof todo.body, 'string');
            assert.strictEqual(typeof todo.complete, 'boolean');
            assert.strictEqual(typeof todo.createdAt, 'string');
            assert.strictEqual(typeof todo.updatedAt, 'string');
        });
    });
});