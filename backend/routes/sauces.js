const express = require('express');
const Sauce = require('../models/sauce');
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config');
const router = express.Router();


router.post('/', auth, multer, sauceCtrl.createSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.get('/', auth, sauceCtrl.getAllSauces);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, multer, sauceCtrl.deleteSauce);

module.exports = router;