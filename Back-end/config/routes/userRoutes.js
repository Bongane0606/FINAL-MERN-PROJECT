const express = require('express');
const { protect } = require('../middleware/auth');
const {
  registerUser,
  authUser,
  getUserProfile,
  completeQuiz
} = require('../controllers/userController');

const router = express.Router();

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.put('/complete-quiz', protect, completeQuiz);

module.exports = router;