require('dotenv').config();
const { Router } = require('express');
const router = Router();

const { getTasks, createTask, deleteTask, changeStatus, updateTask } = require('../controllers/task.controller');
const { login, signup } = require('../controllers/auth.controller');
const { extractAuthorId } = require('../middlewares/auth.middleware');

// Task routes
router.get('/tasks/', extractAuthorId, getTasks);
router.post('/tasks/create', extractAuthorId, createTask);
router.delete('/tasks/delete/:id', extractAuthorId, deleteTask);
router.put('/tasks/update/:id', extractAuthorId, updateTask);
router.patch('/tasks/status/:id', extractAuthorId, changeStatus);

// Auth routes
router.post('/login', login);
router.post('/signup', signup);

module.exports = router;