import { useState, useEffect, useRef } from 'react';
import { Layout } from '../../components/Layout';
import { userService } from '../../services/userService';
import {
    User, Mail, Phone, MapPin, FileText, Shield,
    AlertCircle, Edit2, X, Save, Image, CheckCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

const photoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
};

// ── Photo Upload Field ─────────────────────────────────────────────────────────
const PhotoField = ({ label, currentUrl, fieldName, onChange, icon: Icon }) => {
    const inputRef = useRef();
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (preview) URL.revokeObjectURL(preview);
        const url = URL.createObjectURL(file);
        setPreview(url);
        onChange(fieldName, file);
        // Reset input so choosing same file again triggers onChange
        e.target.value = '';
    };

    const clearSelection = () => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        onChange(fieldName, null);
    };

    const hasImage = preview || currentUrl;

    return (
        <div className="space-y-1.5 p-3 bg-gray-50/50 rounded-xl border border-gray-100 flex flex-col h-full">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Icon className="h-3 w-3" /> {label}
            </label>

            <div className="flex-1 flex flex-col justify-center items-center gap-2 min-h-[90px]">
                {hasImage ? (
                    <div className="relative group w-full">
                        <img
                            src={preview || photoUrl(currentUrl)}
                            alt={label}
                            className="h-20 w-full rounded-lg border border-gray-200 object-contain bg-white transition-opacity group-hover:opacity-75"
                        />
                        {preview && (
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                title="Clear selection"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-2 text-gray-300">
                        <Image className="h-8 w-8 mb-1 opacity-20" />
                        <span className="text-[10px] font-medium italic">No file</span>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={`w-full text-[11px] font-bold py-1.5 rounded-lg transition-all ${hasImage ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                    }`}
            >
                {hasImage ? 'Change' : 'Upload'}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFile}
            />
        </div>
    );
};

// ── Info Row (read-only display) ───────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                <p className="text-gray-800 text-sm mt-0.5 font-medium whitespace-pre-line">{value}</p>
            </div>
        </div>
    );
};

// ── Document Card ──────────────────────────────────────────────────────────────
const DocumentCard = ({ label, url, onImageClick }) => {
    if (!url) return null;
    const src = photoUrl(url);
    return (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-4 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            {url.endsWith('.pdf') ? (
                <a href={src} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <FileText className="h-4 w-4" /> View PDF
                </a>
            ) : (
                <img src={src} alt={label} onClick={() => onImageClick && onImageClick({ url: src, label })}
                    className="w-full h-32 sm:h-40 object-contain rounded-lg bg-white border border-gray-100 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all" />
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const UserProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);

    // Edit form state
    const [form, setForm] = useState({ fullName: '', phone: '', address: '' });
    const [files, setFiles] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState({ type: '', text: '' });
    const [lightbox, setLightbox] = useState(null); // { url, label }

    const loadProfile = () => {
        setLoading(true);
        userService.getMyProfile()
            .then(data => {
                setProfile(data);
                setForm({ fullName: data.fullName || '', phone: data.phone || '', address: data.address || '' });
            })
            .catch(err => setError(err?.message || 'Failed to load profile'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadProfile(); }, []);

    const handleFile = (field, file) => setFiles(prev => ({ ...prev, [field]: file }));

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        if (form.phone && !/^\d{10}$/.test(form.phone)) {
            setSaveMsg({ type: 'error', text: 'Phone number must be exactly 10 digits.' });
            setSaving(false);
            return;
        }

        try {
            const fd = new FormData();
            fd.append('fullName', form.fullName);
            fd.append('phone', form.phone);
            fd.append('address', form.address);
            if (files.profilePhoto) fd.append('profilePhoto', files.profilePhoto);
            if (files.aadhaarPhoto) fd.append('aadhaarPhoto', files.aadhaarPhoto);
            if (files.panCardPhoto) fd.append('panCardPhoto', files.panCardPhoto);

            await userService.updateMyProfile(fd);
            setSaveMsg({ type: 'success', text: 'Profile updated successfully!' });
            setFiles({});
            setEditing(false);
            loadProfile();
        } catch (err) {
            setSaveMsg({ type: 'error', text: err?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="max-w-lg mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 flex gap-3 items-start">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div><p className="font-medium">Could not load profile</p><p className="text-sm mt-1">{error}</p></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-xl mx-auto px-4 sm:px-0 space-y-5">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-sm text-gray-500 mt-1">View and update your profile details</p>
                    </div>
                    {!editing && (
                        <button onClick={() => { setEditing(true); setSaveMsg({ type: '', text: '' }); }}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors w-full sm:w-auto">
                            <Edit2 className="h-4 w-4" /> Edit Profile
                        </button>
                    )}
                </div>

                {/* Success message after save */}
                {saveMsg.text && !editing && (
                    <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${saveMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                        {saveMsg.type === 'error' ? <AlertCircle className="h-4 w-4 flex-shrink-0" /> : <CheckCircle className="h-4 w-4 flex-shrink-0" />}
                        {saveMsg.text}
                    </div>
                )}

                {/* Profile header card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                        {profile?.profilePhotoUrl ? (
                            <img src={photoUrl(profile.profilePhotoUrl)} alt="Profile"
                                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-100 flex-shrink-0" />
                        ) : (
                            <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="h-10 w-10 sm:h-8 sm:w-8 text-blue-400" />
                            </div>
                        )}
                        <div className="flex flex-col items-center sm:items-start">
                            <h2 className="text-xl sm:text-lg font-bold text-gray-900 leading-tight">
                                {profile?.fullName || <span className="text-gray-400 italic font-medium">Name not set</span>}
                            </h2>
                            <p className="text-gray-500 text-sm mt-0.5">{profile?.email}</p>
                            <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wide ${profile?.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {profile?.role === 'admin' ? '🛡️ ADMIN' : '👤 USER'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── EDIT FORM ─────────────────────────────────────────── */}
                {editing ? (
                    <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-1">
                            <h3 className="text-sm font-semibold text-gray-800">Edit Details</h3>
                            <button type="button" onClick={() => { setEditing(false); setSaveMsg({ type: '', text: '' }); }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {[
                            { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Your full name' },
                            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 XXXXXXXXXX' },
                        ].map(({ label, key, type, placeholder }) => (
                            <div key={key} className="space-y-1">
                                <label className="block text-xs font-medium text-gray-600">{label}</label>
                                <input
                                    type={type}
                                    value={form[key]}
                                    onChange={e => {
                                        let val = e.target.value;
                                        if (key === 'phone') {
                                            val = val.replace(/\D/g, '').slice(0, 10);
                                        }
                                        setForm(p => ({ ...p, [key]: val }));
                                    }}
                                    placeholder={key === 'phone' ? '10-digit mobile number' : placeholder}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {key === 'phone' && (
                                    <p className="text-[10px] text-gray-400 px-1 font-medium">Exactly 10 digits required</p>
                                )}
                            </div>
                        ))}

                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-600">Address</label>
                            <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                placeholder="Your address" rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        </div>

                        <div className="border-t border-gray-100 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <PhotoField label="Profile Photo" currentUrl={profile?.profilePhotoUrl} fieldName="profilePhoto" onChange={handleFile} icon={Image} />
                            <PhotoField label="Aadhaar" currentUrl={profile?.aadhaarPhotoUrl} fieldName="aadhaarPhoto" onChange={handleFile} icon={FileText} />
                            <PhotoField label="PAN Card" currentUrl={profile?.panCardPhotoUrl} fieldName="panCardPhoto" onChange={handleFile} icon={FileText} />
                        </div>

                        {saveMsg.text && (
                            <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${saveMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                {saveMsg.type === 'error' ? <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> : <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />}
                                {saveMsg.text}
                            </div>
                        )}

                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={() => { setEditing(false); setSaveMsg({ type: '', text: '' }); }}
                                className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 transition-colors">
                                {saving ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                {saving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* ── VIEW MODE ────────────────────────────────────────── */
                    <>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contact Details</h3>
                            <InfoRow icon={Mail} label="Email" value={profile?.email} />
                            <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                            <InfoRow icon={MapPin} label="Address" value={profile?.address} />
                            {!profile?.phone && !profile?.address && (
                                <p className="text-sm text-gray-400 py-4 text-center">No contact details added yet.</p>
                            )}
                        </div>

                        {(profile?.aadhaarPhotoUrl || profile?.panCardPhotoUrl) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Documents</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <DocumentCard label="Aadhaar Card" url={profile?.aadhaarPhotoUrl} onImageClick={setLightbox} />
                                    <DocumentCard label="PAN Card" url={profile?.panCardPhotoUrl} onImageClick={setLightbox} />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                            <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                            Profile documents can also be updated by the admin.
                        </div>
                    </>
                )}
            </div>

            {/* Image Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setLightbox(null)}>
                    <div className="relative max-w-3xl max-h-[85vh]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setLightbox(null)} className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                        <img src={lightbox.url} alt={lightbox.label} className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain bg-white" />
                        <p className="text-center text-white text-sm font-medium mt-3">{lightbox.label}</p>
                    </div>
                </div>
            )}
        </Layout>
    );
};
