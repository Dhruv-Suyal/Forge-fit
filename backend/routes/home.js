const express            = require('express');
const router             = express.Router();
const authMiddleware     = require('../utils/authMiddleware');
const TodayTask          = require('../models/TodayTask');
const WellnessLog        = require('../models/WellnessLog');
const Profile            = require('../models/Profile');
const { generateDayTasksWithAI } = require('../services/aiCAll');

const getToday = () => new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

// ── Helpers ───────────────────────────────────────────────────────────────────

// Convert "7:00 AM" / "6:30 PM" → "07:00" / "18:30"
function to24h(str) {
  if (!str) return '08:00';
  if (!str.includes('AM') && !str.includes('PM')) return str;
  const [time, mer] = str.trim().split(' ');
  let [h, m] = time.split(':').map(Number);
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2,'0')}:${String(m||0).padStart(2,'0')}`;
}

// XP reward based on exercise difficulty
function xpForDifficulty(diff) {
  if (!diff) return 10;
  const d = diff.toLowerCase();
  if (d === 'advanced')     return 30;
  if (d === 'intermediate') return 20;
  return 10;
}

// Map exercise difficulty → TodayTask difficulty enum (easy / medium / hard)
function taskDifficulty(diff) {
  if (!diff) return 'easy';
  const d = diff.toLowerCase();
  if (d === 'advanced')     return 'hard';
  if (d === 'intermediate') return 'medium';
  return 'easy';
}

// Build a TodayTask document from a profile exercise
function buildExerciseTask(userId, ex, today) {
  return {
    userId,
    title:            ex.title,
    description:      ex.goal || '',
    category:         ex.category || 'exercise',
    scheduledTime:    to24h(ex.preferredTime),
    duration:         ex.duration  || null,
    difficulty:       taskDifficulty(ex.difficulty),
    xpReward:         xpForDifficulty(ex.difficulty),
    aiGenerated:      true,
    sourceExerciseId: ex._id,
    date:             new Date(today),
    completed:        false,
  };
}

// ── Build food[] from active Profile diet ─────────────────────────────────────
function buildFoodFromDiet(diet) {
  if (!diet || !diet.meals || diet.meals.length === 0) return null;
  return diet.meals.map((meal, idx) => ({
    id:       `f${idx + 1}`,
    meal:     meal.type || meal.title || 'Meal',
    time:     to24h(meal.time || '08:00'),
    calories: meal.calories || 0,
    items:    meal.foods || [],
    macros:   meal.macros || { protein: '0g', carbs: '0g', fat: '0g' },
    done:     false,
  }));
}

// ── Default food fallback (no active diet) ─────────────────────────────────────
const DEFAULT_FOOD = [
  { id: 'f1', meal: 'Breakfast', time: '07:30', calories: 450, items: ['Oats + banana', '2 boiled eggs', 'Green tea'],    macros: { protein: '22g', carbs: '55g', fat: '8g'  }, done: false },
  { id: 'f2', meal: 'Lunch',     time: '13:00', calories: 600, items: ['Brown rice', 'Dal', 'Salad', 'Curd'],              macros: { protein: '28g', carbs: '80g', fat: '10g' }, done: false },
  { id: 'f3', meal: 'Evening',   time: '17:00', calories: 200, items: ['Fruit bowl', 'Handful nuts'],                      macros: { protein: '5g',  carbs: '30g', fat: '7g'  }, done: false },
  { id: 'f4', meal: 'Dinner',    time: '19:00', calories: 500, items: ['Roti × 2', 'Sabzi', 'Soup'],                       macros: { protein: '18g', carbs: '60g', fat: '9g'  }, done: false },
];

const DEFAULT_SCREEN = [
  { id: 's1', app: 'Instagram', icon: '◈', limit: 20, used: 0, color: '#e1306c' },
  { id: 's2', app: 'YouTube',   icon: '⟡', limit: 30, used: 0, color: '#ff0000' },
  { id: 's3', app: 'Twitter/X', icon: '✦', limit: 15, used: 0, color: '#1d9bf0' },
];

// ── GET /api/home/today ───────────────────────────────────────────────────────
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today  = getToday();
    const userId = req.user.id;

    // Calendar-day boundary (midnight → midnight)
    const start = new Date(today);
    const end   = new Date(today);
    end.setDate(end.getDate() + 1);

    let [tasks, profile] = await Promise.all([
      TodayTask.find({ userId, date: { $gte: start, $lt: end } }).sort('scheduledTime'),
      Profile.findOne({ userId }),
    ]);

    if (profile) {
      if (tasks.length === 0) {
        // ── FIRST OPEN OF THE DAY: let AI generate the full schedule ─────────
        let docs = [];
        try {
          const aiTasks = await generateDayTasksWithAI(profile);

          // Build a title→exercise map for sourceExerciseId linking
          const exByTitle = {};
          (profile.exercises || []).forEach(ex => {
            exByTitle[ex.title.toLowerCase().trim()] = ex._id;
          });

          docs = aiTasks.map(t => {
            const titleKey = (t.title || '').toLowerCase().trim();
            return {
              userId,
              title:            t.title        || 'Task',
              description:      t.description  || '',
              category:         (t.category    || 'mindfulness').toLowerCase(),
              scheduledTime:    t.scheduledTime || '08:00',
              duration:         Number(t.duration)  || null,
              difficulty:       (t.difficulty  || 'easy').toLowerCase(),
              xpReward:         Number(t.xpReward)  || 10,
              aiGenerated:      true,
              sourceExerciseId: exByTitle[titleKey] || null,
              date:             new Date(today),
              completed:        false,
            };
          });
        } catch (aiErr) {
          console.error('AI task generation failed:', aiErr.message);
          return res.status(500).json({
            success: false,
            message: 'Could not generate today\'s tasks. Please try again.',
          });
        }

        if (docs.length > 0) {
          await TodayTask.insertMany(docs);
          tasks = await TodayTask
            .find({ userId, date: { $gte: start, $lt: end } })
            .sort('scheduledTime');
        }
      } else {
        // ── SUBSEQUENT OPENS: sync any newly saved exercises ─────────────────
        // BOTH by sourceExerciseId AND by title (to avoid duplicates by either method)
        const existingExIds = new Set(
          tasks
            .filter(t => t.sourceExerciseId)
            .map(t => t.sourceExerciseId.toString())
        );
        const existingTitles = new Set(
          tasks
            .map(t => (t.title || '').toLowerCase().trim())
        );
        
        const newExDocs = (profile.exercises || [])
          .filter(ex => {
            // Skip if already linked by ID
            if (existingExIds.has(ex._id.toString())) return false;
            // Skip if title already exists in today's tasks
            const titleKey = (ex.title || '').toLowerCase().trim();
            if (existingTitles.has(titleKey)) return false;
            // Skip if not active
            if (ex.isActive === false) return false;
            return true;
          })
          .map(ex => buildExerciseTask(userId, ex, today));

        if (newExDocs.length > 0) {
          await TodayTask.insertMany(newExDocs);
          tasks = await TodayTask
            .find({ userId, date: { $gte: start, $lt: end } })
            .sort('scheduledTime');
        }
      }
    }

    // ── Wellness log — get or create, seed food from profile diet ─────────────
    let wellness = await WellnessLog.findOne({ userId, date: today });
    if (!wellness) {
      // Try to use active diet from profile
      const activeDiet = (profile?.diets || []).find(d => d.isActive !== false);
      const foodEntries = activeDiet
        ? buildFoodFromDiet(activeDiet)
        : DEFAULT_FOOD;

      wellness = await WellnessLog.create({
        userId,
        date:       today,
        food:       foodEntries || DEFAULT_FOOD,
        screenTime: DEFAULT_SCREEN,
        score:      0,
        // Snapshot the diet plan used today
        dietPlan:   activeDiet || null,
      });
    }

    // ── Weekly scores (last 7 days) from stored WellnessLog.score ────────────
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Fetch all wellness logs for the past 7 days
    const weekLogs = await WellnessLog.find({
      userId,
      date: { $gte: weekStartStr, $lte: today }
    }).select('date score');

    // Build a date→score map
    const scoreByDate = {};
    weekLogs.forEach(log => { scoreByDate[log.date] = log.score || 0; });

    // Fill 7 days in order (oldest → newest)
    const weeklyScores = [];
    for (let i = 6; i >= 0; i--) {
      const d  = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      weeklyScores.push(scoreByDate[ds] || 0);
    }

    res.json({ success: true, tasks, wellness, profile, weeklyScores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/home/tasks/:id/done ───────────────────────────────────────────
router.patch('/tasks/:id/done', authMiddleware, async (req, res) => {
  try {
    const task = await TodayTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed: true, completedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/home/tasks/:id/undo ───────────────────────────────────────────
router.patch('/tasks/:id/undo', authMiddleware, async (req, res) => {
  try {
    const task = await TodayTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed: false, completedAt: null },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/home/wellness/water ───────────────────────────────────────────
router.patch('/wellness/water', authMiddleware, async (req, res) => {
  try {
    const { consumed } = req.body;
    const today    = getToday();
    const wellness = await WellnessLog.findOneAndUpdate(
      { userId: req.user.id, date: today },
      { 'water.consumed': consumed },
      { new: true, upsert: true }
    );
    res.json({ success: true, water: wellness.water });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/home/wellness/food/:mealId ────────────────────────────────────
router.patch('/wellness/food/:mealId', authMiddleware, async (req, res) => {
  try {
    const today    = getToday();
    const wellness = await WellnessLog.findOne({ userId: req.user.id, date: today });
    if (!wellness) return res.status(404).json({ success: false, message: 'No log for today' });

    const meal = wellness.food.find(f => f.id === req.params.mealId);
    if (!meal) return res.status(404).json({ success: false, message: 'Meal not found' });

    meal.done = !meal.done;
    await wellness.save();
    res.json({ success: true, food: wellness.food });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/home/wellness/screentime ──────────────────────────────────────
router.patch('/wellness/screentime', authMiddleware, async (req, res) => {
  try {
    const { id, minutes } = req.body;
    const today    = getToday();
    const wellness = await WellnessLog.findOne({ userId: req.user.id, date: today });
    if (!wellness) return res.status(404).json({ success: false, message: 'No log for today' });

    const app = wellness.screenTime.find(s => s.id === id);
    if (!app) return res.status(404).json({ success: false, message: 'App not found' });

    app.used = minutes;
    await wellness.save();
    res.json({ success: true, screenTime: wellness.screenTime });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/home/wellness/score ───────────────────────────────────────────
// Save the composite daily score (computed on frontend) to the DB
router.patch('/wellness/score', authMiddleware, async (req, res) => {
  try {
    const { score } = req.body;
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ success: false, message: 'Score must be 0-100' });
    }
    const today    = getToday();
    const wellness = await WellnessLog.findOneAndUpdate(
      { userId: req.user.id, date: today },
      { score },
      { new: true, upsert: true }
    );
    res.json({ success: true, score: wellness.score });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
