const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt =  require('jsonwebtoken');

exports.postSignUp = async (req, res)=>{
    try{

        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required!"});
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        let existedUser = await User.findOne({email});
        if(existedUser){
            return res.status(400).json({message: "User already exist"});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name:name,
            email:email,
            password:hashedPassword
        });

        const token = jwt.sign(
            {id: newUser._id},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        const {password:_, ...safeUser} = newUser._doc;

        res.json({message: "User successfully signUp", safeUser});

    }catch(err){
        res.status(500).json({error: err.message});
    }
}

exports.postLogin = async (req, res)=>{
    try{
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existUser = await User.findOne({email});

        if(!existUser){
            return res.status(400).json({message:"User not exist sign Up first!"});
        }
        if(!existUser.password){
            return res.status(400).json({message: "SignUp with Google"});
        }

        const isMatch = await bcrypt.compare(password, existUser.password);

        if(!isMatch){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const token = jwt.sign({id:existUser._id}, process.env.JWT_SECRET, {expiresIn:"7d"});
        res.cookie("token", token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:"lax"
        });

        const {password:_, ...safeUser} = existUser._doc;


        res.json({message:"Login successfull", safeUser});

    }catch(err){
        res.status(500).json({error: err.message});
    }
}