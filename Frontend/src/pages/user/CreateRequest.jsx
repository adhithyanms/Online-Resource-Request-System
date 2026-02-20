import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { resourceService } from '../../services/resourceService';
import { requestService } from '../../services/requestService';
import { siteService } from '../../services/siteService';
import { Send, AlertCircle, Loader, Building2, Plus, Trash2, Package } from 'lucide-react';

export const CreateRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialResourceId = location.state?.resourceId || '';

  const [resources, setResources] = useState([]);
  const [mySites, setMySites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Selection states
  const [selectedResourceId, setSelectedResourceId] = useState(initialResourceId);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [purpose, setPurpose] = useState('');

  // Cart state
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resourcesData, sitesData] = await Promise.all([
        resourceService.getAllResources(),
        siteService.getMySites()
      ]);
      setResources(resourcesData);
      setMySites(sitesData);

      if (sitesData.length === 1) {
        setSelectedSiteId(sitesData[0]._id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load resources or sites');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedResourceId || !quantity || parseInt(quantity) <= 0) return;

    const resource = resources.find(r => r.id === selectedResourceId);
    if (!resource) return;

    // Check if already in cart
    if (cart.find(item => item.resourceId === selectedResourceId)) {
      setError('Resource already added to the list');
      return;
    }

    // Check stock logic removed

    setCart([...cart, {
      resourceId: selectedResourceId,
      name: resource.name,
      quantity: parseInt(quantity)
    }]);

    // Reset selection
    setSelectedResourceId('');
    setQuantity('1');
    setError('');
  };

  const handleRemoveFromCart = (resourceId) => {
    setCart(cart.filter(item => item.resourceId !== resourceId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0 || !selectedSiteId || !purpose) {
      setError('Please add at least one resource and fill in all fields');
      return;
    }

    setSubmitting(true);

    try {
      const items = cart.map(item => ({
        resourceId: item.resourceId,
        quantity: item.quantity
      }));

      await requestService.createRequest(items, selectedSiteId, purpose);
      navigate('/my-requests', { state: { successMessage: 'Request created successfully!' } });
    } catch (error) {
      console.error('Error creating request:', error);
      setError('Failed to create request. Please try again.');
      setSubmitting(false);
    }
  };

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

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
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Request</h1>
          <p className="mt-2 text-gray-600 font-medium text-sm">Select one or more resources for your site</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700 font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              <div>
                <label htmlFor="site" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Select Site *
                </label>
                {mySites.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2 text-sm text-yellow-700 font-medium">
                    <Building2 className="h-4 w-4" />
                    No sites assigned to you.
                  </div>
                ) : (
                  <select
                    id="site"
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    disabled={submitting}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    required
                  >
                    <option value="">Choose a site...</option>
                    {mySites.map((site) => (
                      <option key={site._id} value={site._id}>
                        {site.siteName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
                  Add Resources
                </label>

                <div className="space-y-4">
                  <select
                    id="resource"
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    disabled={submitting || mySites.length === 0}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  >
                    <option value="">Choose a resource...</option>
                    {resources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Qty"
                        disabled={submitting || !selectedResourceId}
                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!selectedResourceId || submitting}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-bold text-sm shadow-sm"
                    >
                      Add to List
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label htmlFor="purpose" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Purpose of Request *
                </label>
                <textarea
                  id="purpose"
                  rows={4}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  disabled={submitting}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Explain why you need these resources..."
                  required
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0 || !selectedSiteId}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-bold shadow-md shadow-blue-100"
              >
                {submitting ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cart View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Request List
                <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              </h2>

              {cart.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                  <Package className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-medium">No items added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.resourceId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 font-medium">Quantity: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.resourceId)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
