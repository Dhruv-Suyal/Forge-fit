const express= require("express");
const passport= require("passport");

const router = express.Router();

router.get("/google", 
    passport.authenticate("google", {scope: ["profile", "email"]})
);

router.get("/google/callback",
    passport.authenticate("google", {session:false,  failureRedirect: "http://localhost:3000/login"}),
    (req, res)=>{
        const {token} = req.user;
        res.cookie("token", token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"lax"
        })
        res.redirect("http://localhost:3000/dashboard");
    }
);

router.post("/signUp",)

module.exports = router;