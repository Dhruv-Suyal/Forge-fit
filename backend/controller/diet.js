const WellnessLog         = require('../models/WellnessLog');
const { generateDietWithAI } = require('../services/aiCAll');

// ── helpers ───────────────────────────────────────────────────────────────────
const todayString = () => new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

// ═══════════════════════════════════════════════════════════════════
// POST /api/diet/generate
// body: { title, goal }
// Returns AI-generated diet plan (does NOT save yet)
// ═══════════════════════════════════════════════════════════════════
exports.generateDiet = async (req, res) => {
   try {
      const { title, goal } = req.body;

      if (!title) {
         return res.status(400).json({ success: false, message: 'Plan title is required' });
      }

      const diet = await generateDietWithAI(title, goal || 'general health');

      return res.status(200).json({ success: true, diet });

   } catch (err) {
      console.error('[diet/generate]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};

// ═══════════════════════════════════════════════════════════════════
// POST /api/diet/save
// body: { title, goal, totalCalories, meals[] }
// Upserts WellnessLog.dietPlan for today
// ═══════════════════════════════════════════════════════════════════
exports.saveDiet = async (req, res) => {
   try {
      const userId = req.user.id;
      const date   = todayString();
      const { title, goal, totalCalories, meals } = req.body;

      if (!title || !meals || !Array.isArray(meals)) {
         return res.status(400).json({ success: false, message: 'title and meals array are required' });
      }

      const log = await WellnessLog.findOneAndUpdate(
         { userId, date },
         {
            $set: {
               dietPlan: { title, goal, totalCalories, meals }
            }
         },
         {
            upsert: true,   // create today's log if it doesn't exist
            new:    true,   // return the updated document
            setDefaultsOnInsert: true,
         }
      );

      return res.status(200).json({
         success:  true,
         message:  'Diet plan saved to today\'s wellness log',
         dietPlan: log.dietPlan,
      });

   } catch (err) {
      console.error('[diet/save]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/diet/today
// Returns today's saved dietPlan from WellnessLog (or null)
// ═══════════════════════════════════════════════════════════════════
exports.getTodayDiet = async (req, res) => {
   try {
      const userId = req.user.id;
      const date   = todayString();

      const log = await WellnessLog.findOne({ userId, date }).select('dietPlan');

      return res.status(200).json({
         success:  true,
         dietPlan: log?.dietPlan ?? null,
      });

   } catch (err) {
      console.error('[diet/today]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};
