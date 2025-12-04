import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from './supabaseClient'

export default function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        ;(async () => {
            try {
                // This reads session info from the URL after OAuth redirect
                const { data, error } = await supabase.auth.getSession()
                if (error) {
                    console.error('Auth callback error', error)
                    navigate('/login')
                    return
                }

                const session = data?.session
                if (session) {
                    // Persist the access token and user metadata
                    localStorage.setItem('auth_token', session.access_token)
                    try {
                        const userMeta = session.user.user_metadata ?? session.user
                        localStorage.setItem('user', JSON.stringify(userMeta))
                    } catch (e) {
                        console.warn('Could not parse user metadata', e)
                    }

                    navigate('/dashboard')
                } else {
                    navigate('/login')
                }
            } catch (e) {
                console.error('Unexpected error processing auth callback', e)
                navigate('/login')
            }
        })()
    }, [])

    return (
        <div className="p-6 text-center">
            Completing sign-in…
        </div>
    )
}
