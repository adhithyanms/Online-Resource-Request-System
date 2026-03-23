import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { requestService } from '../../services/requestService';
import { resourceService } from '../../services/resourceService';
import { siteService } from '../../services/siteService';
import { analyticsService } from '../../services/analyticsService';
import { BarChart3, Package, FileText, TrendingUp, AlertCircle, MapPin } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalResources: 0,
    totalRequests: 0,
    totalSites: 0,
    pendingRequests: 0,
    dailyCost: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [resources, requests, sites, todayAnalytics] = await Promise.all([
        resourceService.getAllResources(),
        requestService.getAllRequests(),
        siteService.getAllSites(),
        analyticsService.getSummary({
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }),
      ]);

      setStats({
        totalResources: resources.length,
        totalRequests: requests.length,
        totalSites: sites.length,
        pendingRequests: requests.filter((r) => r.status === 'pending').length,
        dailyCost: todayAnalytics.summary.totalApprovedCost || 0,
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">System overview and management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
          {[
            { label: 'Resources', value: stats.totalResources, icon: Package, color: 'blue', to: '/admin/resources' },
            { label: 'Sites', value: stats.totalSites, icon: MapPin, color: 'red', to: '/admin/sites' },
            { label: 'Requests', value: stats.totalRequests, icon: FileText, color: 'purple', to: '/admin/requests' },
            { label: 'Pending', value: stats.pendingRequests, icon: AlertCircle, color: 'yellow', to: '/admin/requests' },
            { label: 'Daily Cost', value: `₹${stats.dailyCost.toLocaleString()}`, icon: TrendingUp, color: 'blue', to: '/admin/analytics' },
          ].map((item, idx) => (
            <Link key={idx} to={item.to} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest truncate">{item.label}</p>
                  <p className={`text-xl sm:text-2xl font-bold mt-1 text-${item.color}-600`}>{item.value}</p>
                </div>
                <div className={`bg-${item.color}-50 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                  <item.icon className={`h-5 w-5 text-${item.color}-600`} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests - 2 Columns on Desktop */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/30">
                <h2 className="text-lg font-bold text-gray-900">Recent Requests</h2>
                <Link to="/admin/requests" className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase tracking-wider">
                  View All Activity
                </Link>
              </div>

              {recentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-medium">No recent activity detected.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentRequests.map((request) => (
                    <div
                      key={request._id || request.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-gray-50/50 transition-colors group gap-3 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors truncate">{request.resource?.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            By <span className="font-semibold text-gray-700">{request.user?.fullName}</span>
                          </p>
                          <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></div>
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            Site: <span className="font-semibold text-gray-700">{request.site?.siteName || 'N/A'}</span>
                          </p>
                          <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></div>
                          <p className="text-[11px] sm:text-xs text-gray-500">
                            Qty: <span className="font-semibold text-gray-700">{request.quantity_requested}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 text-[9px] font-bold rounded-full border shadow-sm uppercase tracking-wider ${getStatusBadge(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - 1 Column on Desktop */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">Quick Management</h2>
              <div className="space-y-3">
                {[
                  { to: "/admin/requests", icon: FileText, label: "All Requests", sub: "Review system activity", color: "blue" },
                  { to: "/admin/resources", icon: Package, label: "Manage Resources", sub: "Inventory & stock", color: "green" },
                  { to: "/admin/analytics", icon: BarChart3, label: "Analytics", sub: "Performance reports", color: "purple" }
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    to={action.to}
                    className={`flex items-center p-4 rounded-xl border border-gray-100 hover:border-${action.color}-200 hover:bg-${action.color}-50/50 transition-all group`}
                  >
                    <div className={`bg-${action.color}-50 p-2.5 rounded-lg mr-4 group-hover:bg-white transition-colors`}>
                      <action.icon className={`h-5 w-5 text-${action.color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-none">{action.label}</p>
                      <p className="text-[11px] text-gray-500 mt-1">{action.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
