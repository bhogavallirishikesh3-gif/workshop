import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { RestaurantInfo } from '../types.js';
import { QrCode, Download, Printer, ExternalLink, Sparkles, Check, Copy } from 'lucide-react';
import { playActionBlip } from '../utils/audio.js';

interface AdminQRGeneratorProps {
  restaurantInfo: RestaurantInfo;
  onTestTableOrder: (table: string) => void;
}

export const AdminQRGenerator: React.FC<AdminQRGeneratorProps> = ({
  restaurantInfo,
  onTestTableOrder
}) => {
  const [selectedTable, setSelectedTable] = useState<string>(restaurantInfo.tables[0] || 'Table 1');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchQRs, setBatchQRs] = useState<{ table: string; dataUrl: string }[]>([]);
  const standeeRef = useRef<HTMLDivElement>(null);

  // Compute table URL
  const getTableUrl = (table: string) => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin + window.location.pathname;
    return `${base}?table=${encodeURIComponent(table)}`;
  };

  const currentUrl = getTableUrl(selectedTable);

  // Generate QR for single table
  useEffect(() => {
    if (!selectedTable) return;
    const url = getTableUrl(selectedTable);
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    })
      .then((dataUri) => {
        setQrDataUrl(dataUri);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });
  }, [selectedTable]);

  // Generate batch QRs
  useEffect(() => {
    if (!batchMode) return;
    Promise.all(
      restaurantInfo.tables.map(async (t) => {
        const url = getTableUrl(t);
        const dataUrl = await QRCode.toDataURL(url, {
          width: 280,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' },
          errorCorrectionLevel: 'M'
        });
        return { table: t, dataUrl };
      })
    ).then((res) => {
      setBatchQRs(res);
    });
  }, [batchMode, restaurantInfo.tables]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    playActionBlip();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-${selectedTable.replace(/\s+/g, '_')}.png`;
    link.href = qrDataUrl;
    link.click();
    playActionBlip();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">Table QR Code Generator</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and print unique dining QR codes mapped directly to tables or counters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setBatchMode(!batchMode);
              playActionBlip();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              batchMode
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {batchMode ? 'Single Table View' : 'Batch All Tables View'}
          </button>
        </div>
      </div>

      {!batchMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Table Selection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Table / Location
              </label>
              
              <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                {restaurantInfo.tables.map((tbl) => (
                  <button
                    key={tbl}
                    onClick={() => {
                      setSelectedTable(tbl);
                      playActionBlip();
                    }}
                    className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                      selectedTable === tbl
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>

              {/* Target Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Menu URL
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="bg-transparent text-xs text-slate-600 font-mono flex-1 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onTestTableOrder(selectedTable)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Simulate Customer Scan for {selectedTable}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownload}
                    className="py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Print Standee</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>How QR Ordering Works</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                When diners scan this QR with their iOS or Android camera, your digital menu opens with <strong>{selectedTable}</strong> automatically locked in. Orders placed go straight to your live KDS screen!
              </p>
            </div>
          </div>

          {/* Printable Standee Preview Column */}
          <div className="lg:col-span-7 flex justify-center">
            <div
              ref={standeeRef}
              className="w-full max-w-sm bg-white p-7 rounded-3xl border-2 border-slate-300 shadow-xl flex flex-col items-center text-center space-y-4 print:border-none print:shadow-none"
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold tracking-widest uppercase text-amber-700">
                  Welcome to
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 leading-tight">
                  {restaurantInfo.name}
                </h3>
                <p className="text-xs text-slate-500 italic">
                  {restaurantInfo.tagline}
                </p>
              </div>

              {/* Table Marker Badge */}
              <div className="px-5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold font-mono tracking-wider shadow-sm">
                {selectedTable.toUpperCase()}
              </div>

              {/* QR Code Container */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-inner">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${selectedTable}`}
                    className="w-52 h-52 object-contain"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center bg-slate-50 text-slate-400">
                    <QrCode className="w-12 h-12 stroke-[1]" />
                  </div>
                )}
              </div>

              {/* Scan instructions */}
              <div className="space-y-1 text-slate-700">
                <p className="text-xs font-bold text-slate-900">
                  Scan to View Menu &amp; Order
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                  Open your camera, point at the code, and tap the notification link to place your order right from your seat.
                </p>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium">
                <span>Fast Table Service</span>
                <span>·</span>
                <span>Instant Kitchen Tickets</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Batch All Tables Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Generating printable standees for all {restaurantInfo.tables.length} tables:
            </span>
            <button
              onClick={handlePrint}
              className="py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print All Standees</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {batchQRs.map((b) => (
              <div
                key={b.table}
                className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-2 shadow-xs"
              >
                <div className="text-xs font-bold text-slate-900">{b.table}</div>
                <img src={b.dataUrl} alt={b.table} className="w-36 h-36 mx-auto object-contain" />
                <p className="text-[10px] text-slate-500">Scan to Order</p>
                <button
                  onClick={() => onTestTableOrder(b.table)}
                  className="text-[11px] text-amber-700 hover:underline font-semibold block mx-auto"
                >
                  Test Scan →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
