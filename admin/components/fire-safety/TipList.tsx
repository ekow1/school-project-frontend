'use client';

import React, { useState } from 'react';
import { Flame, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { fireSafetyTipsApi, ApiResponse } from '@/lib/api/axios';
import toast from 'react-hot-toast';
import { TipForm } from './TipForm';

interface TipListProps {
    isSuperAdmin?: boolean;
}

interface Tip {
    id: string;
    title: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
}

export const TipList: React.FC<TipListProps> = ({ isSuperAdmin = false }) => {
    const [tips, setTips] = useState<Tip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTip, setEditingTip] = useState<Tip | null>(null);
    const [viewingTip, setViewingTip] = useState<Tip | null>(null);

    const fetchTips = async () => {
        try {
            setLoading(true);
            const response = await fireSafetyTipsApi.getAll() as ApiResponse<Tip[]>;
            if (response.success && response.data) {
                setTips(response.data);
            } else {
                toast.error(response.message || 'Failed to fetch tips');
            }
        } catch (error: any) {
            console.error('Error fetching tips:', error);
            toast.error(error.message || 'Error fetching tips');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTips();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tip?')) {
            return;
        }

        try {
            const response = await fireSafetyTipsApi.delete(id) as ApiResponse<void>;
            if (response.success) {
                toast.success(response.message || 'Tip deleted successfully');
                setTips((prev) => prev.filter((tip) => tip.id !== id));
            } else {
                toast.error(response.message || 'Failed to delete tip');
            }
        } catch (error: any) {
            console.error('Error deleting tip:', error);
            toast.error(error.message || 'Failed to delete tip');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingTip(null);
        fetchTips();
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingTip(null);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-red-600" />
                        {isSuperAdmin ? 'National Safety Tips' : 'Fire Safety Tips'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {tips.length} tip{tips.length !== 1 ? 's' : ''} available
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <Flame className="w-4 h-4" />
                    Create Tip
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading tips...</span>
                </div>
            ) : tips.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Flame className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-medium">No tips yet</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Create Tip" to add your first safety tip</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tips.map((tip) => (
                        <div
                            key={tip.id}
                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />
                                        <h3 className="font-semibold text-gray-900 truncate">{tip.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{tip.content}</p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>Created: {formatDate(tip.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => setViewingTip(tip)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <Eye className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button
                                        onClick={() => setEditingTip(tip)}
                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4 text-blue-500" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tip.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {(showForm || editingTip) && (
                <TipForm
                    tip={editingTip || undefined}
                    onSuccess={handleFormSuccess}
                    onCancel={handleFormCancel}
                />
            )}

            {/* View Tip Modal */}
            {viewingTip && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Tip Details</h2>
                            <button
                                onClick={() => setViewingTip(null)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Flame className="w-5 h-5 text-red-500" />
                                <h3 className="text-xl font-semibold text-gray-900">{viewingTip.title}</h3>
                            </div>
                            <div className="flex items-center gap-1 mb-4 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>Created: {formatDate(viewingTip.createdAt)}</span>
                                {viewingTip.updatedAt && (
                                    <>
                                        <span className="mx-1">•</span>
                                        <span>Updated: {formatDate(viewingTip.updatedAt)}</span>
                                    </>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap">{viewingTip.content}</p>
                            </div>
                        </div>
                        <div className="flex justify-end p-4 border-t">
                            <button
                                onClick={() => setViewingTip(null)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TipList;
