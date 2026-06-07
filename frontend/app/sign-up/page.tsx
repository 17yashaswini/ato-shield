'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Eye, EyeOff, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useBehavioralTracker } from '@/hooks/useBehavioralTracker'

export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  const { onKeyDown, onKeyUp, getProfile } = useBehavioralTracker()

  const [step, setStep] = useState<'register' | 'verify' | 'done'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError('')
    setLoading(true)

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep('verify')
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setError('')
    setLoading(true)

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verifyCode })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setStep('done')
        setTimeout(() => router.push('/dashboard'), 1200)
      }
    } catch {
      setError('Invalid verification code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold font-mono">ATO Shield</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card glow-border"
            >
              <h1 className="text-2xl font-bold mb-1">Create Account</h1>
              <p className="text-muted text-sm mb-6">Your typing style becomes your unique identity</p>

              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm text-muted mb-1.5 block">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="Yashaswini S"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-muted mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-muted mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={onKeyDown}
                      onKeyUp={onKeyUp}
                      className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="Min 8 characters"
                      minLength={8}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="bg-surface/50 border border-border rounded-lg p-3 text-xs text-muted">
                  🔐 As you type, ATO Shield begins learning your behavioral profile for future protection.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                  Create Secure Account
                </button>
              </form>

              <p className="text-center text-sm text-muted mt-4">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-accent-light hover:underline">Sign in</Link>
              </p>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card glow-border"
            >
              <h2 className="text-xl font-bold mb-1">Verify your email</h2>
              <p className="text-muted text-sm mb-6">
                Check <strong className="text-white">{email}</strong> for a 6-digit code
              </p>

              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-accent"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                  Verify Email
                </button>
              </form>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card glow-border text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Account Created!</h2>
              <p className="text-muted text-sm">Setting up your behavioral profile...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
