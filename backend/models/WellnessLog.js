const mongoose = require('mongoose');

const wellnessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  water: {
    target:   { type: Number, default: 8 },
    consumed: { type: Number, default: 0 },
    glassML:  { type: Number, default: 250 }
  },
  dietPlan: {
   title: String,

   goal: String,

   totalCalories: Number,

   meals: [

      {
         type: String,

         title: String,

         calories: Number,

         foods: [String],

         time: String
      }

   ]
},
  screenTime: [
    {
      id:    String,
      app:   String,
      icon:  String,
      limit: Number,
      used:  { type: Number, default: 0 },
      color: String
    }
  ]
}, { timestamps: true });

// Compound unique index → one log per user per day
wellnessLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WellnessLog', wellnessLogSchema);
