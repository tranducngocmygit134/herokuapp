const express = require('express');
const productController = require('./../controller/product');
const authController = require('./../controller/auth');
const router = express.Router();

router.get('/', productController.getAllProducts);
router
  .route('/:product_id')
  .get(authController.protect, productController.getProduct)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

module.exports = router;
