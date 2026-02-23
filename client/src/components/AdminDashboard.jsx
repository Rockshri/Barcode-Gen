import { useState, useEffect, useCallback } from 'react';
import {
    FiUsers, FiBarChart2, FiTrash2, FiEdit3, FiX, FiCheck,
    FiRefreshCw, FiShield,
} from 'react-icons/fi';
import { BiBarcode } from 'react-icons/bi';
import { supabase } from '../lib/supabase';

/* ─────────────── Inline Edit Cell ─────────────── */
function EditableCell({ value, onSave, options }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);

    const handleSave = async () => { await onSave(val); setEditing(false); };

    if (!editing) {
        return (
            <span
                className="cursor-pointer hover:text-white transition-colors underline decoration-dashed underline-offset-2"
                onClick={() => setEditing(true)}
            >
                {value}
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1">
            {options ? (
                <select
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    className="bg-slate-800 border border-white/20 rounded px-2 py-0.5 text-white text-xs focus:outline-none"
                    autoFocus
                >
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    className="bg-slate-800 border border-white/20 rounded px-2 py-0.5 text-white text-xs focus:outline-none w-32"
                    autoFocus
                />
            )}
            <button onClick={handleSave} className="text-green-400 hover:text-green-300"><FiCheck className="text-xs" /></button>
            <button onClick={() => { setEditing(false); setVal(value); }} className="text-gray-400 hover:text-gray-300"><FiX className="text-xs" /></button>
        </span>
    );
}

/* ─────────────── Main AdminDashboard ─────────────── */
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [barcodes, setBarcodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const [{ data: profiles }, { data: barcodeData }] = await Promise.all([
            supabase.from('profiles').select('*').order('created_at', { ascending: false }),
            supabase.from('barcodes').select('*, profiles(email, full_name)').order('created_at', { ascending: false }),
        ]);
        setUsers(profiles || []);
        setBarcodes(barcodeData || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* ── Update user profile field ── */
    const updateUser = async (id, field, value) => {
        const { error } = await supabase.from('profiles').update({ [field]: value }).eq('id', id);
        if (!error) setUsers((prev) => prev.map((u) => u.id === id ? { ...u, [field]: value } : u));
    };

    /* ── Delete user ── */
    const deleteUser = async (id) => {
        if (!window.confirm('Permanently delete this user and all their barcodes?')) return;
        await supabase.from('profiles').delete().eq('id', id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setBarcodes((prev) => prev.filter((b) => b.user_id !== id));
    };

    /* ── Update barcode field ── */
    const updateBarcode = async (id, field, value) => {
        const { error } = await supabase
            .from('barcodes')
            .update({ [field]: value, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (!error) setBarcodes((prev) => prev.map((b) => b.id === id ? { ...b, [field]: value } : b));
    };

    /* ── Delete barcode ── */
    const deleteBarcode = async (id) => {
        if (!window.confirm('Delete this barcode?')) return;
        await supabase.from('barcodes').delete().eq('id', id);
        setBarcodes((prev) => prev.filter((b) => b.id !== id));
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Users', value: users.length, icon: <FiUsers />, color: 'from-blue-500 to-indigo-600' },
                        { label: 'Total Barcodes', value: barcodes.length, icon: <BiBarcode />, color: 'from-red-500 to-pink-600' },
                        { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: <FiShield />, color: 'from-amber-500 to-orange-600' },
                        { label: 'Regular Users', value: users.filter(u => u.role === 'user').length, icon: <FiUsers />, color: 'from-green-500 to-emerald-600' },
                    ].map((s) => (
                        <div key={s.label} className="glass-card p-5">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-lg mb-3`}>
                                {s.icon}
                            </div>
                            <div className="text-2xl font-bold text-white">{s.value}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-fit">
                    {[
                        { id: 'users', label: 'Users', icon: <FiUsers /> },
                        { id: 'barcodes', label: 'All Barcodes', icon: <BiBarcode /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                    <button onClick={fetchAll}
                        className="ml-2 p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <FiRefreshCw className={`text-sm ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'users' ? (
                    /* ─── Users Table ─── */
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        {['Name', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                                            <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-4 text-gray-200">
                                                <EditableCell value={u.full_name || '—'} onSave={(v) => updateUser(u.id, 'full_name', v)} />
                                            </td>
                                            <td className="px-5 py-4 text-gray-300 font-mono text-xs">{u.email}</td>
                                            <td className="px-5 py-4">
                                                <EditableCell
                                                    value={u.role}
                                                    options={['user', 'admin']}
                                                    onSave={(v) => updateUser(u.id, 'role', v)}
                                                />
                                            </td>
                                            <td className="px-5 py-4 text-gray-400 text-xs">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button onClick={() => deleteUser(u.id)}
                                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                                    <FiTrash2 className="text-sm" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="text-center py-12 text-gray-400">No users found</div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ─── Barcodes Table ─── */
                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        {['Title', 'Value', 'Format', 'Owner', 'Size', 'Saved', 'Actions'].map((h) => (
                                            <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {barcodes.map((b) => (
                                        <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-4 text-gray-200 max-w-[150px]">
                                                <EditableCell value={b.title || '—'} onSave={(v) => updateBarcode(b.id, 'title', v)} />
                                            </td>
                                            <td className="px-5 py-4 font-mono text-xs text-gray-300">{b.value}</td>
                                            <td className="px-5 py-4">
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs font-medium">
                                                    {b.format}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-gray-400 text-xs max-w-[160px] truncate">
                                                {b.profiles?.email || '—'}
                                            </td>
                                            <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                                                {b.width}×{b.height}px
                                            </td>
                                            <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                                                {new Date(b.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4">
                                                <button onClick={() => deleteBarcode(b.id)}
                                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                                    <FiTrash2 className="text-sm" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {barcodes.length === 0 && (
                                <div className="text-center py-12 text-gray-400">No barcodes found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
