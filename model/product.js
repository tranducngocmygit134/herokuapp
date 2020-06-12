const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      requried: [true, 'Product must have id'], // build validator
    },
    name: {
      type: String,
      required: [true, 'Product must have name'],
      trim: true,
      //minlength: {
      //  values: 50,
      //  message: 'product name must gt than 50',
      //},
      // maxlength : [40, 'message'], minlength
    },
    category: {
      type: String,
    },
    brand_name: {
      type: String,
    },
    short_description: {
      type: String,
      required: [true, 'Product must have description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product must have price'],
      validate: {
        validator: function (val) {
          // this keyword only point to current doc when create new doc
          return val > 0;
        },
        message: 'Price of product must greater than 0',
      },
    },
    discount: {
      type: Number,
    },
    favorite_count: {
      type: Number,
    },
    rating_average: {
      type: Number,
      default: 1,
      min: [0, 'rating must be greater than 0'],
      max: [5, 'rating must be less than 5'],
    },
    review_count: {
      type: Number,
    },
    thumbnail_url: {
      type: String,
      required: [true, 'Product must have thumbnail'],
    },
    productset_group_name: {
      type: String,
    },
    review: {
      type: mongoose.Schema.ObjectId,
      ref: 'Review',
    },
    option_color: [
      {
        display_name: {
          type: String,
          required: [true, 'Product must have name'],
        },
        price: {
          type: Number,
          required: [true, 'Product must have price'],
        },
        list_price: {
          type: Number,
          required: [true, 'Product must have list price'],
        },
        thumbnail: {
          type: String,
          required: [true, 'Product must have thumbnail'],
        },
        small_thumbnail: {
          type: String,
          required: [true, 'Product must have small thumbnail'],
        },
      },
    ],
    seller_product_id: {
      type: Number,
      requried: [true, 'Product must have seller'],
    },
  },
  {
    toJSON: {
      // when create new schema, have 2 params in contructor, 1 for properties of schema, 1 for option, toJSON is an option will execute when res is an JSON file
      virtuals: true,
    },
    toObject: {
      // when res is objec => active option
      virtuals: true,
    },
  }
);

productSchema.virtual('discountPercent').get(function () {
  // alway use function() in mongoose, if work with this keyword
  // we can't use discountPercent as a query params as find({discountPercent: 5})
  return Math.floor((1 - this.price / (this.price + this.discount || 0)) * 100);
});
// ** Document middleware
//productSchema.pre('save', function () {
//  // option 'save' specified that: this will be execute when model is create() or save()
//  console.log(this);
//});
// ** Query middleware
//productSchema.pre(/^find/, function (next) {
//  this.find({ price: undefined }); // this point to current query
//  this.populate('review');
//  next();
//});

module.exports = mongoose.model('Product', productSchema);
