import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiMoon, FiSun } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check for saved theme preference or default to system
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <nav className="glass border-b border-slate-200 dark:border-dark-border px-6 py-4">
            <div className="flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="text-2xl font-bold gradient-text">AI Chat Portal</div>
                </Link>

                <div className="flex items-center gap-4">
                    <Link
                        to="/analysis"
                        className="btn-ghost"
                    >
                        Analytics
                    </Link>

                    <button
                        onClick={toggleDarkMode}
                        className="btn-ghost"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-dark-border">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white">
                                <FiUser size={16} />
                            </div>
                            <span className="text-sm font-medium">{user?.username}</span>
                        </div>

                        <button
                            onClick={logout}
                            className="btn-ghost text-red-600 dark:text-red-400"
                            aria-label="Logout"
                        >
                            <FiLogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
