import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { resourceService } from '../../services/resourceService';
import { Package, FileText, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import type { RequestWithDetails, Resource } from '../../types/database';

export const UserDashboard = () => {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [requestsData, resourcesData] = await Promise.all([
        requestService.getMyRequests(),
        resourceService.getAllResources(),
      ]);
      setRequests(requestsData);
      setResources(resourcesData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const stats = [
    {
      label: 'Total Resources',
      value: resources.length,
      icon: Package,
      color: 'bg-blue-500',
      link: '/resources',
    },
    {
      label: 'Pending Requests',
      value: pendingCount,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/my-requests',
    },
    {
      label: 'Approved',
      value: approvedCount,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/my-requests',
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      icon: XCircle,
      color: 'bg-red-500',
      link: '/my-requests',
    },
  ];

  const recentRequests = requests.slice(0, 5);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || '';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.full_name}!</h1>
          <p className="mt-2 text-gray-600">Here's an overview of your resource requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
              <Link to="/my-requests" className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No requests yet</p>
                <Link
                  to="/resources"
                  className="mt-3 inline-block text-blue-600 hover:text-blue-700"
                >
                  Browse Resources
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {request.resource?.name || 'Unknown Resource'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {request.quantity_requested}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                          request.status
                        )}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <Link
                to="/resources"
                className="block p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  <Package className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Browse Resources</h3>
                    <p className="text-sm text-gray-600">
                      View all available resources for request
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to="/my-requests"
                className="block p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center">
                  <FileText className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">My Requests</h3>
                    <p className="text-sm text-gray-600">Track your resource request status</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
