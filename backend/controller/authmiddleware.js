const bcrypt = require('bcryptjs');
const jwt =  require('jsonwebtoken');
const { default: User } = require('../models/User');

exports.postSignUp = async (req, res)=>{
    try{

        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required!", success:false});
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters", success:false });
        }

        let existedUser = await User.findOne({email});

        if(existedUser){
            return res.status(400).json({message: "User already exist", success:false});
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

        res.json({message: "User successfully signUp", success:true, user:safeUser});

    }catch(err){
        res.status(500).json({error: err.message, success:false});
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


        res.json({message:"Login successfull", user:safeUser});

    }catch(err){
        res.status(500).json({error: err.message});
    }
}

exports.getLogout = (req, res) => {

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });

  res.json({
    message: "Logged out successfully"
  });

}