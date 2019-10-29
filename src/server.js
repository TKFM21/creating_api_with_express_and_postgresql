const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const router = require('./resouces/api.router');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', router);

// CORSを許可する設定
const corsOptions = {
    origin: '*',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept'
};
app.use(cors(corsOptions));

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

module.exports = app;