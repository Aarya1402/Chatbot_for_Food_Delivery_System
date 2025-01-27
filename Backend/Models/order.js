const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
    required: true
  },
  payStatus: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
    required: true
  },
  items: [orderItemSchema]
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
