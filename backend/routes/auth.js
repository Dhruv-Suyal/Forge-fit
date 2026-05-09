const express= require("express");
const passport= require("passport");
const { postSignUp, postLogin, getLogout } = require("../controller/authmiddleware");
const authMiddleware = require("../utils/authMiddleware");
const { default: User } = require("../models/User");

const router = express.Router();

router.get("/google", 
    passport.authenticate("google", {scope: ["profile", "email"]})
);

router.get("/google/callback",
    passport.authenticate("google", {session:false,  failureRedirect: "http://localhost:5173/logIn"}),
    (req, res)=>{
        const {token} = req.user;
        res.cookie("token", token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"lax"
        })
        res.redirect("http://localhost:5173/");
    }
);

router.post("/signUp", postSignUp);
router.post("/logIn", postLogin);
router.get("/me", authMiddleware, async (req, res)=>{
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({
            success: true,
            user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
})
router.get("/logout", getLogout);

module.exports = router;