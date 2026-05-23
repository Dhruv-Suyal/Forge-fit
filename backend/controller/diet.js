const Profile                = require('../models/Profile');
const WellnessLog            = require('../models/WellnessLog');
const { generateDietWithAI } = require('../services/aiCAll');

// Helper to get today's date in YYYY-MM-DD format
function getTodayDate() {
   const d = new Date();
   return d.toISOString().slice(0, 10);
}

// ═══════════════════════════════════════════════════════════════════
// POST /api/diet/generate
// body: { title, goal, dietaryRestrictions }
// Returns 3 AI-generated diet plan variations with images (does NOT save)
// ═══════════════════════════════════════════════════════════════════
exports.generateDiet = async (req, res) => {
   try {
      const { title, goal, dietaryRestrictions } = req.body;

      if (!title) {
         return res.status(400).json({ success: false, message: 'Plan title is required' });
      }

      // Returns array of 3 plan objects, each with image attached
      const diets = await generateDietWithAI(title, goal || 'general health', dietaryRestrictions || '');

      return res.status(200).json({ success: true, diets });

   } catch (err) {
      console.error('[diet/generate]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};

// ═══════════════════════════════════════════════════════════════════
// POST /api/diet/add
// body: one diet plan object (selected by user from generated options)
// Saves it to Profile.diets[]
// ═══════════════════════════════════════════════════════════════════
exports.addDiet = async (req, res) => {
   try {
      const userId = req.user.id;
      const { title, goal, category, totalCalories, image, imageSearch, meals } = req.body;

      if (!title || !meals || !Array.isArray(meals)) {
         return res.status(400).json({ success: false, message: 'title and meals are required' });
      }

      const profile = await Profile.findOne({ userId });
      if (!profile) {
         return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      // Prevent exact duplicate titles
      const exists = profile.diets.find(d => d.title.toLowerCase() === title.toLowerCase());
      if (exists) {
         // Update instead of duplicate
         Object.assign(exists, { goal, category, totalCalories, image, imageSearch, meals });
         await profile.save();
         return res.status(200).json({
            success:  true,
            message:  'Diet plan updated in profile',
            diets:    profile.diets,
         });
      }

      profile.diets.push({ title, goal, category, totalCalories, image, imageSearch, meals });
      await profile.save();

      return res.status(200).json({
         success:  true,
         message:  'Diet plan saved to profile',
         diets:    profile.diets,
      });

   } catch (err) {
      console.error('[diet/add]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/diet/getDiets
// Returns all saved diets from Profile.diets[]
// ═══════════════════════════════════════════════════════════════════
exports.getDiets = async (req, res) => {
   try {
      const userId = req.user.id;
      const profile = await Profile.findOne({ userId }).select('diets');

      if (!profile) {
         return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      return res.status(200).json({ success: true, diets: profile.diets });

   } catch (err) {
      console.error('[diet/getDiets]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};

// ═══════════════════════════════════════════════════════════════════
// PUT /api/diet/update/:dietId
// body: fields to update (title, goal, category, totalCalories, meals)
// Updates one diet plan in Profile.diets[]
// ═══════════════════════════════════════════════════════════════════
exports.updateDiet = async (req, res) => {
   try {
      const userId  = req.user.id;
      const { dietId } = req.params;
      const { title, goal, category, totalCalories, meals } = req.body;

      const profile = await Profile.findOne({ userId });
      if (!profile) {
         return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      const diet = profile.diets.id(dietId);
      if (!diet) {
         return res.status(404).json({ success: false, message: 'Diet not found' });
      }

      if (title)         diet.title         = title;
      if (goal)          diet.goal          = goal;
      if (category)      diet.category      = category;
      if (totalCalories) diet.totalCalories = totalCalories;
      if (meals)         diet.meals         = meals;

      await profile.save();

      return res.status(200).json({
         success: true,
         message: 'Diet plan updated',
         diets:   profile.diets,
      });

   } catch (err) {
      console.error('[diet/update]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};

// ═══════════════════════════════════════════════════════════════════
// DELETE /api/diet/delete/:dietId
// Removes one diet plan from Profile.diets[]
// ═══════════════════════════════════════════════════════════════════
exports.deleteDiet = async (req, res) => {
   try {
      const userId  = req.user.id;
      const { dietId } = req.params;

      const profile = await Profile.findOne({ userId });
      if (!profile) {
         return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      const index = profile.diets.findIndex(d => d._id.toString() === dietId);
      if (index === -1) {
         return res.status(404).json({ success: false, message: 'Diet not found' });
      }

      profile.diets.splice(index, 1);
      await profile.save();

      return res.status(200).json({
         success: true,
         message: 'Diet plan deleted',
         diets:   profile.diets,
      });

   } catch (err) {
      console.error('[diet/delete]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};

// ═══════════════════════════════════════════════════════════════════
// POST /api/diet/save
// body: { title, goal, totalCalories, meals, image, category }
// Saves diet to today's WellnessLog entry
// ═══════════════════════════════════════════════════════════════════
exports.saveDietToday = async (req, res) => {
   try {
      const userId = req.user.id;
      const { title, goal, totalCalories, meals, image, category } = req.body;
      const today = getTodayDate();

      if (!title || !meals || !Array.isArray(meals)) {
         return res.status(400).json({ success: false, message: 'title and meals are required' });
      }

      // Find or create today's wellness log
      let log = await WellnessLog.findOne({ userId, date: today });
      if (!log) {
         log = new WellnessLog({ userId, date: today });
      }

      // Save diet plan to today's log
      log.dietPlan = { title, goal, category, totalCalories, meals, image };
      await log.save();

      // Also add to Profile.diets[] for history
      const profile = await Profile.findOne({ userId });
      if (profile) {
         const exists = profile.diets.find(d => d.title.toLowerCase() === title.toLowerCase());
         if (!exists) {
            profile.diets.push({ title, goal, category, totalCalories, image, imageSearch: '', meals });
            await profile.save();
         }
      }

      return res.status(200).json({
         success: true,
         message: 'Diet saved to today\'s wellness log',
         dietPlan: log.dietPlan,
      });

   } catch (err) {
      console.error('[diet/save]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};

// ═══════════════════════════════════════════════════════════════════
// GET /api/diet/today
// Returns today's saved diet plan from WellnessLog
// ═══════════════════════════════════════════════════════════════════
exports.getTodayDiet = async (req, res) => {
   try {
      const userId = req.user.id;
      const today = getTodayDate();

      const log = await WellnessLog.findOne({ userId, date: today }).select('dietPlan');

      return res.status(200).json({
         success: true,
         dietPlan: log?.dietPlan || null,
      });

   } catch (err) {
      console.error('[diet/today]', err.message);
      return res.status(500).json({ success: false, message: err.message });
   }
};
