import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface GooglePayload {
    name: string
    email: string
    picture: string
}

import supabase from './supabaseClient'

export default function AuthPage() {
    const [user, setUser] = useState<GooglePayload | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const signInWithGoogle = async () => {
        setIsLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        })

        if (error) {
            console.error('Supabase OAuth error', error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main content */}
            <div className="relative w-full max-w-md">
                {!user ? (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-[1.00] border border-white/20">
                        {/* Logo/Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                PharmaAI
                            </h1>
                            <p className="text-gray-600 text-sm">
                                Pharmaceutical Intelligence Platform
                            </p>
                        </div>

                        {/* Welcome text */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
                                Welcome Back
                            </h2>
                            <p className="text-gray-600 text-center text-sm">
                                Sign in to access your pharmaceutical insights
                            </p>
                        </div>

                        {/* Google / Supabase Login Button */}
                        <div className="flex justify-center mb-6">
                            <div className="transform transition-all duration-200 hover:scale-105">
                                <button
                                    onClick={signInWithGoogle}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M21.35 11.1h-9.17v2.92h5.26c-.22 1.34-1.3 3.92-5.26 3.92-3.16 0-5.74-2.61-5.74-5.82s2.58-5.82 5.74-5.82c1.8 0 3.01.77 3.7 1.44l2.52-2.43C17.7 3.14 15.7 2 12.18 2 6.95 2 2.86 6.37 2.86 11.98s4.09 9.98 9.32 9.98c5.38 0 8.94-3.78 8.94-9.28 0-.63-.07-1.08-.77-1.58z" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        {/* <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Secure Authentication</span>
                            </div>
                        </div> */}

                        {/* Features */}
                        {/* <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Real-time pharmaceutical intelligence</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>IQVIA market data analysis</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>AI-powered insights & reports</span>
                            </div>
                        </div> */}

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-500">
                                By signing in, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 transform transition-all duration-300 border border-white/20">
                        {/* Success animation */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                Welcome, {user.name}!
                            </h3>
                            <p className="text-gray-600 text-sm mb-6">
                                Authentication successful
                            </p>
                        </div>

                        {/* User info card */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <img
                                        src={user.picture}
                                        alt="profile"
                                        className="w-16 h-16 rounded-full ring-4 ring-white shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{user.name}</h4>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animation-delay-400"></div>
                            </div>
                        )}

                        <p className="text-center text-gray-600 text-sm">
                            Redirecting to dashboard...
                        </p>
                    </div>
                )}
            </div>

            {/* Add custom animations */}
            <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
            `}</style>
        </div>
    )
}
