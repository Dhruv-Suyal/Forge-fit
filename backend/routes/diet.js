const express        = require('express');
const authMiddleware = require('../utils/authMiddleware');
const {
   generateDiet,
   saveDiet,
   getTodayDiet,
} = require('../controller/diet');

const router = express.Router();

// POST /api/diet/generate  → AI-generate a plan (not saved yet)
router.post('/generate',  authMiddleware, generateDiet);

// POST /api/diet/save      → save generated plan to today's WellnessLog
router.post('/save',      authMiddleware, saveDiet);

// GET  /api/diet/today     → fetch today's saved dietPlan
router.get('/today',      authMiddleware, getTodayDiet);

module.exports = router;
