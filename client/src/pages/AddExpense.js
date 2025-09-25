import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  DollarSign, 
  FileText,
  Tag
} from 'lucide-react';

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    splitType: 'equal',
    notes: '',
    receipt: ''
  });
  const [splits, setSplits] = useState([]);

  const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'travel', label: 'Travel' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchGroup();
  }, [id, fetchGroup]);

  const fetchGroup = useCallback(async () => {
    try {
      const response = await api.get(`/api/groups/${id}`);
      setGroup(response.data);
      
      // Initialize splits for equal split
      const members = response.data.members.map(member => ({
        user: member.user._id,
        amount: 0,
        share: 1
      }));
      setSplits(members);
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group data');
      navigate('/groups');
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Recalculate splits when amount or split type changes
    if (name === 'amount' || name === 'splitType') {
      recalculateSplits(value, name === 'splitType' ? value : formData.splitType);
    }
  };

  const recalculateSplits = (amount, splitType) => {
    if (!group || !amount) return;

    const numAmount = parseFloat(amount) || 0;
    const newSplits = group.members.map(member => {
      let amount = 0;
      let share = 1;

      if (splitType === 'equal') {
        amount = numAmount / group.members.length;
      } else if (splitType === 'shares') {
        // For shares, we'll need to get the share value from the splits array
        const existingSplit = splits.find(s => s.user === member.user._id);
        share = existingSplit ? existingSplit.share : 1;
        const totalShares = group.members.reduce((sum, m) => {
          const existingSplit = splits.find(s => s.user === m.user._id);
          return sum + (existingSplit ? existingSplit.share : 1);
        }, 0);
        amount = (numAmount * share) / totalShares;
      }

      return {
        user: member.user._id,
        amount: amount,
        share: share
      };
    });

    setSplits(newSplits);
  };

  const handleSplitChange = (userId, field, value) => {
    setSplits(prev => prev.map(split => {
      if (split.user === userId) {
        const updatedSplit = { ...split, [field]: parseFloat(value) || 0 };
        
        // Recalculate amounts if shares changed
        if (field === 'share' && formData.splitType === 'shares') {
          const totalShares = prev.reduce((sum, s) => {
            return sum + (s.user === userId ? updatedSplit.share : s.share);
          }, 0);
          updatedSplit.amount = (parseFloat(formData.amount) * updatedSplit.share) / totalShares;
        }
        
        return updatedSplit;
      }
      return split;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        group: id,
        splits: splits
      };

      await api.post('/api/expenses', expenseData);
      toast.success('Expense added successfully!');
      navigate(`/groups/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add expense';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/groups/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to {group.name}
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900">Add Expense</h1>
        <p className="mt-2 text-gray-600">
          Add a new expense to {group.name} and split it among members.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="What was this expense for?"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0.01"
                required
                value={formData.amount}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field pl-10"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How do you want to split this expense?
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="splitType"
                  value="equal"
                  checked={formData.splitType === 'equal'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <span>Split equally among all members</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="splitType"
                  value="exact"
                  checked={formData.splitType === 'exact'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <span>Split by exact amounts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="splitType"
                  value="shares"
                  checked={formData.splitType === 'shares'}
                  onChange={handleChange}
                  className="mr-3"
                />
                <span>Split by shares</span>
              </label>
            </div>
          </div>

          {/* Split Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split Details
            </label>
            <div className="space-y-3">
              {splits.map((split) => {
                const member = group.members.find(m => m.user._id === split.user);
                return (
                  <div key={split.user} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {formData.splitType === 'exact' && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={split.amount}
                            onChange={(e) => handleSplitChange(split.user, 'amount', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      )}
                      {formData.splitType === 'shares' && (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="1"
                            value={split.share}
                            onChange={(e) => handleSplitChange(split.user, 'share', e.target.value)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-500">shares</span>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(split.amount, group.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/groups/${id}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
