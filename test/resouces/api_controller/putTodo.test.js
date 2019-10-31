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
        const updatedTodo = response.body.data;
        assert.strictEqual(Array.isArray(updatedTodo), true);
        assert.strictEqual(updatedTodo.length, 1);
        updatedTodo.forEach(todo => {
            assert.strictEqual(typeof todo.id, 'number');
            assert.strictEqual(typeof todo.title, 'string');
            assert.strictEqual(typeof todo.body, 'string');
            assert.strictEqual(typeof todo.complete, 'boolean');
            assert.strictEqual(typeof todo.createdAt, 'string');
            assert.strictEqual(typeof todo.updatedAt, 'string');

            assert.deepStrictEqual({ ...todo }, {
                id: todo.id,
                title: testData.title,
                body: testData.body,
                complete: testData.complete,
                createdAt: todo.createdAt,
                updatedAt: todo.updatedAt
            });

            assert.strictEqual(todo.createdAt < todo.updatedAt, true);
        });

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
        assert.strictEqual(response.body.message, 'integerに対する不正な入力構文: \"a\"');
    });
});