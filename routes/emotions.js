const express = require('express');
const app = express();
const { rekognition, storage, multer } = require('../config/config.js');
const fs = require('fs');
const upload = multer({ storage: storage });
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


        //Elimina imagen
        fs.unlinkSync(`./images/${file_name}`);
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