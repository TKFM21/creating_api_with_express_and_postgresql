const assert = require('power-assert');
const requestHelper = require('../../helper/requestHelper');
const { sequelize } = require('../../../src/db/models');

const getAll = async () => {
    const response = await requestHelper.request({
        method: 'get',
        endPoint: '/api/todos',
        statusCode: 200
    });
    return response.body.data;
};

describe('API POST /api/todos/ TEST', () => {
    after(async () => {
        await sequelize.truncate();
    });

    it('正常系のテスト', async () => {
        const initTodos = await getAll();
        assert.strictEqual(initTodos.length, 0);

        const testData = {
            title: 'test title',
            body: 'test body'
        };
        const response = await requestHelper.request({
            method: 'post',
            endPoint: '/api/todos',
            statusCode: 200
        }).send(testData);
        const createdTodo = response.body.data;
        assert.deepStrictEqual({ ...createdTodo }, {
            id: createdTodo.id,
            title: testData.title,
            body: testData.body,
            complete: false,
            createdAt: createdTodo.createdAt,
            updatedAt: createdTodo.updatedAt
        });

        const todos = await getAll();
        assert.strictEqual(Array.isArray(todos), true);
        assert.strictEqual(todos.length, 1);
    });

    it('titleがない場合、400エラー', async () => {
        const failData = {
            body: 'test body'
        };
        const response = await requestHelper.request({
            method: 'post',
            endPoint: '/api/todos',
            statusCode: 400
        }).send(failData);
        assert.strictEqual(response.body.message, 'titleがありません。');
    });

    it('bodyがない場合、400エラー', async () => {
        const failData = {
            title: 'test title'
        };
        const response = await requestHelper.request({
            method: 'post',
            endPoint: '/api/todos',
            statusCode: 400
        }).send(failData);
        assert.strictEqual(response.body.message, 'bodyがありません。');
    });
});