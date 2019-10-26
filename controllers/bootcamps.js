const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const path = require('path');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with the id ${req.params.id} has not been found`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp});
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    req.body.user = req.user;

    const publishedBootcamp = await Bootcamp.findOne({user: req.user._id })
    if(publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse('Publisher already has a bootcamp', 400));
    }

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp});
});

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with the id ${req.params.id} has not been found`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp});
});

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with the id ${req.params.id} has not been found`, 404));
    }

    bootcamp.remove();

    res.status(200).json({ success: true, data: {} });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsWithinRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({ location: { $geoWithin: { $centerSphere: [[lng, lat], radius]}}});

    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc    Upload a photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp with the id ${req.params.id} has not been found`, 404));
    }

    if(!req.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.file;

    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse('Please upload an image file smaller than 1Mb', 400));
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err) {
            console.error(err);
            return next(new ErrorResponse('File upload error', 500));
        }

        await bootcamp.updateOne({ photo: file.name});

        res.status(200).json({ success: true, data: file.name });
    });
});