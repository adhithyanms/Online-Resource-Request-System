import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { requestService } from '../../services/requestService';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import type { RequestWithDetails } from '../../types/database';

export const MyRequests = () => {
  const [requests, setRequests] = useState<RequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await requestService.getMyRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests =
    filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || '';
  };

  const filterButtons = [
    { value: 'all', label: 'All', count: requests.length },
    {
      value: 'pending',
      label: 'Pending',
      count: requests.filter((r) => r.status === 'pending').length,
    },
    {
      value: 'approved',
      label: 'Approved',
      count: requests.filter((r) => r.status === 'approved').length,
    },
    {
      value: 'rejected',
      label: 'Rejected',
      count: requests.filter((r) => r.status === 'rejected').length,
    },
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
            <p className="mt-2 text-gray-600">Track the status of your resource requests</p>
          </div>
          <Link
            to="/resources"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Request
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value as typeof filter)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === btn.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            ))}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No requests yet' : `No ${filter} requests`}
            </h3>
            <p className="text-gray-600 mb-4">Start by browsing available resources</p>
            <Link
              to="/resources"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start flex-1">
                    <div className="bg-blue-100 p-2 rounded-lg mr-4">
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.resource?.name || 'Unknown Resource'}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusBadge(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.resource?.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                        <span>
                          <strong>Quantity:</strong> {request.quantity_requested}
                        </span>
                        <span>
                          <strong>Category:</strong> {request.resource?.category}
                        </span>
                        <span>
                          <strong>Requested:</strong>{' '}
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Purpose:</h4>
                    <p className="text-sm text-gray-600">{request.purpose}</p>
                  </div>

                  {request.status === 'rejected' && request.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-900 mb-1">
                            Rejection Reason:
                          </h4>
                          <p className="text-sm text-red-700">{request.rejection_reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.reviewed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on {new Date(request.reviewed_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
