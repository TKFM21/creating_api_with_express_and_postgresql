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
        const insertTodo = {};
        try {
            transaction = await sequelize.transaction();
            if (!req.body.title) {
                throw new Error('titleがありません。');
            } else {
                insertTodo.title = req.body.title;
            }
            if (!req.body.body) {
                throw new Error('bodyがありません。');
            } else {
                insertTodo.body = req.body.body;
            }
            if (!req.body.complete) {
                insertTodo.complete = false;
            } else {
                insertTodo.complete = req.body.complete;
            }

            const createdTodo = await todo.create(insertTodo, { transaction });

            await transaction.commit();
            res.status(200).json(formatResponseData(createdTodo));
        } catch (error) {
            await transaction.rollback();
            res.status(400).json({ message: error.message });
        }
    },
    putTodo: (req, res) => {
        send(res, statusCode.OK, 'putTodo', false);
    },
    deleteTodo: (req, res) => {
        send(res, statusCode.OK, 'deleteTodo', false);
    }
};