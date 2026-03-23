import { useState, useEffect, useMemo } from "react";
import { Layout } from "../../components/Layout";
import { analyticsService } from "../../services/analyticsService";
import { siteService } from "../../services/siteService";
import { userService } from "../../services/userService";
import { resourceService } from "../../services/resourceService";
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
  AreaChart,
  Area,
} from "recharts";
import {
  Filter, X, BarChart2, PieChart as PieChartIcon,
  TrendingUp, Activity, CheckCircle2, AlertCircle,
  Package, Users as UsersIcon, Calendar, Clock
} from "lucide-react";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const STATUS_COLORS = { approved: "#22C55E", pending: "#EAB308", rejected: "#EF4444" };

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md group">
    <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform`}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>
    </div>
  </div>
);

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);

  const [filters, setFilters] = useState({
    siteId: "", userId: "", resourceId: "", startDate: "", endDate: ""
  });

  const [metricType, setMetricType] = useState('count'); // 'count' or 'quantity'

  useEffect(() => {
    const loadBasics = async () => {
      try {
        const [s, u, r] = await Promise.all([
          siteService.getAllSites(),
          userService.getAllUsers(),
          resourceService.getAllResources()
        ]);
        setSites(s);
        setUsers(u);
        setResources(r);
      } catch (err) { console.error(err); }
    };
    loadBasics();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summary, trendData] = await Promise.all([
          analyticsService.getSummary(filters),
          analyticsService.getTrends({ days: 30 })
        ]);
        setData(summary);
        setTrends(trendData);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading && !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Performance</h1>
            <p className="text-gray-500 font-medium mt-1">Real-time resource utilization & request metrics</p>
          </div>
          <div className="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner self-start">
            <button
              onClick={() => setMetricType('count')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${metricType === 'count' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Request Count
            </button>
            <button
              onClick={() => setMetricType('quantity')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${metricType === 'quantity' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Total Volume
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Advanced Segmentation</span>
            </div>
            {(filters.siteId || filters.userId || filters.resourceId || filters.startDate || filters.endDate) && (
              <button onClick={() => setFilters({ siteId: "", userId: "", resourceId: "", startDate: "", endDate: "" })}
                className="sm:ml-auto text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 px-2 py-1 bg-blue-50/50 rounded-lg transition-all border border-blue-100/50">
                <X className="h-3 w-3" /> Clear All Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { label: 'Site', name: 'siteId', options: sites, valKey: '_id', labelKey: 'siteName' },
              { label: 'Requester', name: 'userId', options: users, valKey: '_id', labelKey: 'fullName', fallbackKey: 'email' },
              { label: 'Resource', name: 'resourceId', options: resources, valKey: '_id', labelKey: 'name' }
            ].map(f => (
              <div key={f.name}>
                <p className="text-[10px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-tighter">{f.label}</p>
                <select name={f.name} value={filters[f.name]} onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none transition-all text-gray-700">
                  <option value="">All {f.label}s</option>
                  {f.options.map(opt => <option key={opt[f.valKey]} value={opt[f.valKey]}>{opt[f.labelKey] || opt[f.fallbackKey]}</option>)}
                </select>
              </div>
            ))}
            <div>
              <p className="text-[10px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-tighter">FROM</p>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none transition-all text-gray-700" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 mb-1.5 ml-1 uppercase tracking-tighter">TO</p>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[12px] font-bold focus:ring-2 focus:ring-blue-500 bg-gray-50/50 outline-none transition-all text-gray-700" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trends Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Request Velocity</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Daily request volume trends across the system</p>
              </div>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EAB308" stopOpacity={0.1} /><stop offset="95%" stopColor="#EAB308" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }} />
                  <Area type="monotone" dataKey="approved" stroke="#22C55E" fillOpacity={1} fill="url(#colorApproved)" fillRule="nonzero" strokeWidth={3} />
                  <Area type="monotone" dataKey="pending" stroke="#EAB308" fillOpacity={1} fill="url(#colorPending)" fillRule="nonzero" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Breakdown (Pie) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Health Check</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Request approval distribution</p>
              </div>
              <PieChartIcon className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.statusStats} cx="50%" cy="50%" innerRadius={window.innerWidth < 640 ? 50 : 60} outerRadius={window.innerWidth < 640 ? 75 : 90} paddingAngle={8} dataKey="value">
                    {data?.statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} cornerRadius={10} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Resources (Horizontal Bar) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Demand Ranking</h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Most utilized resource items</p>
              </div>
              <Package className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-h-[250px] sm:min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.resourceStats} layout="vertical" margin={{ left: window.innerWidth < 640 ? -10 : 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={window.innerWidth < 640 ? 60 : 80} tick={{ fontSize: 9, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }} />
                  <Bar dataKey={metricType === 'count' ? 'requestCount' : 'totalQuantity'} fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={window.innerWidth < 640 ? 12 : 16}>
                    {data?.resourceStats.map((entry, index) => (
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



