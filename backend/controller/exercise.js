const Profile = require('../models/Profile');

exports.getExercise = async (req, res) => {
   try {
      const userId = req.user.id;
      const profile = await Profile.findOne({ userId });
      if (!profile) {
         return res.status(404).json({ message: "Profile not found" });
      }
      return res.status(200).json({ exercises: profile.exercises });
   } catch (err) {
      return res.status(500).json({ message: err.message });
   }
};

exports.addExercise = async (req, res) => {
   try {
      const userId = req.user.id;
      const {
         title, goal, category, difficulty,
         sets, reps, duration, preferredTime, image, video
      } = req.body;

      const profile = await Profile.findOne({ userId });
      if (!profile) {
         return res.status(404).json({ message: "Profile not found" });
      }
      const alreadyExists = profile.exercises.find(
                              (e) =>
                                 e.title.toLowerCase() ===
                                 title.toLowerCase()
                           );

      if (alreadyExists) {
         return res.status(400).json({
            message: "Exercise already exists"
         });
      }

      profile.exercises.push({
         title, goal, category, difficulty,
         sets, reps, duration, preferredTime, image, video
      });

      await profile.save();

      return res.status(200).json({
         message: "Exercise added successfully",
         exercises: profile.exercises
      });
   } catch (err) {
      return res.status(500).json({ message: err.message });
   }
};

exports.deleteExercise = async (req, res) => {
   try {
      const userId = req.user.id;
      const { exerciseId } = req.params;

      const profile = await Profile.findOne({ userId });
      if (!profile) {
         return res.status(404).json({ message: "Profile not found" });
      }

      const index = profile.exercises.findIndex(
         (e) => e._id.toString() === exerciseId
      );
      if (index === -1) {
         return res.status(404).json({ message: "Exercise not found" });
      }

      profile.exercises.splice(index, 1);
      await profile.save();

      return res.status(200).json({
         message: "Exercise deleted successfully",
         exercises: profile.exercises
      });
   } catch (err) {
      return res.status(500).json({ message: err.message });
   }
};

