const express = require('express');
const app = express();

app.use(require('./emotions.js'));


module.exports = app;