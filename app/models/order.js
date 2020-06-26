const mongoose = require('mongoose')
const productSchema = require('./product')

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
