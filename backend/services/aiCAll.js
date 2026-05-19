
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
// GENERATE FULL DAY TASKS WITH AI
// ================================

const generateDayTasksWithAI = async (profile) => {

   // Build exercise list for the prompt
   const exerciseLines = (profile.exercises || [])
      .filter(e => e.isActive !== false)
      .map(e =>
         `  - "${e.title}" | category: ${e.category || 'exercise'} | difficulty: ${e.difficulty || 'beginner'} | ${e.duration || 30} min | preferred time: ${e.preferredTime || 'flexible'}`
      ).join('\n') || '  None';

   const habitList = (profile.habitsToBuild || []).join(', ') || 'None';

   const prompt = `
You are a fitness AI. Generate a complete, realistic daily schedule for this user.

USER PROFILE:
- Primary Goal: ${profile.primaryGoal || 'general fitness'}
- Activity Level: ${profile.activityLevel || 'beginner'}
- Wake Up Time: ${profile.wakeUpTime || '06:00 AM'}
- Bedtime: ${profile.sleepTime || '10:00 PM'}
- Habits To Build: ${habitList}

SAVED EXERCISES (you MUST include ALL of these in the schedule at their preferred times):
${exerciseLines}

SCHEDULING RULES:
1. First task = morning routine at the wake-up time
2. Include ALL saved exercises at their exact preferred times
3. Spread habit tasks through morning (after wake-up) and evening (around 18:00)
4. Last task = wind-down / sleep reminder at bedtime
5. scheduledTime MUST be 24-hour format "HH:MM" (e.g. "06:30", "18:00")
6. category must be exactly one of: exercise, strength, cardio, mobility, mindfulness, sleep, hydration, learning
7. difficulty must be exactly one of: easy, medium, hard
8. xpReward: 5 for light habits, 10 for moderate tasks, 20-30 for workouts
9. duration is in minutes (integer)

STRICT EXCLUSIONS — do NOT generate any tasks related to:
- Diet, meals, food, eating, breakfast, lunch, dinner, snacks, calories, nutrition
- Diet tracking or meal planning of any kind
(Diet is handled separately in the app's Food Intake section)

Return ONLY valid JSON — no markdown, no explanation, nothing else:
{
  "tasks": [
    {
      "title": "",
      "description": "",
      "category": "",
      "scheduledTime": "HH:MM",
      "duration": 15,
      "difficulty": "easy",
      "xpReward": 10
    }
  ]
}
`;

   const result   = await model.generateContent(prompt);
   const response = result.response.text();
   const cleaned  = response
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

   // Safety check
   if (!cleaned.startsWith('{')) {
      throw new Error('AI returned invalid JSON format for day tasks');
   }

   const parsed = JSON.parse(cleaned);
   if (!Array.isArray(parsed.tasks)) {
      throw new Error('AI response missing tasks array');
   }

   return parsed.tasks;
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
   generateDayTasksWithAI,
   searchExercise
};