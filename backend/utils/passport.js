const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/user");

passport.use(new GoogleStrategy ({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},

async (accessToken, refreshToken, profile, done) => {
    try{
        const email = profile.emails[0]?.value;
        let user = await User.findOne({email: email});

        if(!user){
            user = await User.create({
                name: profile.displayName,
                email: email,
                googleId: profile.id,
                avatar: profile.photos[0]?.value
            })
        }

        if(user && !user.googleId){
            user.googleId = profile.id;
            user.avatar = profile.photos[0]?.value;
            await user.save();
        }

        const token = jwt.sign(
            {id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

        done(null, {user, token});

    }catch(err){
        done(err, null);
    }
}
));