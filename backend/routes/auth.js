const express= require("express");
const passport= require("passport");
const { postSignUp, postLogin, getLogout, saveProfile, getProfile } = require("../controller/authmiddleware");
const authMiddleware = require("../utils/authMiddleware");
const { default: User } = require("../models/User");
const { default: Profile } = require("../models/Profile");

const router = express.Router();

router.get("/google", 
    passport.authenticate("google", {scope: ["profile", "email"]})
);

router.get("/google/callback",
    passport.authenticate("google", {session:false,  failureRedirect: "http://localhost:5173/logIn"}),
    (req, res)=>{
        const {token, user} = req.user;
        res.cookie("token", token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        if(user.onboardingCompleted){
         res.redirect("http://localhost:5173/");
      }
      else{
         res.redirect("http://localhost:5173/onboarding");
      }
       
    }
);

router.post("/signUp", postSignUp);
router.post("/logIn", postLogin);
router.post("/onboarding", authMiddleware, saveProfile);

// Returns user + profile in one request — used by AuthContext on load
router.get("/me", authMiddleware, async (req, res)=>{
    try {
        const user = await User.findById(req.user.id).select("-password");
        const profile = await Profile.findOne({ userId: req.user.id });
        res.json({
            success: true,
            user,
            profile: profile || null
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// Dedicated profile endpoint
router.get("/profile", authMiddleware, getProfile);

router.get("/logout", getLogout);

module.exports = router;