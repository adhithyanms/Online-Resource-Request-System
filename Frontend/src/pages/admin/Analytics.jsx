import { useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { resourceService } from "../../services/resourceService";
import { requestService } from "../../services/requestService";
import { siteService } from "../../services/siteService";
import { userService } from "../../services/userService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Filter, X, BarChart2, PieChart as PieChartIcon } from "lucide-react";

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [allRequests, setAllRequests] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter States
  const [filters, setFilters] = useState({
    siteId: "",
    userId: "",
    resourceId: "",
    startDate: "",
    endDate: "",
  });

  // Metric Toggle: 'count' or 'quantity'
  const [metricType, setMetricType] = useState('count');

  // Processed Stats
  const [requestStats, setRequestStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topRequestedStats, setTopRequestedStats] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [resources, requests, sitesData, usersData] = await Promise.all([
        resourceService.getAllResources(),
        requestService.getAllRequests(),
        siteService.getAllSites(),
        userService.getAllUsers(),
      ]);

      setAllResources(resources);
      setAllRequests(requests);
      setSites(sitesData);
      setUsers(usersData);

      processStats(requests, resources, metricType);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (requests, resources, metric) => {
    // 1. Process Request Status Data (Always count-based for status distribution)
    const statusCounts = requests.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    const requestData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
    setRequestStats(requestData);

    // 2. Process Resource Category Data (Sensitive to filters AND metric)
    const categoryCounts = requests.reduce((acc, curr) => {
      const category = curr.resource?.category || "Other";
      const val = metric === 'count' ? 1 : (curr.quantity_requested || 0);
      acc[category] = (acc[category] || 0) + val;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    setCategoryStats(categoryData);

    // 3. Process Top Requested Resources (Sensitive to filters AND metric)
    const resourceMap = resources.reduce((acc, curr) => {
      const id = curr._id || curr.id;
      acc[id] = curr.name;
      return acc;
    }, {});

    const requestCounts = requests.reduce((acc, curr) => {
      const rId = curr.resource?._id || curr.resourceId;
      const resourceName = resourceMap[rId] || "Unknown Resource";
      const val = metric === 'count' ? 1 : (curr.quantity_requested || 0);
      acc[resourceName] = (acc[resourceName] || 0) + val;
      return acc;
    }, {});

    const topRequestedData = Object.entries(requestCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    setTopRequestedStats(topRequestedData);
  };

  // Apply filters whenever filters or metric changes
  useEffect(() => {
    if (loading) return;

    let filteredRequests = [...allRequests];

    if (filters.siteId) {
      filteredRequests = filteredRequests.filter(
        (r) => (r.site?._id || r.siteId) === filters.siteId
      );
    }

    if (filters.userId) {
      filteredRequests = filteredRequests.filter(
        (r) => (r.user?._id || r.userId) === filters.userId
      );
    }

    if (filters.resourceId) {
      filteredRequests = filteredRequests.filter(
        (r) => (r.resource?._id || r.resourceId) === filters.resourceId
      );
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filteredRequests = filteredRequests.filter(
        (r) => new Date(r.createdAt) >= start
      );
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filteredRequests = filteredRequests.filter(
        (r) => new Date(r.createdAt) <= end
      );
    }

    processStats(filteredRequests, allResources, metricType);
  }, [filters, metricType, allRequests, allResources, loading]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      siteId: "",
      userId: "",
      resourceId: "",
      startDate: "",
      endDate: "",
    });
  };

  const STATUS_COLORS = {
    Pending: "#EAB308",
    Approved: "#22C55E",
    Rejected: "#EF4444",
  };

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

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
      <div className="space-y-6 px-4 md:px-0 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-gray-600 font-medium">System-wide resource usage insights</p>
          </div>
          {/* Metric Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner self-start sm:self-center">
            <button
              onClick={() => setMetricType('count')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${metricType === 'count' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Request Count
            </button>
            <button
              onClick={() => setMetricType('quantity')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${metricType === 'quantity' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Total Quantity
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold">
            <Filter className="h-4 w-4" />
            <span className="text-sm uppercase tracking-wider">Advanced Filters</span>
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Site</label>
              <select
                name="siteId"
                value={filters.siteId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              >
                <option value="">All Sites</option>
                {sites.map((s) => (
                  <option key={s._id} value={s._id}>{s.siteName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">User</label>
              <select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.fullName || u.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Resource</label>
              <select
                name="resourceId"
                value={filters.resourceId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              >
                <option value="">All Resources</option>
                {allResources.map((res) => (
                  <option key={res._id || res.id} value={res._id || res.id}>{res.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">From</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">To</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Requests by Category</h2>
              <BarChart2 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryStats} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    trigger="hover"
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Status Distribution</h2>
              <PieChartIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {requestStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 Resources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Top 5 Requested Resources</h2>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Sorted by {metricType === 'count' ? 'Request Count' : 'Total Quantity'}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topRequestedStats} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    trigger="hover"
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {topRequestedStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};


