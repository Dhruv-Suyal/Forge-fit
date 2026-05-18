const mongoose = require("mongoose");

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
   },

   exercises: [
   {
      title: {
         type: String,
         required: true
      },

      goal: String,

      category: {
         type: String,
         enum: [
            "strength",
            "skill",
            "cardio",
            "mobility",
            "muscle-building"
         ]
      },

      difficulty: {
         type: String,
         enum: ["beginner", "intermediate", "advanced"],
         default: "beginner"
      },

      sets: Number,

      reps: Number,

      duration: Number,

      preferredTime: {
         type: String,
         default: "06:00 PM"
      },

      image: String,

      video: String,

      isActive: {
         type: Boolean,
         default: true
      }
   }
]


},{timestamps:true});

module.exports = mongoose.model("Profile", profileSchema);