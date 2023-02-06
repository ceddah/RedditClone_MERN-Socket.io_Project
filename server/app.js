const express = require('express');
const path = require('path');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const multer = require('multer');
// const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// dotenv.config({ path: './config/config.env' });

const app = express();
const PORT = process.env.PORT || 4020;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
});
const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(bodyParser.json({ limit: '10MB' }));
app.use(multer({storage: storage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

if (process.env.NODE_ENV === "PRODUCTION") {
    app.use(express.static(path.join(__dirname, "../client/build")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
    });
}

app.use((req, res, next) => {
    res.status(404).json({
        message: 'Invalid URL - Resouce not found.'
    })
})

app.use((error, req, res, next) => {
    if(process.env.NODE_ENV === 'DEVELOPMENT') {
        console.log(error);
    }
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    })
});

mongoose.connect(process.env.DB_URI, () => {
    const server = app.listen(PORT);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
        //Client Connected
    });
    console.log('Mongo Connected.')
});