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
            // updateする場合のwhere指定を作成
            const whereId = { id: id };
            // 指定されたidが存在するか確認
            const dbResponse = await todo.findByPk(id, { transaction });
            if (!dbResponse) {
                // 存在しないidが指定された場合はnullが返る
                throw new Error('存在しないidです');
            }

            // オブジェクト形式の変数へ格納
            const targetTodo = dbResponse.dataValues;
            // undefinedとしないために既存データを初期値として指定
            const { title = targetTodo.title,
                    body = targetTodo.body,
                    complete = targetTodo.complete } = req.body;
            
            // updateメソッドの戻り値は更新されたレコード数
            await todo.update({ title, body, complete },
                { where: whereId },
                { transaction });
            
            const updatedTodo = await todo.findAll({
                where: whereId,
                raw: true
            }, { transaction });

            await transaction.commit();
            res.status(200).json(formatResponseData(updatedTodo));

        } catch (error) {
            await transaction.rollback();
            if (error.message === '存在しないidです') {
                res.status(404).json({ message: error.message });
            }
            // 数字以外が指定された場合は400の"integerに対する不正な入力構文: \"a\""が返る
            res.status(400).json({ message: error.message });
        }
    },
    deleteTodo: (req, res) => {
        send(res, statusCode.OK, 'deleteTodo', false);
    }
};