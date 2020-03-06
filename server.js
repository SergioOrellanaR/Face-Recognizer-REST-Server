var AWS = require('aws-sdk');
const express = require('express');
const app = express();
const fs = require('fs');
var bodyParser = require('body-parser');
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let port = 3500;

const rekognition = new AWS.Rekognition({
    accessKeyId: AWS.config.credentials.accessKeyId,
    secretAccessKey: AWS.config.credentials.secretAccessKey,
    region: "us-east-1"
});




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
                    results: "Error al leer la imagen"
                }
            ));
        }

        let maxConfidence = data.FaceDetails[0].Emotions.reduce((prev, current) => prev.Confidence > current.Confidence ? prev : current);

        res.json((
            {
                ok: true,
                results: data.FaceDetails[0]
            }
        ));
    });
});

////DETECTOR DE ROSTROS.


// rekognition.compareFaces(params, function (err, data)
// {
//     if (err) console.log(err, err.stack); // an error occurred
//     else console.log(data);           // successful response
// });


// Los nombres de buckets deben ser únicos entre todos los usuarios de S3

// var myBucket = 'my.unique.bucket.name';

// var myKey = 'myBucketKey';

// s3.createBucket({ Bucket: myBucket }, function (err, data)
// {

//     if (err)
//     {
//         console.log(err);
//     }
//     else
//     {
//         params = { Bucket: myBucket, Key: myKey, Body: 'Hello!' };
//         s3.putObject(params, function (err, data)
//         {
//             if (err)
//             {
//                 console.log(err)
//             } else
//             {
//                 console.log("Successfully uploaded data to myBucket/myKey");
//             }
//         });

//     }

// });

app.listen(port, () =>
{
    console.log(`Escuchando en puerto: ${port}`);
})