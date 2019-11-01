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

describe('API DELETE /api/todos/:id TEST', () => {
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

        const deleteId = initTodos[0].id;
        const response = await requestHelper.request({
            method: 'delete',
            endPoint: `/api/todos/${deleteId}`,
            statusCode: 200
        });
        const deletedTodo = response.body;
        assert.strictEqual(typeof deletedTodo, 'object');
        assert.strictEqual(typeof deletedTodo.id, 'number');
        assert.strictEqual(typeof deletedTodo.title, 'string');
        assert.strictEqual(typeof deletedTodo.body, 'string');
        assert.strictEqual(typeof deletedTodo.complete, 'boolean');
        assert.strictEqual(typeof deletedTodo.createdAt, 'string');
        assert.strictEqual(typeof deletedTodo.updatedAt, 'string');

        assert.deepStrictEqual({ ...deletedTodo }, {
            id: deleteId,
            title: deletedTodo.title,
            body: deletedTodo.body,
            complete: deletedTodo.complete,
            createdAt: deletedTodo.createdAt,
            updatedAt: deletedTodo.updatedAt
        });

        const todos = await getAll();
        assert.strictEqual(Array.isArray(todos), true);
        assert.strictEqual(todos.length, 4);
    });

    it('存在しないidの場合、404エラー', async () => {
        const todos = await getAll();
        // テスト用に挿入したレコードの最後尾のidを取得して1加算したものをfailId
        const failId = todos[todos.length - 1].id + 1;
        const response = await requestHelper.request({
            method: 'delete',
            endPoint: `/api/todos/${failId}`,
            statusCode: 404
        });
        assert.strictEqual(response.body.message, '存在しないidです');
    });

    it('idが数字以外の場合、400エラー', async () => {
        const response = await requestHelper.request({
            method: 'delete',
            endPoint: '/api/todos/a',
            statusCode: 400
        });
        assert.strictEqual(response.body.message, 'idは不正な値です。(期待する型は1以上の 整数値 )');
    });
});