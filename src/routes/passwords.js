const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const passwordController = require('../controllers/passwordController');
const searchController = require('../controllers/searchController');

router.use(authMiddleware);

router.post('/', passwordController.createPassword);
router.get('/', passwordController.getPasswords);
router.get('/search', searchController.searchPasswords);
router.put('/:id', passwordController.updatePassword);
router.delete('/:id', passwordController.deletePassword);

module.exports = router;
