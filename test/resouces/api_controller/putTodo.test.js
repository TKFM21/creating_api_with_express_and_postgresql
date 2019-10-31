const assert = require('power-assert');
const requestHelper = require('../../helper/requestHelper');
const { todo, sequelize } = require('../../../src/db/models');

const getAll = async () => {
    const response = await requestHelper.request({
        method: 'get',
        endPoint: '/api/todos',
        statusCode: 200
    });
    return response.body.data;
};

describe('API PUT /api/todos/:id TEST', () => {
    before(async () => {
        const promises = [];
        for (let i = 0; i < 5; i++) {
            const insertTodo = {
                title: 'test title' + i,
                body: 'test body' + i
            };
            const promise = todo.create(insertTodo);
            promises.push(promise);
        }
        await Promise.all(promises);
    });
    after(async () => {
        await sequelize.truncate();
    });

    it('正常系のテスト', async () => {
        const initTodos = await getAll();
        assert.strictEqual(initTodos.length, 5);

        const updateId = initTodos[0].id;
        const testData = {
            title: 'test update title',
            body: 'test update body',
            complete: true
        };
        const response = await requestHelper.request({
            method: 'put',
            endPoint: `/api/todos/${updateId}`,
            statusCode: 200
        }).send(testData);
        const updatedTodo = response.body;
        assert.strictEqual(typeof updatedTodo, 'object');
        assert.strictEqual(typeof updatedTodo.id, 'number');
        assert.strictEqual(typeof updatedTodo.title, 'string');
        assert.strictEqual(typeof updatedTodo.body, 'string');
        assert.strictEqual(typeof updatedTodo.complete, 'boolean');
        assert.strictEqual(typeof updatedTodo.createdAt, 'string');
        assert.strictEqual(typeof updatedTodo.updatedAt, 'string');

        assert.deepStrictEqual({ ...updatedTodo }, {
            id: updatedTodo.id,
            title: testData.title,
            body: testData.body,
            complete: testData.complete,
            createdAt: updatedTodo.createdAt,
            updatedAt: updatedTodo.updatedAt
        });
        assert.strictEqual(updatedTodo.createdAt < updatedTodo.updatedAt, true);

        const todos = await getAll();
        assert.strictEqual(Array.isArray(todos), true);
        assert.strictEqual(todos.length, 5);
    });

    it('存在しないidの場合、404エラー', async () => {
        const todos = await getAll();
        // テスト用に挿入したレコードの最後尾のidを取得して1加算したものをfailId
        const failId = todos[todos.length - 1].id + 1;
        const response = await requestHelper.request({
            method: 'put',
            endPoint: `/api/todos/${failId}`,
            statusCode: 404
        });
        assert.strictEqual(response.body.message, '存在しないidです');
    });

    it('idが数字以外の場合、400エラー', async () => {
        const response = await requestHelper.request({
            method: 'put',
            endPoint: '/api/todos/a',
            statusCode: 400
        });
        assert.strictEqual(response.body.message, 'idは不正な値です。(期待する型は1以上の 整数値 )');
    });
});