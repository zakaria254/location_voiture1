const express = require('express');
const router = express.Router();
const {
    getCars,
    getCarById,
    createCar
} = require('../controllers/carController');

router.get('/', getCars);
router.get('/:id', getCarById);
router.post('/', createCar);

module.exports = router;
