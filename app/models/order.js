const mongoose = require('mongoose')
const Product = require('./product')
const productSchema = Product.schema

const orderSchema = new mongoose.Schema({
  items: [productSchema],
  address: String,
  message: String,
  total: Number,
  payment: {
    type: String,
    enum: ['Cash', 'Debit', 'Credit']
  },
  img: Buffer,
  phone: Number,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)
