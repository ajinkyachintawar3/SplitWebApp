const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'transport', 'entertainment', 'shopping', 'utilities', 'travel', 'other'],
    default: 'other'
  },
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'shares'],
    required: true
  },
  splits: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    share: {
      type: Number,
      default: 1
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  isSettled: {
    type: Boolean,
    default: false
  },
  receipt: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate splits based on split type
expenseSchema.methods.calculateSplits = function(users, splitData) {
  const splits = [];
  
  switch (this.splitType) {
    case 'equal':
      const equalAmount = this.amount / users.length;
      users.forEach(user => {
        splits.push({
          user: user._id,
          amount: equalAmount,
          share: 1
        });
      });
      break;
      
    case 'exact':
      splitData.forEach(split => {
        splits.push({
          user: split.user,
          amount: split.amount,
          share: 1
        });
      });
      break;
      
    case 'shares':
      const totalShares = splitData.reduce((sum, split) => sum + split.share, 0);
      splitData.forEach(split => {
        const amount = (this.amount * split.share) / totalShares;
        splits.push({
          user: split.user,
          amount: amount,
          share: split.share
        });
      });
      break;
  }
  
  this.splits = splits;
  return this;
};

module.exports = mongoose.model('Expense', expenseSchema);
