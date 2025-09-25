import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, 
  Plus, 
  Calendar, 
  DollarSign,
  MoreVertical
} from 'lucide-react';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/api/groups');
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="mt-2 text-gray-600">
            Manage your expense groups and track shared expenses.
          </p>
        </div>
        <Link
          to="/groups/create"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Group</span>
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-24 w-24 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No groups yet</h3>
          <p className="mt-2 text-gray-500">
            Create your first group to start splitting expenses with friends.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const isAdmin = group.members.some(
              member => member.user._id === user.id && member.role === 'admin'
            );
            
            return (
              <div key={group._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users size={16} className="mr-2" />
                    <span>{group.members.length} members</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign size={16} className="mr-2" />
                    <span>{group.expenses.length} expenses</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2" />
                    <span>Created {formatDate(group.createdAt)}</span>
                  </div>
                </div>

                {/* Members preview */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Members:</p>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((member, index) => (
                      <div
                        key={member.user._id}
                        className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                        title={member.user.name}
                      >
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/groups/${group._id}`}
                    className="flex-1 btn-primary text-center"
                  >
                    View Group
                  </Link>
                  <Link
                    to={`/groups/${group._id}/expense`}
                    className="btn-secondary"
                  >
                    Add Expense
                  </Link>
                </div>

                {isAdmin && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-primary-600 font-medium">
                      You are an admin of this group
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Groups;
