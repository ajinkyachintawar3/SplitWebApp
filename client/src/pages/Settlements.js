import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Users,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const Settlements = () => {
  const { user } = useAuth();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, paid

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      const response = await api.get(`/api/settlements/user/${user.id}`);
      setSettlements(response.data);
    } catch (error) {
      console.error('Error fetching settlements:', error);
      toast.error('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (settlementId) => {
    try {
      await api.put(`/api/settlements/${settlementId}/pay`);
      toast.success('Settlement marked as paid!');
      fetchSettlements(); // Refresh the list
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark as paid';
      toast.error(message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const filteredSettlements = settlements.filter(settlement => {
    if (filter === 'pending') return !settlement.isPaid;
    if (filter === 'paid') return settlement.isPaid;
    return true;
  });

  const totalOwed = settlements
    .filter(s => s.from._id === user.id && !s.isPaid)
    .reduce((total, settlement) => total + settlement.amount, 0);

  const totalOwedToMe = settlements
    .filter(s => s.to._id === user.id && !s.isPaid)
    .reduce((total, settlement) => total + settlement.amount, 0);

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
        <h1 className="text-3xl font-bold text-gray-900">Settlements</h1>
        <p className="mt-2 text-gray-600">
          Track and manage your expense settlements across all groups.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">You Owe</p>
              <p className="text-2xl font-bold text-danger-600">
                {formatCurrency(totalOwed)}
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
                {formatCurrency(totalOwedToMe)}
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
              <p className="text-sm font-medium text-gray-600">Total Settlements</p>
              <p className="text-2xl font-bold text-gray-900">
                {settlements.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-500" />
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'paid'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Paid
            </button>
          </div>
        </div>
      </div>

      {/* Settlements List */}
      {filteredSettlements.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-24 w-24 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {filter === 'all' ? 'No settlements yet' : 
             filter === 'pending' ? 'No pending settlements' : 
             'No paid settlements'}
          </h3>
          <p className="mt-2 text-gray-500">
            {filter === 'all' ? 'Settlements will appear here when you have expenses to settle.' :
             filter === 'pending' ? 'All your settlements are up to date!' :
             'No settlements have been marked as paid yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSettlements.map((settlement) => {
            const isOwed = settlement.to._id === user.id;
            const isOwing = settlement.from._id === user.id;
            
            return (
              <div
                key={settlement._id}
                className={`card ${
                  settlement.isPaid ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      settlement.isPaid 
                        ? 'bg-gray-200' 
                        : isOwed 
                          ? 'bg-success-100' 
                          : 'bg-danger-100'
                    }`}>
                      {settlement.isPaid ? (
                        <CheckCircle className="h-6 w-6 text-gray-500" />
                      ) : isOwed ? (
                        <TrendingUp className="h-6 w-6 text-success-600" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-danger-600" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {isOwed ? (
                          <><span className="font-semibold">{settlement.from.name}</span> owes you</>
                        ) : (
                          <>You owe <span className="font-semibold">{settlement.to.name}</span></>
                        )}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          <span>{settlement.group.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>{formatDate(settlement.createdAt)}</span>
                        </div>
                      </div>
                      {settlement.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          {settlement.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        settlement.isPaid 
                          ? 'text-gray-500' 
                          : isOwed 
                            ? 'text-success-600' 
                            : 'text-danger-600'
                      }`}>
                        {formatCurrency(settlement.amount, settlement.currency)}
                      </p>
                      {settlement.isPaid ? (
                        <p className="text-sm text-gray-500">
                          Paid on {formatDate(settlement.paidAt)}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">Pending</p>
                      )}
                    </div>

                    {!settlement.isPaid && (
                      <button
                        onClick={() => handleMarkAsPaid(settlement._id)}
                        className="btn-primary"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Settlements;
