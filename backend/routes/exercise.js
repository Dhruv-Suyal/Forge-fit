const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const { getExercise, addExercise, deleteExercise } = require('../controller/exercise');
const { searchExercise } = require('../services/aiCAll');

const router = express.Router();

router.get("/getExercise", authMiddleware, getExercise);
router.post("/addExercise", authMiddleware, addExercise);
router.delete("/deleteExercise/:exerciseId", authMiddleware, deleteExercise);
router.post("/SearchExercise", authMiddleware, searchExercise);

module.exports = router;