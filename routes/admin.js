// Npm package
const express = require('express');
const router = express.Router();
// Dev package
const adminController = require('./../controller/admin');
const authController = require('./../controller/auth');

router.get(
  '/getAllUser',
  authController.protect,
  authController.restrictTo('admin'),
  adminController.getAllUser
);
router.route('/about').get(adminController.getAbout);

module.exports = router;
