'use strict'
// 厳格モードを指定

const { todo, sequelize } = require('../db/models');

// 引数をdataキーでオブジェクト形式で戻す
const formatResponseData = (data) => ({ data });

module.exports = {
    getTodos: async (req, res) => {
        try {
            const todos = await todo.findAll({
                order: [
                    ['id', 'ASC']
                ],
                raw: true // モデルとして変換されてない生の結果
            });

            // {data: [{id:1...}, {}, {}...]}の形式でres
            res.status(200).json(formatResponseData(todos));
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    postTodo: async (req, res) => {
        let transaction;
        try {
            transaction = await sequelize.transaction();
            const { title, body, complete = false } = req.body;

            const createdTodo = await todo.create(
                {
                    title,
                    body,
                    complete
                },
                { transaction }
            );

            await transaction.commit();
            res.status(200).json(formatResponseData(createdTodo));
        } catch (error) {
            await transaction.rollback();
            res.status(400).json({ message: error.message });
        }
    },
    putTodo: async (req, res) => {
        let transaction;
        try {
            transaction = await sequelize.transaction();
            const id = req.params.id;
            // 指定されたidが存在するか確認
            const targetTodo = await todo.findByPk(id, { transaction });
            if (!targetTodo) {
                // 存在しないidが指定された場合はnullが返る
                const error = new Error('存在しないidです');
                error.status = 404;
                throw error;
            }
            const { title, body, complete } = req.body;
            await targetTodo.update({ title, body, complete }, { transaction });
            await transaction.commit();
            res.status(200).json(targetTodo.dataValues);
        } catch (error) {
            await transaction.rollback();
            const errorStatus = error.status || 400;
            const dbErrorIntPattern = /^integerに対する不正な入力構文:/;
            if (error.message.match(dbErrorIntPattern)) {
                error.message = 'idは不正な値です。(期待する型は1以上の 整数値 )';
            }
            res.status(errorStatus).json({ message: error.message });
        }
    },
    deleteTodo: (req, res) => {
        send(res, statusCode.OK, 'deleteTodo', false);
    }
};