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
        const id = req.params.id;
        const { title, body, complete } = req.body;
        console.log({id, title, body, complete});
        res.json({id, title, body, complete});
    },
    deleteTodo: (req, res) => {
        send(res, statusCode.OK, 'deleteTodo', false);
    }
};