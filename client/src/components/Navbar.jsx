import { BiBarcode } from 'react-icons/bi';
import { FiLogOut, FiShield, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { profile, signOut } = useAuth();

    const isAdmin = profile?.role === 'admin';

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/30 border-b border-white/10 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <BiBarcode className="text-3xl text-red-500" />
                        <span className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                            BarcodeGen
                        </span>
                    </div>

                    {/* User info + role badge + logout */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {isAdmin ? (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
                                    <FiShield className="text-sm" />
                                    Admin
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    <FiUser className="text-sm" />
                                    User
                                </span>
                            )}
                            <span className="hidden sm:block text-sm text-gray-300 max-w-[200px] truncate">
                                {profile?.full_name || profile?.email}
                            </span>
                        </div>

                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-red-400 transition-all duration-300 text-sm font-medium"
                        >
                            <FiLogOut />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
