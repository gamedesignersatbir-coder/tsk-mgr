import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export function Profile() {
    const [user, setUser] = useState<{ id: string; email: string } | null>(null);
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser({ id: user.id, email: user.email || '' });
                // Try to load existing profile picture
                const { data } = supabase.storage
                    .from('profile-pictures')
                    .getPublicUrl(`${user.id}/avatar`);

                // Check if image exists by trying to fetch it
                try {
                    const response = await fetch(data.publicUrl, { method: 'HEAD' });
                    if (response.ok) {
                        setProfilePicUrl(data.publicUrl + `?t=${Date.now()}`);
                    }
                } catch {
                    // Image doesn't exist yet
                }
            }
        };
        getUser();
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const filePath = `${user.id}/avatar`;

            const { error: uploadError } = await supabase.storage
                .from('profile-pictures')
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type,
                });

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data } = supabase.storage
                .from('profile-pictures')
                .getPublicUrl(filePath);

            setProfilePicUrl(data.publicUrl + `?t=${Date.now()}`);
        } catch (err: any) {
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 font-display">Profile</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="text-slate-500 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                </div>

                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-8">
                    {/* Avatar Preview */}
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-blue-200 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white">
                            {profilePicUrl ? (
                                <img
                                    src={profilePicUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="material-symbols-outlined text-5xl text-primary/50">
                                    person
                                </span>
                            )}
                        </div>

                        {uploading && (
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white animate-spin">
                                    progress_activity
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Upload Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-md hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">upload</span>
                        {uploading ? 'Uploading...' : 'Upload Profile Picture'}
                    </button>

                    {error && (
                        <p className="mt-4 text-red-500 text-sm">{error}</p>
                    )}
                </div>

                {/* User Info */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="text-slate-800 font-medium">{user?.email || 'Loading...'}</p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Sign Out
                </button>
            </div>
        </div>
    );
}
