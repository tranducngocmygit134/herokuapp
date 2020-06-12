const mongoose = require('mongoose');
const mongooseSanitize = require('express-mongo-sanitize');
const Product = require('./../model/product');
const Review = require('./../model/review');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const local_db = process.env.LOCAL_DB;

mongoose
  .connect(local_db, {
    useCreateIndex: true, // use createIndex instead of ensureIndex
    useFindAndModify: false, // findAndUpdate and findAndRemove as findAndUpdate instead findAndModify
    useNewUrlParser: true, // use new url parser, if error happen => use old url parser
    useUnifiedTopology: true, // stable connect
  })
  .then(() => {
    //console.log('DB is connected');
  })
  .catch((err) => {
    console.log(err);
  });

const getData = async function (category) {
  return await axios.get(
    `https://tiki.vn/api/v2/products?category=${category}&limit=50`
  );
};
(async () => {
  try {
    //const categories = [44792, 1789, 1882, 1846, 4384, 1815, 8322, 4221, 1801];
    //const categories = [44792, 1789, 1882];
    let products = [];
    (async (el) => {
      try {
        const data = await getData(el);
        const dataInfo = data.data.data;
        //console.log(dataInfo);
        dataInfo.forEach(async (el) => {
          let reviewDocument = {};
          let product = el;
          const productId = el.id;
          const review = await axios.get(
            `https://tiki.vn/api/v2/reviews?product_id=${productId}`
          );
          const origin = await axios.get(
            `https://tiki.vn/api/v2/products/${productId}`
          );
          let comments = review.data.data;
          let specifications = origin.data.specifications;
          reviewDocument.comments = comments;
          reviewDocument.specifications = specifications;
          //console.log(reviewDocument.specifications, reviewDocument.comments);
          const reviewProduct = await Review.create(reviewDocument);
          product.review = reviewProduct._id;
          product.category = 'smartphone';
          //console.log(product);
          await Product.create(product);
        });
      } catch (err) {
        console.log(err);
      }
    })(1789);
    return products;
  } catch (err) {
    console.log(err);
  }
})();
