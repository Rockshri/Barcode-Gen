import { useState } from 'react';
import JsBarcode from 'jsbarcode';
import {
    FiDownload, FiBarChart2, FiCheckCircle, FiPrinter, FiSave,
} from 'react-icons/fi';
import { BiBarcode } from 'react-icons/bi';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function BarcodeGenerator() {
    const { user } = useAuth();

    const [barcodeValue, setBarcodeValue] = useState('');
    const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
    const [barcodeImage, setBarcodeImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saveMsg, setSaveMsg] = useState('');
    const [rows, setRows] = useState(1);
    const [cols, setCols] = useState(1);
    const [includeTitle, setIncludeTitle] = useState(true);
    const [showProductDetails, setShowProductDetails] = useState(false);
    const [barcodeWidth, setBarcodeWidth] = useState(2);
    const [barcodeHeight, setBarcodeHeight] = useState(100);
    const [customTitle, setCustomTitle] = useState('');

    const barcodeFormats = [
        { value: 'CODE128', label: 'CODE128', description: 'High-density barcode' },
        { value: 'CODE39', label: 'CODE39', description: 'Alphanumeric' },
        { value: 'EAN13', label: 'EAN13', description: '13-digit EAN' },
        { value: 'UPC', label: 'UPC-A', description: '12-digit UPC' },
        { value: 'ITF', label: 'ITF', description: 'Interleaved 2 of 5' },
    ];

    const generateBarcode = () => {
        if (!barcodeValue.trim()) { setError('Please enter a barcode value'); return; }
        setLoading(true);
        setError('');
        setSaveMsg('');
        setTimeout(() => {
            try {
                const canvas = document.createElement('canvas');
                JsBarcode(canvas, barcodeValue, {
                    format: barcodeFormat,
                    width: barcodeWidth,
                    height: barcodeHeight,
                    displayValue: includeTitle,
                    text: customTitle || barcodeValue,
                    fontSize: 20,
                    textMargin: 2,
                    margin: 10,
                });
                setBarcodeImage(canvas.toDataURL('image/png'));
                setError('');
            } catch (err) {
                setError('Failed to generate barcode. Check the value format for the selected type.');
                setBarcodeImage('');
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const saveBarcode = async () => {
        if (!barcodeImage) return;
        setSaving(true);
        setSaveMsg('');
        const { error: err } = await supabase.from('barcodes').insert({
            user_id: user.id,
            value: barcodeValue,
            format: barcodeFormat,
            title: customTitle || barcodeValue,
            width: barcodeWidth,
            height: barcodeHeight,
        });
        if (err) setSaveMsg(`❌ ${err.message}`);
        else setSaveMsg('✅ Barcode saved successfully!');
        setSaving(false);
        setTimeout(() => setSaveMsg(''), 4000);
    };

    const downloadBarcode = () => {
        if (!barcodeImage) return;
        const link = document.createElement('a');
        link.href = barcodeImage;
        link.download = `barcode-${barcodeValue}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printMultipleBarcodes = (rows, cols) => {
        if (!barcodeImage) return;
        const total = rows * cols;
        const printWindow = window.open('', '_blank');
        let barcodeHTML = '';
        for (let i = 0; i < total; i++) {
            barcodeHTML += `<div class="barcode-item"><img src="${barcodeImage}" alt="Barcode ${i + 1}" /><div class="barcode-code">${barcodeValue}</div></div>`;
        }
        printWindow.document.write(`
      <html><head><title>Print Barcodes</title><style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:sans-serif;background:white}
        .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:20px;padding:15mm}
        .barcode-item{text-align:center;padding:15px;border:1px solid #ddd;border-radius:8px;break-inside:avoid}
        .barcode-item img{width:100%;max-width:180px;height:auto;display:block;margin:0 auto 10px}
        .barcode-code{font-size:12px;font-weight:600;color:#333}
        @page{size:A4;margin:10mm}
      </style></head><body><div class="grid">${barcodeHTML}</div></body></html>
    `);
        printWindow.document.close();
        printWindow.onload = () => { printWindow.print(); printWindow.close(); };
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel */}
            <div className="glass-card p-8 animate-slide-up">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <FiBarChart2 className="text-red-500" />
                    Configuration
                </h2>

                {/* Barcode Value */}
                <div className="mb-6">
                    <label className="label-text block mb-2">Barcode Value *</label>
                    <input
                        type="text"
                        value={barcodeValue}
                        onChange={(e) => setBarcodeValue(e.target.value)}
                        placeholder="Enter barcode value"
                        className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {barcodeFormat === 'EAN13' && 'Enter 12 or 13 digits'}
                        {barcodeFormat === 'UPC' && 'Enter 11 or 12 digits'}
                        {barcodeFormat === 'ITF' && 'Enter even number of digits'}
                        {(barcodeFormat === 'CODE128' || barcodeFormat === 'CODE39') && 'Alphanumeric supported'}
                    </p>
                </div>

                {/* Format */}
                <div className="mb-6">
                    <label className="label-text block mb-3">Barcode Format</label>
                    <div className="grid grid-cols-2 gap-3">
                        {barcodeFormats.map((fmt) => (
                            <button
                                key={fmt.value}
                                onClick={() => setBarcodeFormat(fmt.value)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${barcodeFormat === fmt.value
                                        ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/30'
                                        : 'border-white/20 bg-white/5 hover:border-white/40'
                                    }`}
                            >
                                <div className="font-semibold text-white">{fmt.label}</div>
                                <div className="text-xs text-gray-400 mt-1">{fmt.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Options */}
                <div className="mb-6">
                    <label className="label-text block mb-3">Options</label>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                            <input type="checkbox" checked={includeTitle} onChange={(e) => setIncludeTitle(e.target.checked)} className="checkbox-custom" />
                            <span className="text-gray-200">Include barcode title</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                            <input type="checkbox" checked={showProductDetails} onChange={(e) => setShowProductDetails(e.target.checked)} className="checkbox-custom" />
                            <span className="text-gray-200">Show product details</span>
                        </label>
                    </div>
                </div>

                {/* Custom Title */}
                {includeTitle && (
                    <div className="mb-6">
                        <label className="label-text block mb-2">Custom Title (Optional)</label>
                        <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            placeholder="Leave empty to use barcode value"
                            className="input-field"
                        />
                    </div>
                )}

                {/* Size Controls */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                        <label className="label-text block mb-2">Width: {barcodeWidth}</label>
                        <input type="range" min="1" max="4" step="0.5" value={barcodeWidth}
                            onChange={(e) => setBarcodeWidth(parseFloat(e.target.value))} className="w-full accent-red-500" />
                    </div>
                    <div>
                        <label className="label-text block mb-2">Height: {barcodeHeight}px</label>
                        <input type="range" min="50" max="200" step="10" value={barcodeHeight}
                            onChange={(e) => setBarcodeHeight(parseInt(e.target.value))} className="w-full accent-red-500" />
                    </div>
                </div>

                {/* Generate */}
                <button
                    onClick={generateBarcode}
                    disabled={loading || !barcodeValue.trim()}
                    className="glass-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating…</>
                    ) : (
                        <><FiCheckCircle />Generate Barcode</>
                    )}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">{error}</div>
                )}
            </div>

            {/* Right Panel */}
            <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    <FiDownload className="text-red-500" />
                    Preview &amp; Actions
                </h2>

                <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-8 min-h-[350px] flex flex-col items-center justify-center">
                    {barcodeImage ? (
                        <div className="w-full space-y-4">
                            <div className="bg-white p-6 rounded-xl shadow-2xl">
                                <img src={barcodeImage} alt="Generated Barcode" className="w-full h-auto" />
                            </div>

                            {showProductDetails && (
                                <div className="bg-white/10 p-4 rounded-xl space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-400">Format:</span><span className="text-white font-semibold">{barcodeFormat}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Value:</span><span className="text-white font-semibold">{barcodeValue}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Size:</span><span className="text-white font-semibold">{barcodeWidth}×{barcodeHeight}px</span></div>
                                </div>
                            )}

                            {/* Save */}
                            <button onClick={saveBarcode} disabled={saving}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : <><FiSave />Save Barcode</>}
                            </button>

                            {saveMsg && (
                                <div className={`p-3 rounded-xl text-sm text-center ${saveMsg.startsWith('✅') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                    {saveMsg}
                                </div>
                            )}

                            {/* Download */}
                            <button onClick={downloadBarcode}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                                <FiDownload />Download as .png
                            </button>

                            {/* Print */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label-text block mb-2">Rows</label>
                                    <input type="number" min="1" max="10" value={rows} onChange={(e) => setRows(parseInt(e.target.value) || 1)} className="input-field w-full" />
                                </div>
                                <div>
                                    <label className="label-text block mb-2">Columns</label>
                                    <input type="number" min="1" max="10" value={cols} onChange={(e) => setCols(parseInt(e.target.value) || 1)} className="input-field w-full" />
                                </div>
                            </div>
                            <div className="bg-white/10 p-3 rounded-lg text-sm text-gray-300">
                                <span className="font-semibold">Total barcodes:</span> {rows * cols}
                            </div>
                            <button onClick={() => printMultipleBarcodes(rows, cols)}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                                <FiPrinter />Print
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <BiBarcode className="text-8xl text-white/20 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg">Your barcode will appear here!</p>
                            <p className="text-gray-500 text-sm mt-2">Configure and click "Generate Barcode"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
