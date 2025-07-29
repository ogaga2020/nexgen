'use client';

import { useState } from 'react';
import axios from 'axios';

export default function MediaUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('plumbing');
    const [preview, setPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert('Please select a file.');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        try {
            setUploading(true);
            const res = await axios.post('/api/admin/media', formData);
            setUploadedUrl(res.data.url);
        } catch (err) {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6 text-primary">Upload Media</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold">Select Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-field w-full"
                    >
                        <option value="plumbing">Plumbing</option>
                        <option value="electric">Electric</option>
                        <option value="solar">Solar</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 font-semibold">Select File</label>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setFile(file || null);
                            if (file) {
                                setPreview(URL.createObjectURL(file));
                            }
                        }}
                        className="input-field w-full"
                    />
                </div>

                {preview && (
                    <div className="mt-4">
                        <p className="font-semibold mb-2">Preview:</p>
                        {file?.type.startsWith('video') ? (
                            <video src={preview} controls className="w-full rounded shadow" />
                        ) : (
                            <img src={preview} alt="Preview" className="w-full rounded shadow" />
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded disabled:opacity-60"
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>

            {uploadedUrl && (
                <div className="mt-6">
                    <p className="text-green-600 font-semibold">Upload successful!</p>
                    <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
                        View File
                    </a>
                </div>
            )}
        </div>
    );
}
