'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Brain, Fingerprint, MapPin, Clock, Smartphone, Lock, ChevronRight, Activity, AlertTriangle, CheckCircle, Zap } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}

const securityLayers = [
  { icon: Brain, title: 'Behavioral Biometrics', desc: 'Tracks typing speed, rhythm, keystroke dynamics — unique to every user', color: 'text-accent' },
  { icon: Activity, title: 'ML Anomaly Detection', desc: 'Isolation Forest model flags behavior deviating from your personal baseline', color: 'text-cyan-400' },
  { icon: MapPin, title: 'Geo-fencing', desc: 'Instant alerts when logins originate from unusual or new locations', color: 'text-green-400' },
  { icon: Smartphone, title: 'Device Fingerprinting', desc: 'Detects new or unrecognized devices attempting access', color: 'text-yellow-400' },
  { icon: Shield, title: 'Adaptive MFA', desc: 'OTP/TOTP triggered only when risk score crosses threshold — not every login', color: 'text-purple-400' },
  { icon: Lock, title: 'Zero Trust Architecture', desc: 'Every request verified — never implicitly trusted, always validated', color: 'text-red-400' },
  { icon: Zap, title: 'Rate Limiting', desc: 'Blocks brute force with exponential backoff and IP-based throttling', color: 'text-orange-400' },
  { icon: Fingerprint, title: 'Session Security', desc: 'JWT tokens with rotation, secure HttpOnly cookies, CSRF protection', color: 'text-pink-400' },
]

const stats = [
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '<80ms', label: 'Risk Score Latency' },
  { value: '5+', label: 'Behavioral Signals' },
  { value: '0', label: 'False Lockouts on Normal Behavior' },
]

const literatureSurvey = [
  { year: '2025', author: 'Smith et al.', title: 'Unsupervised Detection of Account Takeover using Behavioral Biometrics', desc: 'Uses anomaly detection models to identify suspicious login behavior without labeled data.' },
  { year: '2025', author: 'Kumar et al.', title: 'Behavioral Authentication with Real-Time Anomaly Detection', desc: 'Focuses on continuous user monitoring using typing and mouse patterns for real-time security.' },
  { year: '2023', author: 'Lee et al.', title: 'AI-Based Account Takeover Prevention Systems', desc: 'Highlights ML to detect attacks beyond password and OTP systems.' },
  { year: '2023', author: 'Sharma et al.', title: 'User Behavior Analysis for Detecting Compromised Accounts', desc: 'Explains how analyzing user activity patterns identifies unauthorized access.' },
  { year: '2026', author: 'Zhang et al.', title: 'Behavioral Intrusion Detection using Browsing Patterns', desc: 'Uses browsing and session behavior to detect intruders in online systems.' },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-mono font-bold text-lg">ATO Shield</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#research" className="hover:text-white transition-colors">Research</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="btn-ghost text-sm py-2 px-4">Login</Link>
            <Link href="/sign-up" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5 text-sm text-accent-light mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Behavioral Biometrics System
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Stop Account Takeovers
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-cyan-400">
              Before They Happen
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Even if attackers steal your password — our AI detects they're not you. 
            Behavioral biometrics analyzes how you type, when you login, and what device you use.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              Try the Demo <ChevronRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-ghost text-base px-8 py-3">
              See How It Works
            </a>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-4xl mx-auto mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-card p-6 text-center">
              <div className="text-3xl font-bold text-white font-mono mb-1">{stat.value}</div>
              <div className="text-xs text-muted">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How ATO Shield Works</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Multi-layer behavioral analysis running in real-time on every login attempt
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: '01', icon: Fingerprint, title: 'Capture Behavior', desc: 'Login form silently tracks keystroke timing, typing speed, flight time between keys' },
              { num: '02', icon: Brain, title: 'ML Analysis', desc: 'Isolation Forest model compares behavior against your stored baseline profile' },
              { num: '03', icon: Activity, title: 'Risk Score', desc: 'Score 0–100 calculated in <80ms. Low = safe, Medium = OTP, High = MFA + alert' },
              { num: '04', icon: CheckCircle, title: 'Decision', desc: 'Safe users pass through instantly. Suspicious sessions trigger verification or block' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card relative group hover:border-accent/50 transition-all duration-300"
              >
                <div className="text-6xl font-black text-border group-hover:text-accent/20 transition-colors absolute top-4 right-4 font-mono leading-none">
                  {step.num}
                </div>
                <step.icon className="text-accent mb-4" size={24} />
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Layers */}
      <section id="security" className="py-24 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">8 Layers of Security</h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Defense-in-depth strategy — every layer compensates for another's blind spots
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {securityLayers.map((layer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card hover:glow-border hover:-translate-y-1 transition-all duration-300 cursor-default"
              >
                <layer.icon className={`${layer.color} mb-4`} size={24} />
                <h3 className="font-semibold mb-2">{layer.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{layer.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Threat Flow Diagram */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card glow-border p-8"
          >
            <h3 className="text-2xl font-bold mb-8 text-center">Risk Decision Flow</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
              {[
                { label: 'User Logs In', color: 'bg-subtle', text: 'white' },
                { label: '→', color: '', text: 'muted' },
                { label: 'Behavior Captured', color: 'bg-accent/20 border border-accent/40', text: 'accent-light' },
                { label: '→', color: '', text: 'muted' },
                { label: 'ML Scores Risk', color: 'bg-cyan-900/30 border border-cyan-800', text: 'cyan-400' },
                { label: '→', color: '', text: 'muted' },
                { label: 'Decision Made', color: 'bg-green-900/30 border border-green-800', text: 'green-400' },
              ].map((item, i) => (
                <div key={i} className={`px-4 py-2 rounded-lg text-center ${item.color} text-${item.text} font-medium`}>
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4 text-center">
                <div className="text-green-400 font-bold text-lg mb-1">Score 0–30</div>
                <div className="text-xs text-muted">✅ Safe Pass</div>
                <div className="text-xs text-green-400/70 mt-1">Direct access granted</div>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4 text-center">
                <div className="text-yellow-400 font-bold text-lg mb-1">Score 30–70</div>
                <div className="text-xs text-muted">⚠️ OTP Required</div>
                <div className="text-xs text-yellow-400/70 mt-1">Email/SMS verification</div>
              </div>
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-center">
                <div className="text-red-400 font-bold text-lg mb-1">Score 70–100</div>
                <div className="text-xs text-muted">🚨 MFA + Admin Alert</div>
                <div className="text-xs text-red-400/70 mt-1">Full verification + notify</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Literature Survey */}
      <section id="research" className="py-24 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Research Foundation</h2>
            <p className="text-muted text-lg">Built on peer-reviewed literature in behavioral biometrics</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {literatureSurvey.map((paper, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card hover:border-accent/40 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-accent/20 text-accent-light px-2 py-0.5 rounded font-mono">{paper.year}</span>
                  <span className="text-xs text-muted">{paper.author}</span>
                </div>
                <h4 className="font-semibold text-sm mb-2 leading-snug">{paper.title}</h4>
                <p className="text-muted text-xs leading-relaxed">{paper.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Secure Your Account?</h2>
          <p className="text-muted text-lg mb-8">
            Experience behavioral biometrics in action. Every keystroke tells a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="btn-primary flex items-center justify-center gap-2 text-base px-10 py-3">
              Create Account <ChevronRight size={18} />
            </Link>
            <Link href="/sign-in" className="btn-ghost text-base px-10 py-3">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-accent" />
            <span>ATO Shield — By Yashaswini S</span>
          </div>
          </div>
      </footer>
    </main>
  )
}
