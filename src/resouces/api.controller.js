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
        try {
            const { dataValues: createdTodo } = await sequelize.transaction(
                async (transaction) => {
                    const { title, body, complete = false } = req.body;
                    return await todo.create(
                        { title, body, complete },
                        { transaction }
                    );
                }
            );
            res.status(200).json(createdTodo);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    putTodo: async (req, res) => {
        try {
            // 指定されたidが存在するか確認
            const targetTodo = await todo.findByPk(req.params.id);
            if (!targetTodo) {
                // 存在しないidが指定された場合はnullが返る
                const error = new Error('存在しないidです');
                error.status = 404;
                throw error;
            }
            const { dataValues: updatedTodo } = await sequelize.transaction(
                async (transaction) => {
                    const { title, body, complete } = req.body;
                    return await targetTodo.update(
                        { title, body, complete },
                        { transaction }
                    );
                }
            );
            res.status(200).json(updatedTodo);
        } catch (error) {
            const errorStatus = error.status || 400;
            const dbErrorIntPattern = /^integerに対する不正な入力構文:/;
            if (error.message.match(dbErrorIntPattern)) {
                error.message = 'idは不正な値です。(期待する型は1以上の 整数値 )';
            }
            res.status(errorStatus).json({ message: error.message });
        }
    },
    deleteTodo: async (req, res) => {
        try {
            const targetTodo = await todo.findByPk(req.params.id);
            if (!targetTodo) {
                const error = new Error('存在しないidです');
                error.status = 404;
                throw error;
            }
            await sequelize.transaction(
                async (transaction) => {
                    return await targetTodo.destroy({ transaction });
                }
            );
            res.status(200).json(targetTodo);
        } catch (error) {
            const errorStatus = error.status || 400;
            const dbErrorIntPattern = /^integerに対する不正な入力構文:/;
            if (error.message.match(dbErrorIntPattern)) {
                error.message = 'idは不正な値です。(期待する型は1以上の 整数値 )';
            }
            res.status(errorStatus).json({ message: error.message });
        }
    }
};