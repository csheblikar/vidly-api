const Joi = require('joi');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const express = require('express');
const HttpError = require('../lib/http-error');
const router = express.Router();

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) {
        throw new HttpError(404, 'Rental not found');
    }
    if (rental.dateReturned) {
        throw new HttpError(400, 'Rental already processed.');
    }

    rental.return();
    await rental.save();

    await Movie.updateMany(
        { _id: rental.movie._id },
        {
            $inc: { numberInStock: 1 }
        }
    );

    return res.send(rental);
});

function validateReturn(req) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    });
    return schema.validate(req);
}

module.exports = router;
