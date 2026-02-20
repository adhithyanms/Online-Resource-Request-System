import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { siteService } from '../../services/siteService';
import { requestService } from '../../services/requestService';
import {
    MapPin, Phone, Building2, Loader2, Info, X,
    FileText, Clock, CheckCircle, XCircle
} from 'lucide-react';

export const MySites = () => {
    const [sites, setSites] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSite, setSelectedSite] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sitesData, requestsData] = await Promise.all([
                    siteService.getMySites(),
                    requestService.getMyRequests()
                ]);
                setSites(sitesData);
                setRequests(requestsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSiteClick = (site) => {
        setSelectedSite(site);
        setShowModal(true);
    };

    const siteRequests = selectedSite
        ? requests.filter(r => r.site?._id === selectedSite._id || r.siteId === selectedSite._id)
        : [];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return { icon: <CheckCircle className="h-4 w-4 text-green-600" />, bg: 'bg-green-50 text-green-700 border-green-100' };
            case 'rejected': return { icon: <XCircle className="h-4 w-4 text-red-600" />, bg: 'bg-red-50 text-red-700 border-red-100' };
            default: return { icon: <Clock className="h-4 w-4 text-yellow-600" />, bg: 'bg-yellow-50 text-yellow-700 border-yellow-100' };
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6 pb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Sites</h1>
                        <p className="mt-1 text-gray-600 font-medium">Browse assigned sites and their request history</p>
                    </div>
                </div>

                {sites.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No assigned sites</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            You currently have no sites assigned to you.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sites.map(site => (
                            <div
                                key={site._id}
                                onClick={() => handleSiteClick(site)}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md hover:ring-2 hover:ring-blue-500/20 transition-all group"
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 group-hover:from-blue-700 group-hover:to-indigo-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                            <Building2 className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white truncate">{site.siteName}</h3>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <MapPin className="h-5 w-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Address</p>
                                                <p className="text-sm text-gray-800 font-medium leading-relaxed">{site.siteAddress}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start pt-1">
                                            <Phone className="h-5 w-5 mr-3 mt-0.5 text-blue-600 flex-shrink-0" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Contact</p>
                                                <p className="text-sm text-gray-800 font-medium">{site.contactNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Info className="h-3.5 w-3.5" />
                                            <span>Staff: {site.assignedUsers.length}</span>
                                        </div>
                                        <span className="text-blue-600 font-medium group-hover:underline">View History &rarr;</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Request History Modal */}
            {showModal && selectedSite && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedSite.siteName}</h2>
                                    <p className="text-xs text-gray-500">Resource Request History</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {siteRequests.length === 0 ? (
                                <div className="py-12 text-center">
                                    <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No requests found for this site</p>
                                    <p className="text-gray-400 text-sm mt-1">Requests made for this site will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {siteRequests.map(r => {
                                        const styles = getStatusStyles(r.status);
                                        return (
                                            <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-gray-200 transition-colors">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{r.resource?.name || 'Unknown Resource'}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${styles.bg}`}>
                                                        {styles.icon}
                                                        {r.status}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                                    <div>
                                                        <span className="text-gray-400 text-[11px] uppercase font-bold tracking-wider block">Quantity</span>
                                                        <span className="font-semibold text-gray-700">{r.quantity_requested} units</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 text-[11px] uppercase font-bold tracking-wider block">Purpose</span>
                                                        <span className="text-gray-700 truncate block" title={r.purpose}>{r.purpose}</span>
                                                    </div>
                                                </div>
                                                {r.status === 'rejected' && r.rejectionReason && (
                                                    <div className="mt-3 pt-3 border-t border-red-50 text-xs text-red-600 italic">
                                                        <strong>Note:</strong> {r.rejectionReason}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-bold text-sm shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};
