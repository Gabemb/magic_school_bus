const router = require('express').Router();

router.use('/users', require('./user/user_router'));
router.use('/classes', require('./class/class_router'));
router.use('/lessons', require('./lesson/lesson_router'));


module.exports = router;
