import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/Layout';
import { userService } from '../../services/userService';
import { Users, Mail, Shield, AlertCircle } from 'lucide-react';

export const ManageUsers = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.email?.toLowerCase() === 'adhithyanshanmugam@gmail.com';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantMessage, setGrantMessage] = useState({ type: '', text: '' });
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAdminByEmail = async (e) => {
    e.preventDefault();
    const email = grantEmail.trim();
    if (!email) {
      setGrantMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }
    setGrantLoading(true);
    setGrantMessage({ type: '', text: '' });
    try {
      await userService.updateRoleByEmail(email, 'admin');
      setGrantMessage({ type: 'success', text: `Admin access granted to ${email}` });
      setGrantEmail('');
      await loadUsers();
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Failed to update role';
      setGrantMessage({ type: 'error', text: msg });
    } finally {
      setGrantLoading(false);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    if (user.role === newRole) return;
    setUpdatingId(user._id);
    try {
      await userService.updateUserRole(user._id, newRole);
      await loadUsers();
    } catch (err) {
      alert(err?.message || err?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold mb-1">Access Restricted</h2>
                <p className="text-sm">Only admin <span className="font-medium">adhithyanshanmugam@gmail.com</span> can manage users.</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="mt-2 text-gray-600">Grant or revoke admin access by email</p>
        </div>

        {/* Grant admin by email */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Grant admin access by email
          </h2>
          <form onSubmit={handleGrantAdminByEmail} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={grantLoading}
            />
            <button
              type="submit"
              disabled={grantLoading}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {grantLoading ? (
                <span className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </span>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Grant Admin
                </>
              )}
            </button>
          </form>
          {grantMessage.text && (
            <div
              className={`mt-3 p-3 rounded-md flex items-start ${
                grantMessage.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
            >
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{grantMessage.text}</span>
            </div>
          )}
        </div>

        {/* Users list */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              All users
            </h2>
          </div>
          {users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {u.fullName || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            u.role === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {updatingId === u._id ? (
                          <span className="text-gray-500">Updating...</span>
                        ) : u.role === 'admin' ? (
                          <button
                            onClick={() => handleChangeRole(u, 'user')}
                            className="text-amber-600 hover:text-amber-800 font-medium"
                          >
                            Revoke admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChangeRole(u, 'admin')}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center inline-flex ml-auto"
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Make admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
