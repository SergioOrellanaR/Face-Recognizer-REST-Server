const express = require('express');
const app = express();

app.use(require('./emotions.js'));
app.use(require('./faceDetector.js'));

module.exports = app;