import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { requestService } from '../../services/requestService';
import { resourceService } from '../../services/resourceService';
import { Package, FileText, Clock, CheckCircle, XCircle, Users, TrendingUp } from 'lucide-react';
import type { RequestWithDetails, Resource } from '../../types/database';

export const AdminDashboard = () => {
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [requestsData, resourcesData] = await Promise.all([
        requestService.getAllRequests(),
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
  const totalResources = resources.length;
  const outOfStockCount = resources.filter((r) => r.quantity_available === 0).length;

  const stats = [
    {
      label: 'Total Requests',
      value: requests.length,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/requests',
    },
    {
      label: 'Pending Requests',
      value: pendingCount,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/admin/requests',
    },
    {
      label: 'Total Resources',
      value: totalResources,
      icon: Package,
      color: 'bg-green-500',
      link: '/admin/resources',
    },
    {
      label: 'Out of Stock',
      value: outOfStockCount,
      icon: XCircle,
      color: 'bg-red-500',
      link: '/admin/resources',
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage resources and requests</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
              <Link to="/admin/requests" className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No requests yet</p>
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {request.resource?.name || 'Unknown'}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Requested by: {request.user?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Approved</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{approvedCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{pendingCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Rejected</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{rejectedCount}</span>
              </div>

              <Link
                to="/admin/requests"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Manage Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
