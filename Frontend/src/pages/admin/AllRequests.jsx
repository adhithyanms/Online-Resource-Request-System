import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { requestService } from '../../services/requestService';
import { resourceService } from '../../services/resourceService';
import { siteService } from '../../services/siteService';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Search, X, Package, Calendar, Edit2, Plus, Trash2, Mail, Filter, Users as UsersIcon, MapPin } from 'lucide-react';

export const AllRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [allResources, setAllResources] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [editFormData, setEditFormData] = useState({
    items: [],
    siteId: ''
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadRequests();
    loadResourcesAndSites();
  }, []);

  const loadResourcesAndSites = async () => {
    try {
      const [resources, sites] = await Promise.all([
        resourceService.getAllResources(),
        siteService.getAllSites()
      ]);
      setAllResources(resources);
      setAllSites(sites);
    } catch (error) {
      console.error('Error loading resources/sites:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await requestService.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    if (!confirm(`Approve this request with ${request.items?.length || 0} items?`)) return;

    setProcessing(true);
    try {
      const requestId = request.id || request._id;
      await requestService.updateRequestStatus(requestId, 'approved');
      await loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error.message || 'Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditClick = (request) => {
    setEditingRequest(request);
    setEditFormData({
      items: (request.items || []).map(item => ({
        resourceId: item.resourceId?._id || item.resourceId,
        quantity: item.quantity
      })),
      siteId: request.site?._id || request.siteId?._id || request.siteId
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (editFormData.items.length === 0) {
      alert('Request must have at least one item');
      return;
    }
    if (!editFormData.siteId) {
      alert('Please select a site');
      return;
    }

    const hasInvalidItems = editFormData.items.some(item => !item.resourceId || item.quantity <= 0);
    if (hasInvalidItems) {
      alert('All items must have a resource selected and a quantity greater than 0');
      return;
    }

    setProcessing(true);
    try {
      const requestId = editingRequest.id || editingRequest._id;
      await requestService.updateRequest(requestId, editFormData);
      await loadRequests();
      setShowEditModal(false);
      setEditingRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      alert(error.message || 'Failed to update request');
    } finally {
      setProcessing(false);
    }
  };

  const addEditItem = () => {
    setEditFormData({
      ...editFormData,
      items: [...editFormData.items, { resourceId: '', quantity: 1 }]
    });
  };

  const removeEditItem = (index) => {
    const newItems = [...editFormData.items];
    newItems.splice(index, 1);
    setEditFormData({ ...editFormData, items: newItems });
  };

  const updateEditItem = (index, field, value) => {
    const newItems = [...editFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditFormData({ ...editFormData, items: newItems });
  };

  const handleShareGmail = (request) => {
    const shopEmail = import.meta.env.VITE_SHOP_EMAIL || '';

    const itemsList = request.items?.map(item => `- ${item.resourceId?.name || 'Unknown'}: ${item.quantity}`).join('\n') || 'No items';

    const subject = encodeURIComponent(`Resource Request - ${request.site?.siteName || 'Request'}`);
    const body = encodeURIComponent(
      `Hello,\n\nI would like to share the following resource request details:\n\n` +
      `Items Requested:\n${itemsList}\n\n` +
      `Tentative Time: \n` +
      `Contact Number: \n\n` +
      `Thank you.`
    );

    // Use mailto: for mobile devices, and mail.google.com for desktop
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.location.href = `mailto:${shopEmail}?subject=${subject}&body=${body}`;
    } else {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${shopEmail}&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');
    }
  };

  const handleRejectClick = (request) => {

    setSelectedRequest(request);
    setRejectionReason('');
    setShowModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const requestId = selectedRequest.id || selectedRequest._id;
      await requestService.updateRequestStatus(
        requestId,
        'rejected',
        rejectionReason
      );
      await loadRequests();
      setShowModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.message || 'Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      request.items?.some(item => item.resourceId?.name.toLowerCase().includes(searchLow)) ||
      request.user?.fullName.toLowerCase().includes(searchLow) ||
      request.site?.siteName.toLowerCase().includes(searchLow);

    const requestDate = new Date(request.createdAt);
    const matchesStartDate = !startDate || requestDate >= new Date(startDate);
    const matchesEndDate = !endDate || requestDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999));

    return matchesFilter && matchesSearch && matchesStartDate && matchesEndDate;
  });

  const totalFilteredCost = filteredRequests.reduce((sum, req) => sum + (req.totalCost || 0), 0);

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
      <div className="space-y-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Requests</h1>
          <p className="mt-1 text-sm text-gray-600 font-medium">Review and manage resource requests</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filters & Search
            </h2>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200"
            >
              {showMobileFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          <div className={`${showMobileFilters ? 'flex' : 'hidden'} sm:flex flex-col gap-6`}>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by resource, user, or site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <label className="block sm:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Start Date</label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none sm:top-0 top-5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div className="relative flex-1">
                  <label className="block sm:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">End Date</label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none sm:top-0 top-5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-transparent hover:border-red-100"
                  >
                    <X className="h-4 w-4" /> Clear
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {filterButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setFilter(btn.value)}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border ${filter === btn.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 active:bg-gray-100'
                      }`}
                  >
                    {btn.label} <span className="ml-1 opacity-60">({btn.count})</span>
                  </button>
                ))}
              </div>
              <div className="bg-blue-600 px-6 py-3 rounded-2xl shadow-lg shadow-blue-100 w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest leading-none">Total Filtered Cost</p>
                <p className="text-xl font-black text-white leading-none">₹{totalFilteredCost.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
            <div className="bg-gray-50 p-4 rounded-full w-fit mx-auto mb-4 border border-gray-100">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 shadow-sm flex items-center justify-center">
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                             Request: {request.items?.length || 0} Items
                          </h3>
                          <span
                            className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${getStatusBadge(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter mt-0.5">
                          ID: {request._id || request.id}
                        </p>
                      </div>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      {request.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50 group hover:bg-blue-600 transition-all duration-300">
                          <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-blue-500 transition-colors">
                            <Package className="h-3.5 w-3.5 text-blue-600 group-hover:text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-gray-800 group-hover:text-white truncate transition-colors">{item.resourceId?.name || 'Unknown'}</p>
                            <p className="text-[10px] font-black text-blue-500 group-hover:text-blue-100 uppercase tracking-widest leading-none mt-0.5 transition-colors">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
 
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 mb-6">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Request Details</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <p className="text-[12px] text-gray-700 flex items-center gap-2">
                            <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
                            <span className="font-bold">{request.user?.fullName || 'Anonymous'}</span>
                          </p>
                          <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></div>
                          <p className="text-[12px] text-gray-700 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span className="font-bold">{request.site?.siteName || 'Global Site'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right flex-shrink-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Valuation</p>
                        <p className="text-xl font-black text-blue-600">₹{request.totalCost || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Mission Purpose</p>
                    <p className="text-sm text-gray-700 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">{request.purpose || 'None provided'}</p>
                  </div>

                  {request.status === 'rejected' && request.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">
                            Rejection Reason
                          </h4>
                          <p className="text-sm font-bold text-red-700">{request.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                    {request.status === 'pending' && (
                      <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-green-100/50 active:scale-95 text-xs uppercase tracking-wider"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(request)}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-red-100/50 active:scale-95 text-xs uppercase tracking-wider"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleEditClick(request)}
                          disabled={processing}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-100/50 active:scale-95 text-xs uppercase tracking-wider"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleShareGmail(request)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-black text-blue-600 bg-white hover:bg-blue-50 rounded-xl border-2 border-blue-50 hover:border-blue-100 transition-all uppercase tracking-widest active:scale-95 whitespace-nowrap ml-auto"
                    >
                      <Mail className="h-4 w-4" />
                      Dispatch to Shop
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <Edit2 className="h-6 w-6 text-blue-600" />
                Edit Request
              </h3>
              <p className="text-sm text-gray-500 font-medium mt-1">
                Modify request details for <span className="text-blue-600 font-bold">{editingRequest?.user?.fullName}</span>
              </p>
            </div>

            <div className="space-y-6">
              {/* Site Selection */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Site</label>
                <select
                  value={editFormData.siteId}
                  onChange={(e) => setEditFormData({ ...editFormData, siteId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                >
                  <option value="">Select a site</option>
                  {allSites.map(site => (
                    <option key={site._id} value={site._id}>{site.siteName}</option>
                  ))}
                </select>
              </div>

              {/* Items Management */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Requested Items</label>
                  <button
                    onClick={addEditItem}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </button>
                </div>
                <div className="space-y-4 max-h-60 overflow-y-auto p-1">
                  {editFormData.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-blue-50/30 p-3 sm:p-4 rounded-xl border border-blue-100/50 relative group">
                      <div className="flex-1 w-full">
                        <label className="block sm:hidden text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Resource</label>
                        <select
                          value={item.resourceId}
                          onChange={(e) => updateEditItem(index, 'resourceId', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        >
                          <option value="">Select Resource</option>
                          {allResources.map(res => (
                            <option key={res._id} value={res._id}>{res.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full sm:w-24">
                        <label className="block sm:hidden text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateEditItem(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center sm:text-left"
                          placeholder="Qty"
                        />
                      </div>
                      <button
                        onClick={() => removeEditItem(index)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors sm:mt-0 absolute top-2 right-2 sm:relative sm:top-0 sm:right-0"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {editFormData.items.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-sm text-gray-400 font-medium">No items added yet</p>
                    </div>
                  )}
                </div>
              </div>


              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={processing}
                  className="w-full sm:px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2.5">
                <XCircle className="h-6 w-6 text-red-600" />
                Reject Request
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-red-50/50 rounded-2xl border border-red-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                 Are you sure you want to reject the request from <span className="font-black text-red-700">{selectedRequest?.user?.fullName}</span>?
              </p>
            </div>

            <div className="mb-8">
              <label htmlFor="rejectionReason" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Formal Rejection Reason
              </label>
              <textarea
                id="rejectionReason"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white transition-all font-bold text-sm"
                placeholder="Explain the reason for this decision..."
                disabled={processing}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={processing || !rejectionReason.trim()}
                className="flex-[2] px-6 py-3.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 disabled:opacity-50 shadow-lg shadow-red-100 transition-all uppercase tracking-widest text-xs"
              >
                {processing ? 'Processing...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={processing}
                className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
