const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Settlement = require('../models/Settlement');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/expenses/group/:groupId
// @desc    Get expenses for a group
// @access  Private
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member of the group
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', [
  auth,
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('group').isMongoId().withMessage('Valid group ID is required'),
  body('splitType').isIn(['equal', 'exact', 'shares']).withMessage('Invalid split type'),
  body('splits').isArray({ min: 1 }).withMessage('At least one split is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, amount, group, category, splitType, splits, notes, receipt } = req.body;

    // Check if group exists and user is member
    const groupDoc = await Group.findById(group);
    if (!groupDoc) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = groupDoc.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create expense
    const expense = new Expense({
      description,
      amount,
      group,
      category: category || 'other',
      splitType,
      paidBy: req.user._id,
      notes,
      receipt
    });

    // Calculate splits
    if (splitType === 'equal') {
      const groupMembers = groupDoc.members.map(member => member.user);
      expense.calculateSplits(groupMembers, []);
    } else {
      expense.calculateSplits([], splits);
    }

    await expense.save();

    // Add expense to group
    await Group.findByIdAndUpdate(group, {
      $push: { expenses: expense._id }
    });

    // Calculate and create settlements
    await calculateSettlements(group);

    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('splits.user', 'name email avatar');

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', [
  auth,
  body('description').optional().trim().isLength({ min: 1 }).withMessage('Description cannot be empty'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is the one who paid or admin of the group
    const group = await Group.findById(expense.group);
    const isAdmin = group.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (expense.paidBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { description, amount, category, notes, receipt } = req.body;

    if (description) expense.description = description;
    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    if (notes !== undefined) expense.notes = notes;
    if (receipt !== undefined) expense.receipt = receipt;

    await expense.save();

    // Recalculate settlements
    await calculateSettlements(expense.group);

    await expense.populate('paidBy', 'name email avatar');
    await expense.populate('splits.user', 'name email avatar');

    res.json(expense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is the one who paid or admin of the group
    const group = await Group.findById(expense.group);
    const isAdmin = group.members.some(member => 
      member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (expense.paidBy.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove expense from group
    await Group.findByIdAndUpdate(expense.group, {
      $pull: { expenses: expense._id }
    });

    await Expense.findByIdAndDelete(req.params.id);

    // Recalculate settlements
    await calculateSettlements(expense.group);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate settlements
async function calculateSettlements(groupId) {
  try {
    // Clear existing settlements for this group
    await Settlement.deleteMany({ group: groupId });

    const expenses = await Expense.find({ group: groupId });
    const group = await Group.findById(groupId).populate('members.user');

    // Calculate net balances for each user
    const balances = {};
    group.members.forEach(member => {
      balances[member.user._id] = 0;
    });

    // Process each expense
    expenses.forEach(expense => {
      // Add amount to the person who paid
      balances[expense.paidBy] += expense.amount;

      // Subtract amount from each person who owes
      expense.splits.forEach(split => {
        balances[split.user] -= split.amount;
      });
    });

    // Create settlements
    const creditors = [];
    const debtors = [];

    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance > 0.01) {
        creditors.push({ userId, amount: balance });
      } else if (balance < -0.01) {
        debtors.push({ userId, amount: Math.abs(balance) });
      }
    });

    // Match creditors with debtors
    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];

      const settlementAmount = Math.min(creditor.amount, debtor.amount);

      if (settlementAmount > 0.01) {
        await Settlement.create({
          from: debtor.userId,
          to: creditor.userId,
          amount: settlementAmount,
          group: groupId
        });

        creditor.amount -= settlementAmount;
        debtor.amount -= settlementAmount;

        if (creditor.amount < 0.01) creditorIndex++;
        if (debtor.amount < 0.01) debtorIndex++;
      }
    }
  } catch (error) {
    console.error('Calculate settlements error:', error);
  }
}

module.exports = router;
