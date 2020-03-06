require('./config/config.js');
var bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Configuración global de rutas
app.use(require('./routes/routes'));

let port = 3500;


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