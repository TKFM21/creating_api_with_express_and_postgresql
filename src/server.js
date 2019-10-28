const express = require('express');
const app = express();
const morgan = require('morgan');
const router = require('./resouces/api.router');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', router);

// CORSを許可する設定
const middlewareForAllowOrigin = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};

app.use(middlewareForAllowOrigin);

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

module.exports = app;