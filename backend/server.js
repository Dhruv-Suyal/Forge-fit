const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./utils/dbConnection');
const passport = require('passport');
require('./utils/passport');
const authRoute = require('./routes/auth');
connectDB();
const app = express();

app.use(cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api/auth', authRoute);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res)=>{
    res.send('Kya haal hai mitrrr');
})

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});