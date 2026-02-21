import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { siteService } from '../../services/siteService';
import { userService } from '../../services/userService';
import {
    MapPin, Plus, Edit2, Trash2, Phone, Users, X, Search,
    Check, AlertCircle, Loader2, Building2
} from 'lucide-react';

export const ManageSites = () => {
    const [sites, setSites] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSite, setEditingSite] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        siteName: '',
        siteAddress: '',
        contactNumber: '',
        assignedUsers: []
    });

    // User search state
    const [userSearch, setUserSearch] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sitesData, usersData] = await Promise.all([
                siteService.getAllSites(),
                userService.getAllUsers()
            ]);
            setSites(sitesData);
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching sites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (site = null) => {
        if (site) {
            setEditingSite(site);
            setFormData({
                siteName: site.siteName,
                siteAddress: site.siteAddress,
                contactNumber: site.contactNumber,
                assignedUsers: site.assignedUsers.map(u => u._id)
            });
        } else {
            setEditingSite(null);
            setFormData({
                siteName: '',
                siteAddress: '',
                contactNumber: '',
                assignedUsers: []
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSite(null);
        setUserSearch('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
            alert('Contact number must be exactly 10 digits.');
            setProcessing(false);
            return;
        }

        try {
            if (editingSite) {
                await siteService.updateSite(editingSite._id, formData);
            } else {
                await siteService.createSite(formData);
            }
            await fetchData();
            handleCloseModal();
        } catch (error) {
            alert(error.message || 'Error saving site');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this site?')) return;
        try {
            await siteService.deleteSite(id);
            await fetchData();
        } catch (error) {
            alert(error.message || 'Error deleting site');
        }
    };

    const toggleUser = (userId) => {
        setFormData(prev => {
            const current = prev.assignedUsers;
            if (current.includes(userId)) {
                return { ...prev, assignedUsers: current.filter(id => id !== userId) };
            } else {
                return { ...prev, assignedUsers: [...current, userId] };
            }
        });
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    ).slice(0, 5);

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
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">Manage Sites</h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                                {sites.length} Total
                            </span>
                        </div>
                        <p className="mt-1 text-gray-600 font-medium">Create and manage operation sites and assign users</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-bold text-sm"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        New Site
                    </button>
                </div>

                {sites.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites found</h3>
                        <p className="text-gray-500">Get started by creating your first operation site</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sites.map(site => (
                            <div key={site._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all duration-300 group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-600 transition-colors duration-300">
                                            <Building2 className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <div className="flex gap-1.5 translate-x-2 -translate-y-2">
                                            <button onClick={() => handleOpenModal(site)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Site">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(site._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Site">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{site.siteName}</h3>

                                    <div className="space-y-3 text-sm text-gray-500 mb-6">
                                        <div className="flex items-start">
                                            <MapPin className="h-4 w-4 mr-2.5 mt-0.5 flex-shrink-0 text-gray-400" />
                                            <span className="leading-tight">{site.siteAddress}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2.5 flex-shrink-0 text-gray-400" />
                                            <span className="font-medium text-gray-700">{site.contactNumber}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2.5 flex-shrink-0 text-gray-400" />
                                            <span className="font-medium text-gray-700">{site.assignedUsers.length} Users Locked In</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-5 border-t border-gray-50 flex flex-wrap gap-2">
                                        {site.assignedUsers.length > 0 ? (
                                            <>
                                                {site.assignedUsers.slice(0, 3).map(u => (
                                                    <div key={u._id} className="flex items-center bg-gray-50 border border-gray-100/50 rounded-full pl-1.5 pr-3 py-1 hover:bg-white hover:border-blue-200 transition-all cursor-default" title={u.fullName || u.email}>
                                                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[9px] flex items-center justify-center font-black mr-2 uppercase border border-blue-200 shadow-inner">
                                                            {(u.fullName || u.email).charAt(0)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight truncate max-w-[70px]">
                                                            {u.fullName?.split(' ')[0] || u.email.split('@')[0]}
                                                        </span>
                                                    </div>
                                                ))}
                                                {site.assignedUsers.length > 3 && (
                                                    <div className="bg-gray-100 text-gray-400 rounded-full px-2.5 py-1 text-[10px] font-black uppercase border border-gray-200/50">
                                                        +{site.assignedUsers.length - 3}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400 italic text-[10px]">
                                                <AlertCircle className="h-3 w-3" />
                                                No users assigned to this site
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingSite ? 'Edit Site' : 'Create New Site'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Site Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.siteName}
                                    onChange={e => setFormData({ ...formData, siteName: e.target.value })}
                                    placeholder="Enter site name"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Address</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.siteAddress}
                                    onChange={e => setFormData({ ...formData, siteAddress: e.target.value })}
                                    placeholder="Enter full site address"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.contactNumber}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setFormData({ ...formData, contactNumber: val });
                                    }}
                                    placeholder="10-digit mobile number"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                                <p className="text-[10px] text-gray-400 px-1 font-medium">Exactly 10 digits required</p>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-sm font-semibold text-gray-700 block">Assign Users</label>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                        placeholder="Search by name or email"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto px-1">
                                    {userSearch && filteredUsers.map(user => (
                                        <button
                                            key={user._id}
                                            type="button"
                                            onClick={() => toggleUser(user._id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${formData.assignedUsers.includes(user._id)
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-100 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center text-left">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 uppercase">
                                                    {(user.fullName || user.email).charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.fullName || 'No Name'}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            {formData.assignedUsers.includes(user._id) && (
                                                <Check className="h-4 w-4 text-blue-600" />
                                            )}
                                        </button>
                                    ))}
                                    {!userSearch && formData.assignedUsers.length === 0 && (
                                        <p className="text-xs text-gray-400 text-center py-4 italic">No users assigned. Search for users to add them.</p>
                                    )}
                                    {!userSearch && formData.assignedUsers.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase px-1">Assigned Users ({formData.assignedUsers.length})</p>
                                            {users.filter(u => formData.assignedUsers.includes(u._id)).map(user => (
                                                <button
                                                    key={user._id}
                                                    type="button"
                                                    onClick={() => toggleUser(user._id)}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-blue-500 bg-blue-50"
                                                >
                                                    <div className="flex items-center text-left">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3 uppercase">
                                                            {(user.fullName || user.email).charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">{user.fullName || 'No Name'}</p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center font-bold transition-all shadow-sm"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingSite ? 'Save Changes' : 'Create Site')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};
