const mongoose = require('mongoose')
const Product = require('./product')
const productSchema = Product.schema

const orderSchema = new mongoose.Schema({
  items: [productSchema],
  message: String,
  total: Number,
  active: {
    type: Boolean,
    default: false
  },
  imageURL: String,
  name: String,
  phone: {
    type: Number,
    required: true,
    unique: true
  },
  email: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)
