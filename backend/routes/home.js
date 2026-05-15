const express       = require('express');
const router        = express.Router();
const authMiddleware = require('../utils/authMiddleware');
const TodayTask     = require('../models/TodayTask');
const WellnessLog   = require('../models/WellnessLog');
const { default: Profile } = require('../models/Profile');

const getToday = () => new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

// ── Default wellness data for first-time setup ──────────────────────────────
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

// ── GET /api/home/today ──────────────────────────────────────────────────────
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today  = getToday();
    const userId = req.user.id;

    // Date range for today
    const start = new Date(today);
    const end   = new Date(today);
    end.setDate(end.getDate() + 1);

    const [tasks, profile] = await Promise.all([
      TodayTask.find({ userId, date: { $gte: start, $lt: end } }).sort('scheduledTime'),
      Profile.findOne({ userId })
    ]);

    // Get or create today's wellness log
    let wellness = await WellnessLog.findOne({ userId, date: today });
    if (!wellness) {
      wellness = await WellnessLog.create({
        userId,
        date:        today,
        food:        DEFAULT_FOOD,
        screenTime:  DEFAULT_SCREEN,
      });
    }

    // Compute weekly scores (last 7 days) from task completions
    const weeklyScores = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const ds_end = new Date(ds);
      ds_end.setDate(ds_end.getDate() + 1);
      const dayTasks = await TodayTask.find({ userId, date: { $gte: new Date(ds), $lt: ds_end } });
      const total     = dayTasks.reduce((s, t) => s + (t.xpReward || 0), 0);
      const completed = dayTasks.filter(t => t.completed).reduce((s, t) => s + (t.xpReward || 0), 0);
      weeklyScores.push(total > 0 ? Math.round((completed / total) * 100) : 0);
    }

    res.json({ success: true, tasks, wellness, profile, weeklyScores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/home/tasks/:id/done ──────────────────────────────────────────
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

// ── PATCH /api/home/tasks/:id/undo ──────────────────────────────────────────
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

// ── PATCH /api/home/wellness/water ──────────────────────────────────────────
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

// ── PATCH /api/home/wellness/food/:mealId ───────────────────────────────────
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

// ── PATCH /api/home/wellness/screentime ─────────────────────────────────────
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
