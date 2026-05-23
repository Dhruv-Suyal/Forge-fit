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

  // Food meals — seeded from active Profile diet on first open each day
  food: [
    {
      id:       String,          // 'f1', 'f2', ...
      meal:     String,          // "Breakfast" | "Lunch" | "Snack" | "Dinner"
      time:     String,          // "07:30"
      calories: { type: Number, default: 0 },
      items:    [String],        // list of food items / foods
      macros: {
        protein: String,
        carbs:   String,
        fat:     String
      },
      done:     { type: Boolean, default: false }
    }
  ],

  // Snapshot of the diet plan used to seed food[] today
  dietPlan: {
    title:         String,
    goal:          String,
    category:      String,
    totalCalories: Number,
    image:         String,
    imageSearch:   String,
    meals: [
      {
        type:     { type: String },
        title:    String,
        calories: Number,
        foods:    [String],
        time:     String,
        macros: {
          protein: String,
          carbs:   String,
          fat:     String
        }
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
  ],

  // Composite daily score saved from frontend (0-100)
  score: {
    type:    Number,
    default: 0
  }

}, { timestamps: true });

// Compound unique index → one log per user per day
wellnessLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WellnessLog', wellnessLogSchema);
