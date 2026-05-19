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


// ── Default wellness data ─────────────────────────────────────────────────────
const DEFAULT_FOOD = [
  { id: 'f1', meal: 'Breakfast', time: '07:30', items: ['Oats + banana', '2 boiled eggs', 'Green tea'],    done: false },
  { id: 'f2', meal: 'Lunch',     time: '13:00', items: ['Brown rice', 'Dal', 'Salad', 'Curd'],              done: false },
  { id: 'f3', meal: 'Evening',   time: '17:00', items: ['Fruit bowl', 'Handful nuts'],                      done: false },
  { id: 'f4', meal: 'Dinner',    time: '19:00', items: ['Roti × 2', 'Sabzi', 'Soup'],                       done: false },
];
const DEFAULT_SCREEN = [
  { id: 's1', app: 'Instagram', icon: '◈', limit: 20, used: 0, color: '#e1306c' },
  { id: 's2', app: 'YouTube',   icon: '⟡', limit: 30, used: 0, color: '#ff0000' },
  { id: 's3', app: 'Twitter/X', icon: '✦', limit: 15, used: 0, color: '#1d9bf0' },
];

// ── GET /api/home/today ───────────────────────────────────────────────────────
// FLOW:
//   tasks.length === 0 → first open of the day → generate full day task list
//   tasks.length  >  0 → day already started   → only sync newly added exercises
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
        const existingExIds = new Set(
          tasks
            .filter(t => t.sourceExerciseId)
            .map(t => t.sourceExerciseId.toString())
        );
        const newExDocs = (profile.exercises || [])
          .filter(ex => ex.isActive !== false && !existingExIds.has(ex._id.toString()))
          .map(ex => buildExerciseTask(userId, ex, today));

        if (newExDocs.length > 0) {
          await TodayTask.insertMany(newExDocs);
          tasks = await TodayTask
            .find({ userId, date: { $gte: start, $lt: end } })
            .sort('scheduledTime');
        }
      }
    }

    // Wellness log — get or create
    let wellness = await WellnessLog.findOne({ userId, date: today });
    if (!wellness) {
      wellness = await WellnessLog.create({
        userId,
        date:       today,
        food:       DEFAULT_FOOD,
        screenTime: DEFAULT_SCREEN,
      });
    }

    // Weekly scores (last 7 days)
    const weeklyScores = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds     = d.toISOString().split('T')[0];
      const ds_end = new Date(ds);
      ds_end.setDate(ds_end.getDate() + 1);
      const dayTasks  = await TodayTask.find({ userId, date: { $gte: new Date(ds), $lt: ds_end } });
      const total     = dayTasks.reduce((s, t) => s + (t.xpReward || 0), 0);
      const completed = dayTasks.filter(t => t.completed).reduce((s, t) => s + (t.xpReward || 0), 0);
      weeklyScores.push(total > 0 ? Math.round((completed / total) * 100) : 0);
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

module.exports = router;
