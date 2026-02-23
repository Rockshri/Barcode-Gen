import { useState, useEffect, useCallback } from 'react';
import { FiBarChart2, FiTrash2, FiEdit3, FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { BiBarcode } from 'react-icons/bi';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import BarcodeGenerator from './BarcodeGenerator';

function BarcodeCard({ barcode, onDelete, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(barcode.title || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('barcodes')
            .update({ title, updated_at: new Date().toISOString() })
            .eq('id', barcode.id);
        if (!error) { onUpdate(); setEditing(false); }
        setSaving(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    {editing ? (
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            autoFocus
                        />
                    ) : (
                        <h3 className="font-semibold text-white truncate">{barcode.title || barcode.value}</h3>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editing ? (
                        <>
                            <button onClick={handleSave} disabled={saving}
                                className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                                {saving ? <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" /> : <FiCheck className="text-sm" />}
                            </button>
                            <button onClick={() => { setEditing(false); setTitle(barcode.title || ''); }}
                                className="p-1.5 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors">
                                <FiX className="text-sm" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setEditing(true)}
                                className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                                <FiEdit3 className="text-sm" />
                            </button>
                            <button onClick={() => onDelete(barcode.id)}
                                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                                <FiTrash2 className="text-sm" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-gray-400">Value</span>
                    <span className="text-gray-200 font-mono bg-white/10 px-2 py-0.5 rounded">{barcode.value}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400">Format</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium">{barcode.format}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400">Size</span>
                    <span className="text-gray-300">{barcode.width}×{barcode.height}px</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-400">Saved</span>
                    <span className="text-gray-400">{new Date(barcode.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}

export default function UserDashboard() {
    const { user } = useAuth();
    const [barcodes, setBarcodes] = useState([]);
    const [loadingBarcodes, setLoadingBarcodes] = useState(true);
    const [activeTab, setActiveTab] = useState('generator');

    const fetchBarcodes = useCallback(async () => {
        setLoadingBarcodes(true);
        const { data, error } = await supabase
            .from('barcodes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        if (!error) setBarcodes(data || []);
        setLoadingBarcodes(false);
    }, [user.id]);

    useEffect(() => { fetchBarcodes(); }, [fetchBarcodes]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this barcode?')) return;
        const { error } = await supabase.from('barcodes').delete().eq('id', id);
        if (!error) setBarcodes((prev) => prev.filter((b) => b.id !== id));
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Tab Header */}
                <div className="flex items-center gap-2 mb-8 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-fit">
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'generator'
                                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <FiBarChart2 />
                        Generator
                    </button>
                    <button
                        onClick={() => { setActiveTab('saved'); fetchBarcodes(); }}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'saved'
                                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <BiBarcode />
                        My Barcodes
                        {barcodes.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">{barcodes.length}</span>
                        )}
                    </button>
                </div>

                {activeTab === 'generator' && <BarcodeGenerator />}

                {activeTab === 'saved' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">My Saved Barcodes</h2>
                            <button onClick={fetchBarcodes}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-sm">
                                <FiRefreshCw className={loadingBarcodes ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>

                        {loadingBarcodes ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : barcodes.length === 0 ? (
                            <div className="text-center py-20 glass-card">
                                <BiBarcode className="text-7xl text-white/10 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg">No barcodes saved yet</p>
                                <p className="text-gray-500 text-sm mt-1">Switch to Generator tab to create one</p>
                                <button onClick={() => setActiveTab('generator')}
                                    className="mt-4 px-5 py-2 glass-button text-sm">
                                    Go to Generator
                                </button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {barcodes.map((bc) => (
                                    <BarcodeCard key={bc.id} barcode={bc} onDelete={handleDelete} onUpdate={fetchBarcodes} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
