import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { requestService } from '../../services/requestService';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus, Package } from 'lucide-react';

export const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredRequests = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const getStatusIcon = (status) => {
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status] || '';
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
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
            <p className="mt-1 text-gray-600 font-medium">Track the status of your resource requests</p>
          </div>
          <Link
            to="/resources"
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm shadow-sm"
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
                onClick={() => setFilter(btn.value)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${filter === btn.value
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
              <div key={request._id || request.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl self-start ${getStatusBadge(request.status)}`}>
                    {getStatusIcon(request.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        Request for {request.items?.length || 0} items
                      </h3>
                      <span
                        className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-widest w-fit ${getStatusBadge(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {request.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                          <Package className="h-3.5 w-3.5 text-blue-500" />
                          <span className="font-bold">{item.resourceId?.name || 'Unknown resource'}</span>
                          <span className="text-gray-400 font-medium">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <strong className="text-gray-400 font-bold uppercase tracking-wider text-[10px] w-16">Site</strong>
                        <span className="truncate">{request.site?.siteName || 'Unknown Site'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <strong className="text-gray-400 font-bold uppercase tracking-wider text-[10px] w-16">Items</strong>
                        <span>{request.items?.length || 0} types</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <strong className="text-gray-400 font-bold uppercase tracking-wider text-[10px] w-16">Date</strong>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Purpose:</h4>
                    <p className="text-sm text-gray-600">{request.purpose}</p>
                  </div>

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-900 mb-1">
                            Rejection Reason:
                          </h4>
                          <p className="text-sm text-red-700">{request.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {request.reviewed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on {new Date(request.reviewedAt).toLocaleString()}
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
