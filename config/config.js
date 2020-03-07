require('./dbInformation.js');
var AWS = require('aws-sdk');

const rekognition = new AWS.Rekognition({
    accessKeyId: AWS.config.credentials.accessKeyId,
    secretAccessKey: AWS.config.credentials.secretAccessKey,
    region: "us-east-1"
});

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        cb(null, 'images/')
    },
    filename: function (req, file, cb)
    {
        cb(null, file.originalname)
    }
});

module.exports = {rekognition, storage, multer};