const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId})

        return res.status(200).json({ success: true, count: courses.length, data: courses});
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    Get a single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course) {
        return next(new ErrorResponse(`Course with the id ${req.params.id} has not been found`, 404));
    }

    res.status(200).json({ success: true, data: course});
});

// @desc    Create new course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse('No bootcamp with the id of ${req.params.id}'), 404);
    }

    if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorised', 401));
    }

    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course});
});

// @desc    Update a course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`Course with the id ${req.params.id} has not been found`, 404));
    }

    if(req.user.id !== course.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorised', 401));
    }

    course = await Course.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: course});
});

// @desc    Delete a course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`Course with the id ${req.params.id} has not been found`, 404));
    }

    if(req.user.id !== course.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorised', 401));
    }

    await course.remove();

    res.status(200).json({ success: true, data: {} });
});