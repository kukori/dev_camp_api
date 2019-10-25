const express = require('express');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsWithinRadius, bootcampPhotoUpload } = require('../controllers/bootcamps');
const router = express.Router();

// Include other resource routers
const courseRouter = require('./courses');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius);

// Photo upload
router.route('/:id/photo').put(bootcampPhotoUpload)

router.route('/').get(getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;
