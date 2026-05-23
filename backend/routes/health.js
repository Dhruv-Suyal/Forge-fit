const express = require('express');
const router = express.Router();
const auth = require('../utils/authMiddleware');
const HealthController = require('../controller/health');

router.get('/summary', auth, HealthController.getSummary);
router.put('/sleep', auth, HealthController.updateSleep);
router.post('/habits', auth, HealthController.updateHabits);

module.exports = router;
