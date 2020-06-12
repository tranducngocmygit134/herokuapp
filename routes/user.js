// Third package
const express = require('express');
// Dev module
const authController = require('../controller/auth');
const userController = require('./../controller/user');
// Variable
const router = express.Router();

router.post('/signup', authController.signup);
router.get('/signup', authController.getSignup);
router.post('/login', authController.login);
router.get('/login', authController.getLogin);
router.get('/logout', authController.getLogout);
router.get('/update', authController.protect, userController.getUpdate);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:resetToken', authController.resetPassword);
router.patch('/updatePassword', authController.protect, authController.update);
router.post('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

// export module
module.exports = router;
