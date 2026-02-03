import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { resourceService } from '../../services/resourceService';
import { requestService } from '../../services/requestService';
import { Package, AlertCircle, CheckCircle, Send } from 'lucide-react';
import type { Resource } from '../../types/database';

export const CreateRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedResourceId = location.state?.resourceId;

  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState(preselectedResourceId || '');
  const [quantityRequested, setQuantityRequested] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      const availableResources = data.filter((r) => r.quantity_available > 0);
      setResources(availableResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedResourceId) {
      setError('Please select a resource');
      return;
    }

    if (quantityRequested < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (!selectedResource) {
      setError('Selected resource not found');
      return;
    }

    if (quantityRequested > selectedResource.quantity_available) {
      setError(`Only ${selectedResource.quantity_available} units available`);
      return;
    }

    if (!purpose.trim()) {
      setError('Please provide a purpose for this request');
      return;
    }

    setSubmitting(true);

    try {
      await requestService.createRequest(selectedResourceId, quantityRequested, purpose);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-requests');
      }, 2000);
    } catch (err) {
      setError('Failed to create request. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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

  if (success) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600">Your resource request has been submitted successfully.</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to your requests...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Resource Request</h1>
          <p className="mt-2 text-gray-600">Fill in the details to request a resource</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="resource" className="block text-sm font-medium text-gray-700 mb-1">
                Select Resource
              </label>
              <select
                id="resource"
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={submitting}
              >
                <option value="">-- Choose a resource --</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.quantity_available} available)
                  </option>
                ))}
              </select>
            </div>

            {selectedResource && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <Package className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{selectedResource.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedResource.description}</p>
                    <div className="mt-2 flex items-center">
                      <span className="text-sm text-gray-700">
                        Category: <strong>{selectedResource.category}</strong>
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-sm text-gray-700">
                        Available: <strong>{selectedResource.quantity_available}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity Requested
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={selectedResource?.quantity_available || 1}
                value={quantityRequested}
                onChange={(e) => setQuantityRequested(parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Request
              </label>
              <textarea
                id="purpose"
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Explain why you need this resource..."
                required
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Please provide a clear explanation for your resource request
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
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
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
