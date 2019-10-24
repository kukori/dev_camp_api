const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    const requestQuery = { ...req.query };

    const fieldsToRemove = ['select', 'sort', 'page', 'limit'];

    fieldsToRemove.forEach(param => delete(requestQuery[param]));

    let queryString = JSON.stringify(requestQuery);
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    let query = Bootcamp.find(JSON.parse(queryString)).populate('courses');

    if(req.query.select) {
        const select = req.query.select.split(',').join(' ');
        query = query.select(select);
    }

    // Sorting
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page -1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments;

    query = query.skip(startIndex).limit(limit);

    const bootcamps = await query;

    // Pagination result
    const pagination = {};

    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps});
});

// @desc    Get a single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        next(new ErrorResponse(`Bootcamp with the id ${req.params.id} has not been found`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp});
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
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
        next(new ErrorResponse(`Bootcamp with the id ${req.params.id} has not been found`, 404));
    }

    res.status(201).json({ success: true, data: bootcamp});
});

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        next(new ErrorResponse(`Bootcamp with the id ${req.params.id} has not been found`, 404));
    }

    bootcamp.remove();

    res.status(201).json({ success: true, data: {} });
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