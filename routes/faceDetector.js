const express = require('express');
const app = express();
const Person = require('../models/personDB');
const { rekognition, storage, multer } = require('../config/config.js');
const fs = require('fs');
const upload = multer({ storage: storage });
const path = require('path');

const CollectionId = process.env.ENV === 'dev' ? "face-recognizer-0.0.1-dev" : "face-recognizer-0.0.1";

app.post('/createCollection', function (req, res)
{
    var params = {
        CollectionId
    };

    rekognition.listCollections({}, function (err, data)
    {
        if (err)
        {
            res.status(500).json((
                {
                    ok: false,
                    results: "Error al acceder a la lista de colecciones"
                }
            ));
        }
        else 
        {
            if (data.CollectionIds.includes(CollectionId))
            {
                res.status(406).json((
                    {
                        ok: false,
                        results: "Ya se ha creado la colección con anterioridad",
                        requestedCollection: params.CollectionId,
                        data
                    }
                ));
            }
            else
            {
                rekognition.createCollection(params, function (err, data)
                {
                    if (err) 
                    {
                        res.status(500).json((
                            {
                                ok: false,
                                results: "Error al crear colección"
                            }
                        ));
                    }
                    else
                    {
                        res.json((
                            {
                                ok: true,
                                Id: params.CollectionId,
                                results: "Colleción creada"
                            }
                        ));
                    }
                });
            }
        }
    });
});

app.get('/persons', function (req, res)
{
    var params = {
        CollectionId
    };

    rekognition.describeCollection(params, function (err, collectionData)
    {
        if (err)
        {
            res.status(500).json((
                {
                    ok: false,
                    results: "Error al obtener información",
                    error: err
                }
            ));
        }
        else
        {
            rekognition.listFaces(params, function (err, data)
            {
                if (err)
                {
                    res.status(500).json((
                        {
                            ok: false,
                            results: "No se pueden listar rostros",
                            error: err
                        }
                    ));
                }
                else
                {
                    res.status(200).json((
                        {
                            ok: true,
                            CollectionId,
                            cantidad: collectionData.FaceCount,
                            data
                        }
                    ));
                }
            });
        }

    });

});

app.post('/searchPersonByImage', upload.single('image'), function (req, res)
{
    const file_name = req.file.filename;
    const bitmap = fs.readFileSync(`${process.env.FN_REST_PATH}/images/${file_name}`);

    var params = {
        CollectionId,
        FaceMatchThreshold: 96,
        Image: {
            Bytes: new Buffer(bitmap)
        },
        MaxFaces: 1,
        QualityFilter: "HIGH"
    };

    rekognition.searchFacesByImage(params, function (err, data)
    {
        //Elimina imagen
        fs.unlinkSync(`${process.env.FN_REST_PATH}/images/${file_name}`);
        if (err)
        {
            res.status(500).json((
                {
                    ok: false,
                    results: "Error al buscar imagen, inténtelo nuevamente (En la imagen debe aparecer al menos un rostro)",
                    error: err
                }
            ));
        } // an error occurred
        else 
        {
            if (data.FaceMatches && data.FaceMatches.length)
            {
                const parsedEmail = data.FaceMatches[0].Face.ExternalImageId.replace("A", "@");
                console.log(parsedEmail);
                Person.findOne({ email: parsedEmail }, (err, personDB) =>
                {
                    if (err)
                    {
                        return res.status(500).json(
                            {
                                ok: false,
                                err
                            }
                        );
                    }
                    else
                    {
                        if (!personDB)
                        {
                            return res.status(404).json(
                                {
                                    ok: false,
                                    err: {
                                        message: 'Usuario no encontrado en DB'
                                    }
                                }
                            );
                        }
                        res.status(200).json((
                            {
                                ok: true,
                                results: "Busqueda exitosa!",
                                person: personDB,
                                data: data
                            }
                        ));
                    }
                });
            }
            else
            {
                res.status(404).json((
                    {
                        ok: false,
                        results: "No se encontraron resultados similares, para aumentar sus opciones, saque una foto con buena iluminación, con el rostro descubierto y buena calidad"
                    }
                ));
            }
        }           // successful response
    });
});

app.post('/person', upload.single('image'), function (req, res)
{
    const file_name = req.file.filename;
    const fileExtension = path.extname(file_name);
    const bitmap = fs.readFileSync(`${process.env.FN_REST_PATH}/images/${file_name}`);
    let body = req.body;
    const lowerEmail = body.email.toLowerCase();

    var params = {
        CollectionId,
        DetectionAttributes: [
        ],
        ExternalImageId: lowerEmail.replace("@", "A"),
        Image: {
            Bytes: new Buffer(bitmap)
        }
    };

    rekognition.indexFaces(params, function (err, data) 
    {
        if (err)
        {
            res.status(500).json((
                {
                    ok: false,
                    results: "Error al ingresar imagen, inténtelo nuevamente (En la imagen debe aparecer al menos un rostro)",
                    error: err
                }
            ));
        } // an error occurred
        else
        {
            if (data.length > 0)
            {
                res.status(400).json((
                    {
                        ok: false,
                        results: "Debe ingresar una foto en donde aparezca solo usted."
                    }
                ));
            }
            else
            {
                const newFileName = lowerEmail.replace("@", "A")+fileExtension;
                fs.renameSync(`${process.env.FN_REST_PATH}/images/${file_name}`, `${process.env.FN_REST_PATH}/images/${newFileName}`);
                let person = new Person(
                    {
                        name: body.name,
                        email: lowerEmail,
                        profession: body.profession,
                        hobby: body.hobby,
                        imgName: newFileName,
                        faceID: data.FaceRecords[0].Face.FaceId
                    }
                );

                person.save((err, personDB) => 
                {
                    if (err)
                    {
                        return res.status(400).json(
                            {
                                ok: false,
                                err
                            }
                        );
                    }
                    else
                    {
                        res.json((
                            {
                                ok: true,
                                person: personDB,
                                imageData: data
                            }
                        ));
                    }
                });
            }

        }
    });
});

app.delete('/person/:id', function (req, res)
{
    let id = req.params.id;

    Person.findByIdAndRemove(id, (err, deletedPerson) =>
    {
        if (err)
        {
            return res.status(400).json(
                {
                    ok: false,
                    err
                }
            );
        }
        else
        {
            if (!deletedPerson)
            {
                return res.status(400).json(
                    {
                        ok: false,
                        err: {
                            message: 'Usuario no encontrado'
                        }
                    }
                );
            }
            else
            {
                var params = {
                    CollectionId,
                    FaceIds: [
                        deletedPerson.faceID
                    ]
                };

                rekognition.deleteFaces(params, function (err, data)
                {
                    if (err)
                    {
                        res.status(500).json((
                            {
                                ok: false,
                                err
                            }
                        ));

                    } // an error occurred
                    else
                    {
                        //Elimina imagen
                        fs.unlinkSync(`${process.env.FN_REST_PATH}/images/${deletedPerson.imgName}`);
                        res.json((
                            {
                                ok: true,
                                person: deletedPerson
                            }
                        ));
                    }
                });
            }
        }
    })
});

module.exports = app;