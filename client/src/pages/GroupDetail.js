import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  DollarSign, 
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Settings
} from 'lucide-react';

const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes] = await Promise.all([
        api.get(`/api/groups/${id}`),
        api.get(`/api/expenses/group/${id}`)
      ]);

      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Error fetching group data:', error);
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const isAdmin = group?.members.some(
    member => member.user._id === user.id && member.role === 'admin'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Group not found</h1>
          <p className="mt-2 text-gray-600">The group you're looking for doesn't exist.</p>
          <Link to="/groups" className="btn-primary mt-4">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/groups')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Groups
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            {group.description && (
              <p className="mt-2 text-gray-600">{group.description}</p>
            )}
            <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                <span>{group.members.length} members</span>
              </div>
              <div className="flex items-center">
                <DollarSign size={16} className="mr-1" />
                <span>{expenses.length} expenses</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>Created {formatDate(group.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to={`/groups/${id}/expense`}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Expense</span>
            </Link>
            
            {isAdmin && (
              <button className="btn-secondary flex items-center space-x-2">
                <Settings size={16} />
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'expenses'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Members
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'expenses' && (
        <div>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-24 w-24 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No expenses yet</h3>
              <p className="mt-2 text-gray-500">
                Start by adding your first expense to this group.
              </p>
              <div className="mt-6">
                <Link
                  to={`/groups/${id}/expense`}
                  className="btn-primary"
                >
                  Add your first expense
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div key={expense._id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {expense.description}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {expense.category}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Paid by {expense.paidBy.name}</span>
                        <span>•</span>
                        <span>{formatDate(expense.date)}</span>
                        <span>•</span>
                        <span>{expense.splitType} split</span>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          Split among {expense.splits.length} people
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(expense.amount, group.currency)}
                      </p>
                      {expense.notes && (
                        <p className="text-sm text-gray-500 mt-1">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Group Members</h3>
              {isAdmin && (
                <button className="btn-secondary flex items-center space-x-2">
                  <UserPlus size={16} />
                  <span>Invite Member</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {group.members.map((member) => (
                <div key={member.user._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {member.role === 'admin' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Admin
                      </span>
                    )}
                    {isAdmin && member.user._id !== user.id && (
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
