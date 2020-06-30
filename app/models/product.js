const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      "cakes and cupcakes",
      "crafts",
      "treats"
      ],
    required: true
  },
  price: Number
}, {
  timestamps: true
})

module.exports = mongoose.model('Product', productSchema)
