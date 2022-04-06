const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { Genre, validate } = require('../models/genre');
const HttpError = require('../lib/http-error');

router.get('/', async (req, res) => {
    // throw new Error('Could not get the genres');
    const genres = await Genre.find().sort('name');
    res.send(genres);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        throw new HttpError(400, error.details[0].message);
    }

    let genre = new Genre({ name: req.body.name });
    genre = await genre.save();
    res.send(genre);
});

router.put('/:id', [auth, validateObjectId], async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        throw new HttpError(400, error.details[0].message);
    }

    const genre = await Genre.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        {
            new: true
        }
    );

    //const genre = genres.find(c => c.id === parseInt(req.params.id));
    if (!genre) {
        throw new HttpError(404, 'The genre with the given ID was not found.');
    }

    res.send(genre);
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);

    //const genre = genres.find(c => c.id === parseInt(req.params.id));
    if (!genre) {
        throw new HttpError(404, 'The genre with the given ID was not found.');
    }

    //const index = genres.indexOf(genre);
    //genres.splice(index, 1);

    res.send(genre);
});

router.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id);

    //const genre = genres.find(c => c.id === parseInt(req.params.id));
    if (!genre) {
        throw new HttpError(404, 'The genre with the given ID was not found.');
    }

    res.send(genre);
});

module.exports = router;
