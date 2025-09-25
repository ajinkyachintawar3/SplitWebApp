import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, 
  Plus, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [groupsRes, settlementsRes] = await Promise.all([
        api.get('/api/groups'),
        api.get('/api/settlements/user/' + user.id)
      ]);

      setGroups(groupsRes.data);
      setSettlements(settlementsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalOwed = () => {
    return settlements
      .filter(s => s.from._id === user.id && !s.isPaid)
      .reduce((total, settlement) => total + settlement.amount, 0);
  };

  const calculateTotalOwedToMe = () => {
    return settlements
      .filter(s => s.to._id === user.id && !s.isPaid)
      .reduce((total, settlement) => total + settlement.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening with your expenses and groups.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">You Owe</p>
              <p className="text-2xl font-bold text-danger-600">
                ${calculateTotalOwed().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">You're Owed</p>
              <p className="text-2xl font-bold text-success-600">
                ${calculateTotalOwedToMe().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Settlements</p>
              <p className="text-2xl font-bold text-gray-900">
                {settlements.filter(s => !s.isPaid).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Groups */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
            <Link
              to="/groups/create"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create Group</span>
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new group.
              </p>
              <div className="mt-6">
                <Link
                  to="/groups/create"
                  className="btn-primary"
                >
                  Create your first group
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.slice(0, 5).map((group) => (
                <Link
                  key={group._id}
                  to={`/groups/${group._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {group.members.length} members
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {group.expenses.length} expenses
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {groups.length > 5 && (
                <Link
                  to="/groups"
                  className="block text-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all groups
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent Settlements */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Settlements</h2>
            <Link
              to="/settlements"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>

          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No settlements</h3>
              <p className="mt-1 text-sm text-gray-500">
                Settlements will appear here when you have expenses to settle.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {settlements.slice(0, 5).map((settlement) => (
                <div
                  key={settlement._id}
                  className={`p-4 border rounded-lg ${
                    settlement.isPaid 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {settlement.from._id === user.id ? (
                          <>You owe <span className="font-semibold">{settlement.to.name}</span></>
                        ) : (
                          <><span className="font-semibold">{settlement.from.name}</span> owes you</>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {settlement.group.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        settlement.from._id === user.id 
                          ? 'text-danger-600' 
                          : 'text-success-600'
                      }`}>
                        ${settlement.amount.toFixed(2)}
                      </p>
                      {settlement.isPaid && (
                        <p className="text-xs text-gray-500">Paid</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
