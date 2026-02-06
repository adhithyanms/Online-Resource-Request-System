import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { resourceService } from '../../services/resourceService';
import { requestService } from '../../services/requestService';
import { Send, AlertCircle, Loader } from 'lucide-react';

export const CreateRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialResourceId = location.state?.resourceId || '';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState(initialResourceId);
  const [quantity, setQuantity] = useState('1');
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data.filter((r) => r.quantity_available > 0));
    } catch (error) {
      console.error('Error loading resources:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedResourceId || !purpose || !quantity) {
      setError('Please fill in all fields');
      return;
    }

    if (parseInt(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    setSubmitting(true);

    try {
      await requestService.createRequest(selectedResourceId, parseInt(quantity), purpose);
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Request</h1>
          <p className="mt-2 text-gray-600">Request a resource for your needs</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="resource" className="block text-sm font-medium text-gray-700 mb-2">
                Select Resource *
              </label>
              <select
                id="resource"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                disabled={submitting}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a resource...</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} (Available: {resource.quantity_available})
                  </option>
                ))}
              </select>
            </div>

            {selectedResource && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-2">{selectedResource.name}</h3>
                <p className="text-sm text-blue-800 mb-2">{selectedResource.description}</p>
                <div className="flex justify-between text-sm text-blue-700">
                  <span>Category: {selectedResource.category}</span>
                  <span>Available: {selectedResource.quantity_available}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Requested *
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={selectedResource?.quantity_available || 999}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={submitting || !selectedResourceId}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Request *
              </label>
              <textarea
                id="purpose"
                rows={5}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                disabled={submitting}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Explain why you need this resource..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !selectedResourceId}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Request
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/resources')}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};
