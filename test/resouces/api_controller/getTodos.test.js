const assert = require('power-assert');
const requestHelper = require('../../helper/requestHelper');
const { todo, sequelize } = require('../../../src/db/models');

describe('API GET /api/todos/ TEST', () => {
    before(async () => {
        for (let i = 0; i < 5; i++) {
            const insertTodo = {
                title: 'test title' + i,
                body: 'test body' + i
            };
            await todo.create(insertTodo);
        }
    });
    after(async () => {
        await sequelize.truncate();
        await sequelize.close();
    });

    it('正常系のテスト', async () => {
        const response = await requestHelper.request({
            method: 'get',
            endPoint: '/api/todos',
            statusCode: 200
        });
        const todos = response.body.data;
        assert.strictEqual(Array.isArray(todos), true);
        assert.strictEqual(todos.length, 5);
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