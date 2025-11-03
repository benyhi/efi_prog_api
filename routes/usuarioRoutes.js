const express = require('express');
const usuarioController = require('../controllers/usuarioController.js');
const router = express.Router();
router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);
module.exports = router;