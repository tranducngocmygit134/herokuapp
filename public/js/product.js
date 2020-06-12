const catchAsync = require('./../../utils/catchAsync');
const axios = require('axios');
exports.getAllProduct = catchAsync(async (req, res, next) => {
  const products = await axios({
    method: 'GET',
    url: 'http://127.0.0.1:3000/api/v1/products',
  });
  res.status(200).render('product/product', {
    products: products.data.data.data,
  });
});
exports.getProduct = catchAsync(async (req, res, next) => {
  const product_id = req.params.product_id;
  const product = await axios({
    method: 'GET',
    url: `http://127.0.0.1:3000/api/v1/products/${product_id}`,
  });
  //console.log(product.data.data.data.review.specifications[0].attributes);
  res.status(200).render('product/detail', {
    product: product.data.data.data,
  });
});
exports.getCategory = catchAsync(async (req, res, next) => {
  const category = req.query.category;

  const product = await axios({
    method: 'GET',
    url: `http://127.0.0.1:3000/api/v1/products?category=${category}`,
  });
  res.status(200).render('product/category', {
    products: product.data.data.data,
  });
});
