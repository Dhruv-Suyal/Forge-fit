const mongoose = require('mongoose');

const todayTaskSchema = new mongoose.Schema({

   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   },

   title: {
      type: String,
      required: true
   },

   description: {
      type: String
   },

   category: {
      type: String,
   },

   scheduledTime: {
      type: String
   },

   duration: {
      type: Number
   },

   difficulty: {
      type: String,

      enum: [
         'easy',
         'medium',
         'hard'
      ],

      default: 'easy'
   },

   xpReward: {
      type: Number,
      default: 10
   },

   completed: {
      type: Boolean,
      default: false
   },

   completedAt: {
      type: Date
   },

   aiGenerated: {
      type: Boolean,
      default: true
   },

   // Links this task to a Profile.exercises entry — used to deduplicate daily sync
   sourceExerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
   },

   date: {
      type: Date,
      default: Date.now
   }

},{
   timestamps: true
});

module.exports = mongoose.model(
   'TodayTask',
   todayTaskSchema
);