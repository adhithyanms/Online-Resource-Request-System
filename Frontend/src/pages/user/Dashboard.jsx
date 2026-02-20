import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { requestService } from '../../services/requestService';
import { resourceService } from '../../services/resourceService';
import { BarChart3, Package, FileText, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalResources: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [resources, requests] = await Promise.all([
        resourceService.getAllResources(),
        requestService.getMyRequests(),
      ]);

      setStats({
        totalResources: resources.length,
        totalRequests: requests.length,
        pendingRequests: requests.filter((r) => r.status === 'pending').length,
        approvedRequests: requests.filter((r) => r.status === 'approved').length,
      });

      setRecentRequests(requests.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || '';
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
      <div className="space-y-6 px-4 md:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600 font-medium">Welcome to your resource request dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Available Resources</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalResources}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRequests}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingRequests}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved Requests</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedRequests}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
            <Link to="/my-requests" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No requests yet. Start by browsing resources.</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request._id || request.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">
                      Request for {request.items?.length || 0} items
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      <p className="text-xs text-gray-500">
                        Site: <span className="font-semibold text-gray-700">{request.site?.siteName || 'Default'}</span>
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded border self-start sm:self-center ${getStatusBadge(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/resources"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-6 text-center transition-colors"
          >
            <Package className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Browse Resources</h3>
            <p className="text-sm mt-1 opacity-90">View available resources and make requests</p>
          </Link>

          <Link
            to="/my-requests"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-6 text-center transition-colors"
          >
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">My Requests</h3>
            <p className="text-sm mt-1 opacity-90">Track all your resource requests</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};
