const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  specifications: [
    {
      name: {
        type: String,
        required: [true, 'Specifications must have name'],
      },
      attributes: [
        {
          name: {
            type: String,
            required: [true, 'Origin must have name'],
          },
          value: {
            type: String,
            required: [true, 'Origin must have value'],
          },
        },
      ],
    },
  ],
  comments: [
    {
      title: {
        type: String,
        required: [true, 'Review must have title'],
      },
      content: {
        type: String,
        required: [true, 'Review must have content'],
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 4,
      },
      images: [],
      created_by: {
        name: {
          type: String,
        },
        avatar_url: {
          type: String,
        },
      },
    },
  ],
});

module.exports = mongoose.model('Review', reviewSchema);
