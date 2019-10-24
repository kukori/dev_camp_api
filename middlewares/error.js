
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (error, req, res, next) => {
    let errorResponse = {...error};
    console.log(error.stack.red);

    // Mongoose bad object id
    if(error.name === 'CastError') {
        const message = `Item not found with id of ${error.value}`;
        errorResponse = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if(error.code === 11000) {
        const message = `Duplicate key`;
        errorResponse = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if(error.name === 'ValidationError') {
        const message = Object.values(error.errors).map(value => value.path);
        errorResponse = new ErrorResponse('Missing required parameters: ' + message, 400);
    }

    res.status(errorResponse.statusCode || 500).json({
        success: false,
        error: errorResponse.message
    });
}

module.exports = errorHandler;