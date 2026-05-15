import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String
    },
    googleId:{
        type:String
    },
    avatar:{
        type:String
    },
    xp: {
        type: Number,
        default: 0
    },

    level: {
        type: String,
        default: "Beginner"
    },

    streak: {
        type: Number,
        default: 0
    },
    onboardingCompleted:{
        type:Boolean,
        default:false
    }
    
}, 
{timestamps:true});

const User= mongoose.model('User', userSchema);

export default User;