const mongoose = require('mongoose')
const Product = require('./product')
const productSchema = Product.schema

const orderSchema = new mongoose.Schema({
  items: [productSchema],
  address: String,
  message: String,
  total: Number,
  active: {
    type: Boolean,
    default: false
  },
  payment: {
    type: String,
    enum: ['Cash', 'Debit', 'Credit']
  },
  imageURL: String,
  phone: {
    type: Number,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)
