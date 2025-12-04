import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
        >
            <div className="theme-toggle-icon">
                {isDarkMode ? (
                    <Sun 
                        size={20} 
                        className="theme-icon sun"
                    />
                ) : (
                    <Moon 
                        size={20} 
                        className="theme-icon moon"
                    />
                )}
            </div>
        </button>
    );
};

export default ThemeToggle;