const express = require('express');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsWithinRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');
const router = express.Router();
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');

// Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius);

// Photo upload
router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload)

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id').get(getBootcamp).put(protect,authorize('publisher', 'admin'), updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
