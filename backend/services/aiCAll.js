
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

   const habitsToBuild = (profile.habitsToBuild || []).join(', ') || 'None';
   const habitsToQuit  = (profile.habitsToQuit  || []).join(', ') || 'None';

   const prompt = `
You are a wellness AI coach. Generate a complete, realistic daily schedule for this user.

USER PROFILE:
- Primary Goal: ${profile.primaryGoal || 'general fitness'}
- Activity Level: ${profile.activityLevel || 'beginner'}
- Wake Up Time: ${profile.wakeUpTime || '06:00 AM'}
- Bedtime: ${profile.sleepTime || '10:00 PM'}
- Habits To BUILD: ${habitsToBuild}
- Habits To QUIT: ${habitsToQuit}

SAVED EXERCISES (you MUST include ALL of these in the schedule at their preferred times):
${exerciseLines}

SCHEDULING RULES:
1. FIRST task = "Morning Routine" at the wake-up time (category: mindfulness, duration: 10, xpReward: 5)
2. Include ALL saved exercises at their exact preferred times — do NOT change their times
3. For each habit in "Habits To BUILD": create 1-2 tasks spread across morning and evening with realistic times
4. For each habit in "Habits To QUIT": create 1 AVOIDANCE REMINDER task timed 30-60 min before bedtime. Title format: "⚠ Avoid [habit name]". Description should explain WHY to avoid it tonight. category: "habit-quit", xpReward: 15
5. Add a SLEEP PREP task 30 minutes before bedtime (category: sleep, title: "Wind Down & Sleep Prep", duration: 30, xpReward: 10)
6. LAST task = sleep reminder exactly at bedtime (category: sleep, title: "Lights Out — Good Night 🌙", duration: 5, xpReward: 5)
7. scheduledTime MUST be 24-hour format "HH:MM" (e.g. "06:30", "21:30")
8. category must be exactly one of: exercise, strength, cardio, mobility, mindfulness, sleep, hydration, learning, habit, habit-quit
9. difficulty must be exactly one of: easy, medium, hard
10. xpReward: 5 for light habits/reminders, 10-15 for moderate tasks, 20-30 for workouts
11. duration is in minutes (integer)
12. Ensure NO two tasks overlap in time — space them at least 30 min apart
13. Sort tasks by scheduledTime ascending

STRICT EXCLUSIONS — do NOT generate any tasks related to:
- Diet, meals, food, eating, breakfast, lunch, dinner, snacks, calories, nutrition
- Diet tracking or meal planning of any kind

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



// ================================
// GENERATE DIET PLAN WITH AI
// ================================

const generateDietWithAI = async (title, goal, dietaryRestrictions = '') => {

   // Build restriction instructions
   let restrictionInstructions = '';
   if (dietaryRestrictions && dietaryRestrictions.toLowerCase() !== 'none') {
      if (dietaryRestrictions.toLowerCase().includes('vegetarian')) {
         restrictionInstructions = `\n\nSTRICT RULE: ALL foods must be VEGETARIAN. NO meat, poultry, or fish. Only eggs, dairy, plant proteins allowed.`;
      } else if (dietaryRestrictions.toLowerCase().includes('vegan')) {
         restrictionInstructions = `\n\nSTRICT RULE: ALL foods must be 100% VEGAN. NO animal products at all. Use plant-based proteins, milks, butters.`;
      } else if (dietaryRestrictions.toLowerCase().includes('keto') || dietaryRestrictions.toLowerCase().includes('ketogenic')) {
         restrictionInstructions = `\n\nSTRICT RULE: ALL foods must be KETOGENIC. High fat, moderate protein, VERY low carbs (<20g/day). NO bread, pasta, sugar, most fruits.`;
      } else if (dietaryRestrictions.toLowerCase().includes('paleo')) {
         restrictionInstructions = `\n\nSTRICT RULE: ALL foods must be PALEO. Whole foods only. NO grains, legumes, dairy, processed foods. Meat, fish, eggs, vegetables, nuts allowed.`;
      } else if (dietaryRestrictions.toLowerCase().includes('gluten-free')) {
         restrictionInstructions = `\n\nSTRICT RULE: ALL foods must be GLUTEN-FREE. NO wheat, barley, rye, or related products. Use GF alternatives.`;
      }
   }

   const prompt = `
You are an expert nutritionist AI. Generate exactly 3 distinct diet plan variations for the given title and goal.${restrictionInstructions}

Diet Plan Title: ${title}
Goal: ${goal}

Return ONLY valid JSON — no markdown, no explanation, nothing else.

JSON format (array of 3 plans):
[
  {
    "title": "${title} — High Protein",
    "goal": "${goal}",
    "category": "High Protein",
    "totalCalories": 2400,
    "imageSearch": "healthy high protein meal prep food",
    "meals": [
      {
        "type": "Breakfast",
        "title": "Power Morning Bowl",
        "calories": 580,
        "foods": ["Oats 100g", "Whey Protein 30g", "Banana", "Almond Milk 200ml"],
        "time": "8:00 AM",
        "macros": { "protein": "38g", "carbs": "65g", "fat": "10g" }
      },
      {
        "type": "Lunch",
        "title": "",
        "calories": 0,
        "foods": [],
        "time": "",
        "macros": { "protein": "", "carbs": "", "fat": "" }
      },
      {
        "type": "Snack",
        "title": "",
        "calories": 0,
        "foods": [],
        "time": "",
        "macros": { "protein": "", "carbs": "", "fat": "" }
      },
      {
        "type": "Dinner",
        "title": "",
        "calories": 0,
        "foods": [],
        "time": "",
        "macros": { "protein": "", "carbs": "", "fat": "" }
      }
    ]
  },
  { second variation with different category and approach },
  { third variation with different category and approach }
]

Rules:
- Return exactly 3 plan objects in a JSON array
- Each plan MUST have a different category (e.g. High Protein, Balanced, Ketogenic, Mediterranean, Low Carb, Plant-Based)
- Each plan must have exactly 4 meals: Breakfast, Lunch, Snack, Dinner
- Total calories must reflect the goal (weight-loss ~1700, maintenance ~2200, muscle-gain ~2600, performance ~3000)
- imageSearch must be a specific phrase like "ketogenic meal prep avocado eggs" — different per plan
- Each plan must have realistic, specific foods with quantities
- Macros must be realistic strings like "38g"
- Times must be realistic 12-hour format
- Tailor all plans specifically to the goal: "${goal}"
`;

   // ── Retry helper — handles Gemini 503 overload spikes ──────────────────────
   const MAX_RETRIES  = 3;
   const RETRY_DELAY  = 2000; // ms — doubles on each attempt

   const callWithRetry = async (attempt = 1) => {
      try {
         const result   = await model.generateContent(prompt);
         const response = result.response.text();
         const cleaned  = response
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

         if (!cleaned.startsWith('[')) {
            throw new Error('AI returned invalid JSON for diet plans');
         }

         const plans = JSON.parse(cleaned);
         if (!Array.isArray(plans) || plans.length === 0) {
            throw new Error('AI response missing plans array');
         }

         // Fetch Unsplash image for each plan
         for (const plan of plans) {
            plan.image = await getExerciseImage(plan.imageSearch || `${plan.category} healthy meal`);
         }

         return plans;

      } catch (err) {
         const is503 = err?.message?.includes('503') ||
                       err?.message?.includes('Service Unavailable') ||
                       err?.message?.includes('high demand');

         if (is503 && attempt < MAX_RETRIES) {
            const delay = RETRY_DELAY * attempt; // 2s → 4s → 6s
            console.log(`[diet/AI] 503 received — retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`);
            await new Promise(r => setTimeout(r, delay));
            return callWithRetry(attempt + 1);
         }

         throw err;
      }
   };

   return callWithRetry();
};


module.exports = {
   generateTasksWithAI,
   generateDayTasksWithAI,
   searchExercise,
   generateDietWithAI
};
