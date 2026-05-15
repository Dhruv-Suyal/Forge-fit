const workoutRoutineSchema = new mongoose.Schema({

   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
   },

   title: String,

   goal: String,

   category: String,

   isActive: {
      type: Boolean,
      default: true
   },

   preferredTime: String,

   frequency: {
      type: String,
      enum: ["daily", "weekly"]
   },

   exercises: [
      {
         name: String,
         sets: Number,
         reps: Number,
         duration: Number,

         image: String,
         video: String
      }
   ]

}, { timestamps: true });