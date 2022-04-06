const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();
const HttpError = require('../lib/http-error');

Fawn.init('mongodb://localhost/vidly');

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        throw new HttpError(400, error.details[0].message);
    }

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) {
        throw new HttpError(400, 'Invalid customer.');
    }

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) {
        throw new HttpError(400, 'Invalid movie.');
    }

    if (movie.numberInStock === 0) {
        throw new HttpError(400, 'Movie not in stock.');
    }
    let rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            isGold: customer.isGold
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });
    // rental = await rental.save();

    // movie.numberInStock--;
    // movie.save();

    // res.send(rental);

    new Fawn.Task()
        .save('rentals', rental)
        .update(
            'movies',
            { _id: movie.id },
            {
                $inc: { numberInStock: -1 }
            }
        )
        .run();

    res.send(rental);
});

router.get('/:id', async (req, res) => {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
        throw new HttpError(404, 'The rental with the given ID was not found.');
    }

    res.send(rental);
});
module.exports = router;
