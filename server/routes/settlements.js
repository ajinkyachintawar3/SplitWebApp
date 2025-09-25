const express = require('express');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/settlements/group/:groupId
// @desc    Get settlements for a group
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

    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(settlements);
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settlements/:id/pay
// @desc    Mark settlement as paid
// @access  Private
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id);

    if (!settlement) {
      return res.status(404).json({ message: 'Settlement not found' });
    }

    // Check if user is involved in this settlement
    if (settlement.from.toString() !== req.user._id.toString() && 
        settlement.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    settlement.isPaid = true;
    settlement.paidAt = new Date();
    await settlement.save();

    await settlement.populate('from', 'name email avatar');
    await settlement.populate('to', 'name email avatar');

    res.json(settlement);
  } catch (error) {
    console.error('Mark settlement as paid error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settlements/user/:userId
// @desc    Get user's settlements across all groups
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settlements = await Settlement.find({
      $or: [
        { from: req.user._id },
        { to: req.user._id }
      ]
    })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .populate('group', 'name')
      .sort({ createdAt: -1 });

    res.json(settlements);
  } catch (error) {
    console.error('Get user settlements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
