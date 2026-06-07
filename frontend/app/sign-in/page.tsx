'use client'

import { useState } from 'react'
import { useSignIn, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Eye, EyeOff, AlertTriangle, Loader2, CheckCircle, Activity } from 'lucide-react'
import Link from 'next/link'
import { useBehavioralTracker } from '@/hooks/useBehavioralTracker'
import { behaviorAPI } from '@/lib/api'

export default function SignInPage() {
  const { signIn } = useSignIn()
  const { setActive } = useClerk()
  const router = useRouter()
  const { onKeyDown, onKeyUp, getProfile } = useBehavioralTracker()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState<'credentials' | 'analyzing' | 'mfa' | 'done'>('credentials')
  const [error, setError] = useState('')
  const [riskScore, setRiskScore] = useState<number | null>(null)
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | null>(null)
  const [anomalyFactors, setAnomalyFactors] = useState<string[]>([])
  const [mfaCode, setMfaCode] = useState('')
  const [typingActivity, setTypingActivity] = useState<number[]>([])

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown(e)
    setTypingActivity(prev => [...prev.slice(-19), Date.now()])
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !email || !password) return
    setError('')

    try {
      setStep('analyzing')

      const result = await signIn.create({ identifier: email, password }) as any

if (!result || (result as any).status !== 'complete') {
  setError('Authentication failed. Please check your credentials.')
  setStep('credentials')
  return
}

      const profile = getProfile()
      const now = new Date()

      let riskData
      try {
        riskData = await behaviorAPI.analyze({
          clerk_user_id: result.createdSessionId || '',
          email,
          avg_dwell_time: profile.avgDwellTime,
          avg_flight_time: profile.avgFlightTime,
          typing_speed: profile.typingSpeed,
          total_duration: profile.totalDuration,
          keystroke_count: profile.keystrokes.length,
          user_agent: navigator.userAgent,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          login_hour: now.getHours(),
          login_day_of_week: now.getDay(),
        })
      } catch {
        riskData = { risk_score: 10, risk_level: 'low', anomaly_factors: [], require_mfa: false, session_id: '' }
      }

      setRiskScore(riskData.risk_score)
      setRiskLevel(riskData.risk_level as 'low' | 'medium' | 'high')
      setAnomalyFactors(riskData.anomaly_factors)

      if (riskData.risk_level === 'high' || riskData.require_mfa) {
        setStep('mfa')
      } else {
        await setActive({ session: result.createdSessionId })
        setStep('done')
        setTimeout(() => router.push('/dashboard'), 1200)
      }
    } catch (err: any) {
      setStep('credentials')
      setError(err.errors?.[0]?.longMessage || 'Sign in failed. Please try again.')
    }
  }

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signIn || !mfaCode) return
    setError('')

    try {
      const result = await (signIn as any).attemptFirstFactor({
  strategy: 'email_code',
  code: mfaCode,
}) as any
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setStep('done')
        setTimeout(() => router.push('/dashboard'), 1000)
      }
    } catch {
      setError('Invalid code. Please try again.')
    }
  }

  const riskColor = riskLevel === 'high' ? 'text-red-400' : riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
  const riskBg = riskLevel === 'high' ? 'bg-red-900/20 border-red-800' : riskLevel === 'medium' ? 'bg-yellow-900/20 border-yellow-800' : 'bg-green-900/20 border-green-800'

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
          {step === 'credentials' && (
            <motion.div key="credentials" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card glow-border">
              <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
              <p className="text-muted text-sm mb-6">Your behavioral signature is your second password</p>

              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
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
                      onKeyDown={handlePasswordKeyDown}
                      onKeyUp={onKeyUp}
                      className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {typingActivity.length > 0 && (
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={12} className="text-accent" />
                      <span className="text-xs text-muted">Behavioral tracking active</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-8">
                      {typingActivity.map((_, i) => (
                        <div key={i} className="flex-1 bg-accent/60 rounded-sm" style={{ height: `${20 + (i / typingActivity.length) * 80}%` }} />
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-2">
                  <Shield size={16} /> Sign In Securely
                </button>
              </form>

              <p className="text-center text-sm text-muted mt-4">
                Don't have an account?{' '}
                <Link href="/sign-up" className="text-accent-light hover:underline">Sign up</Link>
              </p>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card glow-border text-center py-12">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="animate-spin text-accent" size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2">Analyzing Behavior</h2>
              <p className="text-muted text-sm">Running ML anomaly detection on your typing patterns...</p>
              <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
                {['Checking keystroke dynamics...', 'Verifying device fingerprint...', 'Analyzing login context...'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted">
                    <Loader2 className="animate-spin" size={10} /> {item}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'mfa' && (
            <motion.div key="mfa" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card glow-border">
              {riskScore !== null && (
                <div className={`${riskBg} border rounded-lg p-4 mb-6`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={16} className={riskColor} />
                      <span className={`font-semibold text-sm ${riskColor}`}>
                        {riskLevel === 'high' ? 'High Risk Detected' : 'Suspicious Activity'}
                      </span>
                    </div>
                    <span className={`font-mono font-bold ${riskColor}`}>{riskScore}/100</span>
                  </div>
                  {anomalyFactors.length > 0 && (
                    <div className="text-xs text-muted mt-1 space-y-1">
                      {anomalyFactors.map((f, i) => <div key={i}>• {f}</div>)}
                    </div>
                  )}
                </div>
              )}

              <h2 className="text-xl font-bold mb-1">Verify Your Identity</h2>
              <p className="text-muted text-sm mb-6">We've sent a verification code to <strong className="text-white">{email}</strong></p>

              {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

              <form onSubmit={handleMFASubmit} className="space-y-4">
                <input
                  type="text"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-accent"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <button type="submit" className="btn-primary w-full py-3">Verify & Continue</button>
              </form>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card glow-border text-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2">Identity Confirmed</h2>
              <p className="text-muted text-sm">Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}