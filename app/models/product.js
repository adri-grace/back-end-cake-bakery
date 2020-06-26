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
  price: Number
}, {
  timestamps: true
})

module.exports = mongoose.model('Product', productSchema)
