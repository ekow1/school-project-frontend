'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { fireSafetyTipsApi, ApiResponse } from '@/lib/api/axios';

interface TipFormProps {
    tip?: {
        id: string;
        title: string;
        content: string;
    };
    onSuccess: () => void;
    onCancel: () => void;
}

export const TipForm: React.FC<TipFormProps> = ({ tip, onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!tip?.id);

    // Fetch tip data if editing
    useEffect(() => {
        const fetchTip = async () => {
            if (!tip?.id) return;

            try {
                setFetching(true);
                const response = await fireSafetyTipsApi.getById(tip.id) as ApiResponse<any>;
                if (response.success && response.data) {
                    setTitle(response.data.title);
                    setContent(response.data.content);
                } else {
                    toast.error('Failed to load tip');
                    onCancel();
                }
            } catch (error) {
                console.error('Error fetching tip:', error);
                toast.error('Error loading tip');
                onCancel();
            } finally {
                setFetching(false);
            }
        };

        fetchTip();
    }, [tip?.id, onCancel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        if (!content.trim()) {
            toast.error('Content is required');
            return;
        }

        if (title.length > 200) {
            toast.error('Title cannot exceed 200 characters');
            return;
        }

        setLoading(true);

        try {
            let response: ApiResponse<any>;

            if (tip?.id) {
                // Update existing tip
                response = await fireSafetyTipsApi.update(tip.id, {
                    title: title.trim(),
                    content: content.trim(),
                });
            } else {
                // Create new tip
                response = await fireSafetyTipsApi.create({
                    title: title.trim(),
                    content: content.trim(),
                });
            }

            if (response.success) {
                toast.success(response.message || (tip?.id ? 'Tip updated successfully' : 'Tip created successfully'));
                onSuccess();
            } else {
                toast.error(response.message || 'Failed to save tip');
            }
        } catch (error: any) {
            console.error('Error saving tip:', error);
            toast.error(error.message || 'Failed to save tip');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                <span className="ml-2 text-gray-600">Loading tip...</span>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {tip?.id ? 'Edit Tip' : 'Create New Tip'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Enter tip title"
                            maxLength={200}
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {title.length} / 200 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-vertical"
                            placeholder="Enter tip content"
                            disabled={loading}
                        />
                    </div>

                    {/* Error message */}
                    {(title.length > 200) && (
                        <p className="text-sm text-red-600">Title cannot exceed 200 characters</p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim() || !content.trim()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Saving...' : tip?.id ? 'Update Tip' : 'Create Tip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TipForm;
