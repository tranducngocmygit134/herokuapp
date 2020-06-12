// dev module
const Product = require('./../model/product');
const ApiFeature = require('../utils/apiFeature');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// api method
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const queryString = req.query; // get query from client
  const apiFeature = new ApiFeature(Product.find(), queryString)
    .filter()
    .sort()
    .fields()
    .pagination(); // contructor
  const products = await apiFeature.query; // execute find()
  // if products = undefined => this isn't error, all correct
  let maxPage;
  const len = await Product.find({ category: req.query.category });
  const pages = Math.ceil((len.length * 1) / 12);
  if (pages > 1) maxPage = pages;
  const currentPage = req.query.page * 1 || 1;
  let hasPrevPage, hasNextPage;
  if (currentPage > 2) {
    hasPrevPage = 1;
  }
  if (currentPage + 1 < maxPage) {
    hasNextPage = 1;
  }
  let path = req.url;
  path = path.replace(/&page=\d/g, '');
  path = path.replace(/\//, '');
  res.status(200).render('product/category', {
    products,
    maxPage,
    currentPage,
    hasPrevPage,
    hasNextPage,
    path,
  }); // send to client
});
exports.getOverview = catchAsync(async (req, res, next) => {
  res.status(200).render('overview/overview');
});
exports.getProduct = catchAsync(async (req, res, next) => {
  const { product_id } = req.params;
  const product = await Product.findById(product_id).populate('review');
  if (!product) {
    const statusCode = 400;
    const message = `Can't find product for this id`;
    return next(new AppError(statusCode, message));
  }
  res.status(200).render('product/detail', {
    product,
  });
});
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { product_id } = req.params;
  const product = await Product.findByIdAndDelete(product_id);
  if (!product) {
    const statusCode = 400;
    const message = `Can't find product for this id`;
    return next(new AppError(statusCode, message));
  }
  res.status(200).json({
    status: 'Success',
    message: 'Product is deleted',
  });
});
