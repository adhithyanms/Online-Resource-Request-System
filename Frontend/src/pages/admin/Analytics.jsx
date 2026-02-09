import { useState, useEffect } from "react";
import { Layout } from "../../components/Layout";
import { resourceService } from "../../services/resourceService";
import { requestService } from "../../services/requestService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [requestStats, setRequestStats] = useState([]);
  const [resourceStats, setResourceStats] = useState([]);
  const [topRequestedStats, setTopRequestedStats] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resources, requests] = await Promise.all([
        resourceService.getAllResources(),
        requestService.getAllRequests(),
      ]);

      // Process Request Status Data
      const statusCounts = requests.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      const requestData = Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
      setRequestStats(requestData);

      // Process Resource Category Data
      const categoryCounts = resources.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {});

      const resourceData = Object.entries(categoryCounts).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
      setResourceStats(resourceData);

      // Process Top Requested Resources
      // We need to map resource_id to resource name first
      const resourceMap = resources.reduce((acc, curr) => {
        acc[curr.id] = curr.name; // Assuming 'id' is the key. MongoDB usually uses '_id'.
        // Let's check the data structure from previous Read calls or just use both just in case.
        if (curr._id) acc[curr._id] = curr.name;
        return acc;
      }, {});

      const requestCounts = requests.reduce((acc, curr) => {
        const resourceName =
          resourceMap[curr.resource_id] || "Unknown Resource";
        acc[resourceName] = (acc[resourceName] || 0) + 1;
        return acc;
      }, {});

      const topRequestedData = Object.entries(requestCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5

      setTopRequestedStats(topRequestedData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_COLORS = {
    Pending: "#EAB308", // yellow-500
    Approved: "#22C55E", // green-500
    Rejected: "#EF4444", // red-500
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-gray-600">Resource and Request Analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Request Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Request Status Distribution
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={requestStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {requestStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.name] ||
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Category Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resources by Category
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {resourceStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Requested Resources */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top 5 Requested Resources
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topRequestedStats}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {topRequestedStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
