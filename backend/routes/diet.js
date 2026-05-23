const express        = require('express');
const authMiddleware = require('../utils/authMiddleware');
const {
   generateDiet,
   addDiet,
   getDiets,
   updateDiet,
   deleteDiet,
   saveDietToday,
   getTodayDiet,
} = require('../controller/diet');

const router = express.Router();

// POST /api/diet/generate   → AI generates 3 plan variations (not saved)
router.post('/generate',           authMiddleware, generateDiet);

// POST /api/diet/add        → save one selected plan to Profile.diets[]
router.post('/add',                authMiddleware, addDiet);

// POST /api/diet/save       → save diet to today's WellnessLog
router.post('/save',               authMiddleware, saveDietToday);

// GET  /api/diet/today      → fetch today's saved diet from WellnessLog
router.get('/today',               authMiddleware, getTodayDiet);

// GET  /api/diet/getDiets   → return all saved diets from Profile
router.get('/getDiets',            authMiddleware, getDiets);

// PUT  /api/diet/update/:id → update a saved diet by ID
router.put('/update/:dietId',      authMiddleware, updateDiet);

// DELETE /api/diet/delete/:id → remove a saved diet by ID
router.delete('/delete/:dietId',   authMiddleware, deleteDiet);

module.exports = router;
