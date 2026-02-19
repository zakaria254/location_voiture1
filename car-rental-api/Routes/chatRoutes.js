const express = require('express');
const { ask } = require('../controllers/chatController');
const optionalAuth = require('../middlewares/optionalAuth');

const router = express.Router();

router.post('/', optionalAuth, ask);

module.exports = router;
