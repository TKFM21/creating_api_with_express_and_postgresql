'use strict'
// 厳格モードを指定

const db = require('../db/models/');

// 引数をdataキーでオブジェクト形式で戻す
const formatResponseData = (data) => ({ data });

module.exports = {
    getTodos: async (req, res) => {
        try {
            const todos = await db.todo.findAll({
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
    postTodo: (req, res) => {
        send(res, statusCode.OK, 'postTodo', false);
    },
    putTodo: (req, res) => {
        send(res, statusCode.OK, 'putTodo', false);
    },
    deleteTodo: (req, res) => {
        send(res, statusCode.OK, 'deleteTodo', false);
    }
};