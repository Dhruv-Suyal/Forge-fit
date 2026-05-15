import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({

   userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
   },
   displayName:String,

   dateOfBirth:String,

   biologicalSex:{
      type:String,
      enum:["male","female","other"]
   },

   height:Number,

   weight:Number,

   bmi:Number,

   tdee:Number,

   primaryGoal:String,

   location:{
      displayName:String,
      city:String,
      country:String,
      lat:Number,
      lon:Number
   },
    wakeUpTime: {
      type: String,
      default: "06:00 AM"
   },

   sleepTime: {
      type: String,
      default: "10:00 PM"
   },

   activityLevel: {
      type: String,
      default: "beginner"
   },

   workoutDays: {
      type: Number,
      default: 5
   },

   habitsToBuild: {
      type: [String],
      default: [
         "Drink Water",
         "Morning Walk",
         "Sleep Early"
      ]
   },

   habitsToQuit: {
      type: [String],
      default: [
         "Late Night Scrolling"
      ]
   }


},{timestamps:true});

export default mongoose.model("Profile", profileSchema);