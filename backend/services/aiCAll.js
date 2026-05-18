
const {
   GoogleGenerativeAI
} = require("@google/generative-ai");
const { getExerciseImage } = require("../utils/getExerciseImage");
const { getExerciseVideo } = require("../utils/getYoutubeVideo");

const genAI = new GoogleGenerativeAI(
   process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
   model: "gemini-2.5-flash"
});


// ================================
// GENERATE DAILY TASKS
// ================================

const generateTasksWithAI = async (profile) => {

   const prompt = `
Generate realistic fitness tasks.

User Goal: ${profile.primaryGoal}

Wake Up Time:
${profile.wakeUpTime}

Workout Level:
${profile.activityLevel}

Habits To Build:
${profile.habitsToBuild.join(", ")}

Return ONLY valid JSON.

Format:
{
   "tasks":[
      {
         "title":"",
         "category":"",
         "scheduledTime":"",
         "xpReward":20
      }
   ]
}
`;

   const result =
      await model.generateContent(prompt);

   const response = result.response.text();

   const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

   return JSON.parse(cleaned);

};



// ================================
// SEARCH EXERCISE WITH AI
// ================================

const searchExercise = async (req, res) => {

   try {

      const {
         title,
         duration,
         preferredTime,
         difficulty
      } = req.body;

      if (!title) {

         return res.status(400).json({
            success: false,
            message: "Exercise title is required"
         });

      }

      const prompt = `
Generate 4 fitness exercise variations for the given exercise.

Exercise Name: ${title}
Duration: ${duration || 30} minutes
Difficulty: ${difficulty || "beginner"}
Preferred Time: ${preferredTime || "Morning"}

Return ONLY valid JSON — no explanation, no markdown, no extra text.

JSON format must be an array:

[
   {
      "title": "",
      "goal": "",
      "category": "strength | cardio | mobility | muscle-building | skill",
      "difficulty": "beginner | intermediate | advanced",
      "sets": 0,
      "reps": 0,
      "duration": 0,
      "preferredTime": "",
      "imageSearch": "",
      "videoSearch": "",
      "description": ""
   }
]

Rules:
- Return exactly 4 exercise objects
- Each variation should have different sets/reps/goals
- Use real Unsplash fitness photo URLs and provide search (different for each)
- Use real YouTube exercise video URLs and provide search (different for each)
- preferredTime must be in format like "7:00 AM" or "6:30 PM"
- difficulty must be lowercase
- category must be one of: strength, cardio, mobility, muscle-building, skill
`;

      const result =
         await model.generateContent(prompt);

      const response = result.response.text();

      const cleaned = response
         .replace(/```json/g, "")
         .replace(/```/g, "")
         .trim();

      // SAFETY CHECK — must start with array
      if (!cleaned.startsWith("[")) {

         return res.status(500).json({
            success: false,
            message: "Invalid AI response format"
         });

      }

      const exercises = JSON.parse(cleaned);
      for (const exercise of exercises) {
         const image =await getExerciseImage(
            exercise.imageSearch
         );
         const video = await getExerciseVideo(
            exercise.videoSearch
         );
        exercise.image = image;
        exercise.video = video;

      }

      return res.status(200).json({
         success: true,
         exercises
      });

   } catch (err) {

      console.log(err);

      return res.status(500).json({
         success: false,
         message: err.message
      });

   }

};



module.exports = {
   generateTasksWithAI,
   searchExercise
};