const express = require('express');
const app = express();

app.get('/', function (req, res)
{
    res.status(200).json((
        {
            ok: true,
            result: 'API REST - Facial Recognizer'
        }
    ));
});

module.exports = app;