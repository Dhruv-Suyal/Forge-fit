const User = require('../models/User');
const Profile = require('../models/Profile');
const WellnessLog = require('../models/WellnessLog');

// Helper to format date YYYY-MM-DD
function formatDate(d) {
  return d.toISOString().slice(0,10);
}

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).lean();
    const profile = await Profile.findOne({ userId }).lean();

    // Build a simple weekly graph based on water consumption ratio
    const graph = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const log = await WellnessLog.findOne({ userId, date: dateStr }).lean();
      let score = 0;
      if (log && log.water) {
        const target = log.water.target || 8;
        const consumed = log.water.consumed || 0;
        score = Math.min(100, Math.round((consumed / target) * 100));
      }
      graph.push({ date: dateStr, score });
    }

    // Overall score: normalize user.xp into 0-100 (simple clamped scale)
    const xp = user?.xp || 0;
    const overallScore = Math.max(0, Math.min(100, Math.round(xp / 10)));

    res.json({
      overallScore,
      streak: user?.streak || 0,
      habitsToBuild: profile?.habitsToBuild || [],
      habitsToQuit: profile?.habitsToQuit || [],
      wakeUpTime: profile?.wakeUpTime || '06:00 AM',
      sleepTime: profile?.sleepTime || '10:00 PM',
      graph,
    });
  } catch (err) {
    console.error('[health/summary]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSleep = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { wakeUpTime, sleepTime } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: { wakeUpTime, sleepTime } },
      { new: true, upsert: true }
    ).lean();
    res.json({ wakeUpTime: profile.wakeUpTime, sleepTime: profile.sleepTime });
  } catch (err) {
    console.error('[health/sleep]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateHabits = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { field, action, habit } = req.body; // field: habitsToBuild|habitsToQuit
    if (!['habitsToBuild', 'habitsToQuit'].includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }
    const update = action === 'add' ? { $addToSet: { [field]: habit } } : { $pull: { [field]: habit } };
    const profile = await Profile.findOneAndUpdate({ userId }, update, { new: true, upsert: true }).lean();
    res.json({ [field]: profile[field] });
  } catch (err) {
    console.error('[health/habits]', err);
    res.status(500).json({ message: 'Server error' });
  }
};
