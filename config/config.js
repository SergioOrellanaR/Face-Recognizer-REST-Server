var AWS = require('aws-sdk');

const rekognition = new AWS.Rekognition({
    accessKeyId: AWS.config.credentials.accessKeyId,
    secretAccessKey: AWS.config.credentials.secretAccessKey,
    region: "us-east-1"
});

module.exports = {rekognition};