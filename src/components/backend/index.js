const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());


mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

app.listen(3000, () => {
    console.log(`Server Started at ${3000}`)
})