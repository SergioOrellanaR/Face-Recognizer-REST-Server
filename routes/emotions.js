const express = require('express');
const app = express();
require('../config/config.js');
const fs = require('fs');
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
const upload = multer({ storage: storage });
const { rekognition } = require('../config/config.js');
const emotionResult = require('../helpers/emotionHelper').emotionResult;

app.post('/emotion', upload.single('image'), function (req, res)
{
    const file_name = req.file.filename;
    const bitmap = fs.readFileSync(`./images/${file_name}`);
    let image = {
        Image: {
            Bytes: new Buffer(bitmap)
        },
        Attributes: ['ALL']
    }

    rekognition.detectFaces(image, (error, data) =>
    {
        if (error)
        {
            res.status(400).json((
                {
                    ok: false,
                    results: "Imagen inválida, fotografíe a una persona"
                }
            ));
        }

        let maxConfidence = data.FaceDetails[0].Emotions.reduce((prev, current) => prev.Confidence > current.Confidence ? prev : current);

        res.json((
            {
                ok: true,
                emocion: emotionResult(maxConfidence),
                results: data.FaceDetails[0]
            }
        ));
    });
});

module.exports = app;