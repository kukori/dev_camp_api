const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const connectDB = require('./config/db');

// Route files
const bootcamps = require('./routes/bootcamps');

// Mount enviroment variables
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Dev logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`.yellow.bold));

// Handle unhandled rejection
process.on('unhandledRejection', (error, promise) => {
    console.log(`Error: ${error.message}`.red)
    server.close(() => process.exit(1));
});