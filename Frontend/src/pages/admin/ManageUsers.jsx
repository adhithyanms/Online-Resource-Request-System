import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/Layout';
import { userService } from '../../services/userService';
import {
  Users, Search, UserPlus, Edit2, Trash2,
  AlertCircle, CheckCircle, Save, X, Image, FileText,
  Phone, MapPin, Eye, ArrowLeft, Clock, CheckCircle2, XCircle, Package, Shield, Plus
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

const photoUrl = (path) => {
    if (!path) return null;
    // If it's already an absolute URL (Cloudinary), return as is
    if (path.startsWith('http')) return path;
    // Otherwise fallback to backend local uploads (for legacy files)
    return `${API_BASE}${path}`;
};

const Avatar = ({ src, name }) => {
  const initials = (name || '?').charAt(0).toUpperCase();
  if (src) {
    return <img src={photoUrl(src)} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
      {initials}
    </div>
  );
};

// ── Photo Upload Field ────────────────────────────────────────────────────────
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

// ── Edit Profile Modal ────────────────────────────────────────────────────────
const EditProfileModal = ({ user, onClose, onSaved }) => {
  const [form, setForm] = useState({ fullName: user.fullName || '', phone: user.phone || '', address: user.address || '' });
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (field, file) => setFiles(prev => ({ ...prev, [field]: file }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setError('Phone number must be exactly 10 digits.');
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
      await userService.updateUserProfile(user._id, fd);
      onSaved();
    } catch (err) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {[
            { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Enter full name' },
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
              placeholder="Enter address" rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PhotoField label="Profile Photo" currentUrl={user.profilePhotoUrl} fieldName="profilePhoto" onChange={handleFile} icon={Image} />
            <PhotoField label="Aadhaar" currentUrl={user.aadhaarPhotoUrl} fieldName="aadhaarPhoto" onChange={handleFile} icon={FileText} />
            <PhotoField label="PAN Card" currentUrl={user.panCardPhotoUrl} fieldName="panCardPhoto" onChange={handleFile} icon={FileText} />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 transition-colors">
              {saving ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteConfirmModal = ({ user, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await userService.deleteUser(user._id);
      onDeleted();
    } catch (err) {
      setError(err?.message || 'Failed to delete user');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Delete User</h2>
            <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete <span className="font-medium text-gray-900">{user.email}</span>?
        </p>
        {error && (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs mb-3">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 transition-colors">
            {deleting ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Role Confirm Modal ────────────────────────────────────────────────────────
const RoleConfirmModal = ({ user, newRole, onClose, onConfirmed }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setUpdating(true);
    setError('');
    try {
      await userService.updateUserRole(user._id, newRole);
      onConfirmed();
    } catch (err) {
      setError(err?.message || 'Failed to update role');
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${newRole === 'admin' ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Shield className={`h-5 w-5 ${newRole === 'admin' ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{newRole === 'admin' ? 'Promote to Admin' : 'Demote to User'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Change role for {user.email}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to change this user's role to <span className="font-semibold text-gray-900 uppercase">{newRole}</span>?
        </p>
        {error && (
          <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs mb-3">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition-colors">
            Cancel
          </button>
          <button onClick={handleUpdate} disabled={updating}
            className={`flex-1 px-3 py-2 text-white rounded-lg disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 transition-colors ${newRole === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`}>
            {updating ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
            {updating ? 'Updating...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
);

// ── User Row ──────────────────────────────────────────────────────────────────
// ── User Row ──────────────────────────────────────────────────────────────────
const UserRow = ({ user: u, onSelect, onEdit, onDelete, isSuperAdmin, onRoleChange }) => (
  <div className="flex items-center gap-3 px-3 sm:px-4 py-3.5 hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => onSelect(u)}>
    <Avatar src={u.profilePhotoUrl} name={u.fullName || u.email} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{u.fullName || <span className="text-gray-400 italic font-normal">No name</span>}</p>
        <div className="sm:hidden flex-shrink-0">
          <Badge label={u.role} color={u.role === 'admin' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-100'} />
        </div>
      </div>
      <p className="text-[11px] font-medium text-gray-500 truncate">{u.email}</p>
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <div className="hidden sm:block">
          <Badge label={u.role} color={u.role === 'admin' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-600 border border-gray-100'} />
        </div>
        <Badge label={u.isAllowed ? 'Active' : 'Inactive'} color={u.isAllowed ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'} />
        {u.phone && <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tighter"><Phone className="h-2.5 w-2.5" /> {u.phone}</span>}
      </div>
    </div>
    <div className="flex lg:opacity-0 group-hover:opacity-100 items-center gap-1 sm:gap-1.5 flex-shrink-0 transition-opacity">
      {isSuperAdmin && u.email?.toLowerCase() !== 'adhithyanshanmugam@gmail.com' && (
        <button onClick={(e) => { e.stopPropagation(); onRoleChange(u, u.role === 'admin' ? 'user' : 'admin'); }}
          className={`p-2 rounded-xl border transition-all ${u.role === 'admin' ? 'text-gray-400 bg-white border-gray-100 hover:bg-gray-50' : 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100'}`}
          title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}>
          <Shield className="h-3.5 w-3.5" />
        </button>
      )}
      <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
        className="p-2 bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 rounded-xl transition-all shadow-sm" title="Edit Profile">
        <Edit2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" title="Delete User">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const ManageUsers = () => {
  const { user, isAdmin } = useAuth();
  const isSuperAdmin = user?.email?.toLowerCase() === 'adhithyanshanmugam@gmail.com';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [roleChange, setRoleChange] = useState(null); // { user, newRole }

  const [addEmail, setAddEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addMessage, setAddMessage] = useState({ type: '', text: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRequests, setUserRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { url, label }
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const filtered = users;

  useEffect(() => {
    if (isAdmin || isSuperAdmin) loadUsers();
    else setLoading(false);
  }, [isAdmin, isSuperAdmin]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const email = addEmail.trim();
    if (!email) { setAddMessage({ type: 'error', text: 'Enter an email address' }); return; }
    setAddLoading(true);
    setAddMessage({ type: '', text: '' });
    try {
      const res = await userService.addUser(email);
      setAddMessage({ type: 'success', text: res.message || `${email} added successfully` });
      setAddEmail('');
      await loadUsers();
    } catch (err) {
      setAddMessage({ type: 'error', text: err?.message || 'Failed to add user' });
    } finally { setAddLoading(false); }
  };

  const handleSearchInput = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const r = await userService.searchUsers(val.trim());
        setSearchResults(Array.isArray(r) ? r : []);
        setShowDropdown(true);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 300);
  }, []);

  const handleSelectUser = async (u) => {
    setSelectedUser(u);
    setShowDropdown(false);
    setSearchQuery('');
    setRequestsLoading(true);
    try {
      const reqs = await userService.getUserRequests(u._id);
      setUserRequests(Array.isArray(reqs) ? reqs : []);
    } catch { setUserRequests([]); }
    finally { setRequestsLoading(false); }
  };

  const handleEditSaved = () => {
    setEditUser(null);
    loadUsers();
  };

  const handleDeleted = () => {
    setDeleteUser(null);
    loadUsers();
    if (selectedUser) setSelectedUser(null);
  };

  const handleRoleChanged = () => {
    setRoleChange(null);
    loadUsers();
    if (selectedUser) {
      const updatedUser = users.find(u => u._id === selectedUser._id);
      if (updatedUser) setSelectedUser({ ...selectedUser, role: roleChange.newRole });
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

  if (!isAdmin && !isSuperAdmin) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="font-semibold">Access Restricted</h2>
            <p className="text-sm mt-1">Only admins can manage users.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {editUser && <EditProfileModal user={editUser} onClose={() => setEditUser(null)} onSaved={handleEditSaved} />}
      {deleteUser && <DeleteConfirmModal user={deleteUser} onClose={() => setDeleteUser(null)} onDeleted={handleDeleted} />}
      {roleChange && <RoleConfirmModal user={roleChange.user} newRole={roleChange.newRole} onClose={() => setRoleChange(null)} onConfirmed={handleRoleChanged} />}

      <div className="space-y-5 max-w-3xl mx-auto px-4 sm:px-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500 mt-1">Add users by email and manage their profiles</p>
        </div>

        {/* Add User */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-blue-600" /> Add New User
          </h2>
          <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-3">
            <input type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)}
              placeholder="user@example.com" disabled={addLoading}
              className="flex-1 px-4 py-2.5 border border-gray-100 bg-gray-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0" />
            <button type="submit" disabled={addLoading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-bold transition-all whitespace-nowrap shadow-sm active:scale-95">
              {addLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="h-4 w-4" />}
              Add User
            </button>
          </form>
          {addMessage.text && (
            <div className={`mt-2 flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${addMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {addMessage.type === 'error' ? <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> : <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />}
              {addMessage.text}
            </div>
          )}
        </div>

        {/* Search with Autocomplete */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5" ref={searchRef}>
          <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600" /> Search User by Name
          </h2>
          <div className="relative">
            <input type="text" value={searchQuery} onChange={handleSearchInput}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="Type a name or email..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {searchLoading && <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map(u => (
                  <button key={u._id} onClick={() => handleSelectUser(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0">
                    <Avatar src={u.profilePhotoUrl} name={u.fullName || u.email} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.fullName || <span className="text-gray-400 italic">No name</span>}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
            {showDropdown && searchQuery && searchResults.length === 0 && !searchLoading && (
              <div className="absolute z-40 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-xs text-gray-400">
                No users found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* User Detail Panel */}
        {selectedUser && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-500 hover:bg-white/60 rounded-xl transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <Avatar src={selectedUser.profilePhotoUrl} name={selectedUser.fullName || selectedUser.email} />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate">{selectedUser.fullName || 'No name'}</h2>
                  <p className="text-[11px] font-medium text-gray-500 truncate">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                {isSuperAdmin && selectedUser.email?.toLowerCase() !== 'adhithyanshanmugam@gmail.com' && (
                  <button onClick={() => setRoleChange({ user: selectedUser, newRole: selectedUser.role === 'admin' ? 'user' : 'admin' })}
                    className={`p-2 rounded-xl transition-all border ${selectedUser.role === 'admin' ? 'text-gray-500 bg-white border-gray-200 hover:bg-gray-50' : 'text-blue-600 bg-blue-100/50 border-blue-200 hover:bg-blue-100'}`}
                    title={selectedUser.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}>
                    <Shield className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setEditUser(selectedUser)} className="p-2 bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 rounded-xl transition-all shadow-sm" title="Edit Profile"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => setDeleteUser(selectedUser)} className="p-2 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm" title="Delete User"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {/* Profile Info */}
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-gray-400" /><span className="text-gray-600">{selectedUser.phone || 'No phone'}</span></div>
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-gray-400" /><span className="text-gray-600">{selectedUser.address || 'No address'}</span></div>
              <div className="flex items-center gap-2 text-sm">
                <Badge label={selectedUser.role} color={selectedUser.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'} />
                <Badge label={selectedUser.isAllowed ? 'Active' : 'Inactive'} color={selectedUser.isAllowed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500"><Clock className="h-4 w-4 text-gray-400" />Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
            </div>
            {/* Document Photos */}
            {(selectedUser.profilePhotoUrl || selectedUser.aadhaarPhotoUrl || selectedUser.panCardPhotoUrl) && (
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Documents</h3>
                <div className="flex gap-4 flex-wrap">
                  {[{ label: 'Profile', url: selectedUser.profilePhotoUrl }, { label: 'Aadhaar', url: selectedUser.aadhaarPhotoUrl }, { label: 'PAN Card', url: selectedUser.panCardPhotoUrl }]
                    .filter(d => d.url).map(d => (
                      <div key={d.label} className="text-center cursor-pointer group" onClick={() => setLightbox({ url: photoUrl(d.url), label: d.label })}>
                        <img src={photoUrl(d.url)} alt={d.label} className="h-20 w-auto rounded-lg border border-gray-200 object-contain bg-gray-50 group-hover:ring-2 group-hover:ring-blue-400 transition-all" />
                        <p className="text-xs text-gray-500 mt-1 group-hover:text-blue-600">{d.label}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {/* Request History */}
            <div className="px-5 py-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <Package className="h-3.5 w-3.5" /> Request History ({userRequests.length})
              </h3>
              {requestsLoading ? (
                <div className="flex justify-center py-6"><div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : userRequests.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No requests found</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {userRequests.map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${r.status === 'approved' ? 'bg-green-100' : r.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        {r.status === 'approved' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : r.status === 'rejected' ? <XCircle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{r.resource?.name || 'Unknown Resource'}</p>
                        <p className="text-xs text-gray-500 truncate">Qty: {r.quantity_requested} · {r.purpose}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge label={r.status} color={r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'} />
                        <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Users */}

        {/* Image Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setLightbox(null)}>
            <div className="relative max-w-3xl max-h-[85vh] p-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(null)} className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
                <X className="h-4 w-4" />
              </button>
              <img src={lightbox.url} alt={lightbox.label} className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain bg-white" />
              <p className="text-center text-white text-sm font-medium mt-3">{lightbox.label}</p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2 flex-shrink-0">
              <Users className="h-4 w-4 text-blue-600" /> All Users
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">{filtered.length}</span>
            </h2>
          </div>
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No users yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(u => (
                <UserRow
                  key={u._id}
                  user={u}
                  onSelect={handleSelectUser}
                  onEdit={() => setEditUser(u)}
                  onDelete={() => setDeleteUser(u)}
                  isSuperAdmin={isSuperAdmin}
                  onRoleChange={(user, newRole) => setRoleChange({ user, newRole })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
