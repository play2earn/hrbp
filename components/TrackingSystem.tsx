import React, { useState } from 'react';
import { api } from '../services/api';
import { Button } from './UIComponents';
import { Search, Loader2, CheckCircle2, Clock, XCircle, FileText, X } from 'lucide-react';

interface TrackingSystemProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function TrackingSystem({ isOpen, onClose }: TrackingSystemProps) {
    const [trackingId, setTrackingId] = useState('');
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingId.trim()) return;

        setLoading(true);
        setError('');
        setStatus(null);

        try {
            const { data, error } = await api.trackApplication(trackingId.trim());

            if (error) {
                // RPC returns specific error object structure sometimes, or standard PostgrestError
                console.error(error);
                setError('Application not found or invalid ID.');
            } else if (data && (data as any).error) {
                setError((data as any).error);
            } else {
                setStatus(data);
            }
        } catch (err) {
            console.error(err);
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Interview': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Offer': return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'Hired': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'Pending': return <Clock className="w-5 h-5" />;
            case 'Rejected': return <XCircle className="w-5 h-5" />;
            case 'Hired':
            case 'Offer': return <CheckCircle2 className="w-5 h-5" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Search className="w-5 h-5 text-indigo-600" />
                        Check Application Status
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleTrack} className="mb-6 relative">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tracking ID</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                                placeholder="e.g. a1b2-c3d4..."
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono text-sm"
                            />
                            <div className="absolute right-2 top-2">
                                <Button type="submit" disabled={loading} size="sm" className="h-8 w-8 p-0 rounded-lg flex items-center justify-center">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </form>

                    {/* Result Area */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                            <XCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {status && (
                        <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden animate-in slide-in-from-bottom-2">
                            <div className={`p-4 border-b flex items-center gap-3 ${getStatusColor(status.status)} bg-opacity-20`}>
                                {getStatusIcon(status.status)}
                                <span className="font-bold text-lg">{status.status}</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Applicant</p>
                                    <p className="font-medium text-slate-900">{status.full_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Position</p>
                                        <p className="font-medium text-slate-900">{status.position}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Department</p>
                                        <p className="font-medium text-slate-900">{status.department}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100">
                                    <p className="text-xs text-gray-400">Last Updated: {new Date(status.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
