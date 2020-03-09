const express = require('express');
const app = express();

app.use(require('./emotions.js'));
app.use(require('./faceDetector.js'));
app.use(require('./defaultRoute.js'));

module.exports = app;