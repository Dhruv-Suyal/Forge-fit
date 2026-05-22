const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./utils/dbConnection');
const passport = require('passport');
require('./utils/passport');
const authRoute = require('./routes/auth');
const homeRoute = require('./routes/home');
const exerciseRoute = require("./routes/exercise");
const dietRoute     = require("./routes/diet");
connectDB();
const app = express();

app.use(cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api/auth', authRoute);
app.use('/api/home', homeRoute);
app.use('/api',exerciseRoute);
app.use('/api/diet', dietRoute);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res)=>{
    res.send('Kya haal hai mitrrr');
})

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});