const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Mount enviroment variables
dotenv.config({ path: './config/config.env' });

// Load models
const Bootcamp = require('./models/Bootcamp');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

// Import data
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        console.log('Data Imported'.green);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

// Delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        console.log('Bootcamps purged...'.red);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

if(process.argv[2] === '-i') {
    importData();
} else if(process.argv[2] === '-d') {
    deleteData();
}