'use client'

import { motion } from 'framer-motion'
import { Activity, Fingerprint, Clock, Keyboard } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line } from 'recharts'

const keystrokeData = [
  { key: 'a', dwell: 82 }, { key: 's', dwell: 78 }, { key: 'e', dwell: 95 },
  { key: 't', dwell: 71 }, { key: 'i', dwell: 88 }, { key: 'n', dwell: 76 },
  { key: 'o', dwell: 91 }, { key: 'r', dwell: 69 }, { key: 'h', dwell: 84 },
]

const radarData = [
  { subject: 'Typing Speed', A: 78 },
  { subject: 'Dwell Time', A: 65 },
  { subject: 'Flight Time', A: 82 },
  { subject: 'Consistency', A: 90 },
  { subject: 'Pattern Match', A: 88 },
]

const baselineHistory = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  speed: 60 + Math.random() * 30,
  score: 10 + Math.random() * 25,
}))

export default function BehaviorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Behavior Profile</h1>
        <p className="text-muted text-sm mt-1">Your unique behavioral biometric fingerprint</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Keyboard, label: 'Avg Typing Speed', value: '72 CPS', sub: 'Characters per second', color: 'text-accent-light' },
          { icon: Clock, label: 'Avg Dwell Time', value: '84ms', sub: 'Key hold duration', color: 'text-cyan-400' },
          { icon: Activity, label: 'Avg Flight Time', value: '112ms', sub: 'Between keystrokes', color: 'text-green-400' },
          { icon: Fingerprint, label: 'Profile Confidence', value: '94%', sub: 'Based on 23 logins', color: 'text-yellow-400' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card">
            <m.icon className={`${m.color} mb-3`} size={18} />
            <div className="text-xs text-muted">{m.label}</div>
            <div className={`text-2xl font-bold font-mono mt-0.5 ${m.color}`}>{m.value}</div>
            <div className="text-xs text-muted mt-0.5">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Keystroke dwell time chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-semibold mb-4">Per-Key Dwell Time (ms)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={keystrokeData}>
              <XAxis dataKey="key" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="dwell" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <h2 className="font-semibold mb-4">Behavioral Pattern Radar</h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1F2937" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 10 }} />
              <Radar dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Baseline evolution */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
        <h2 className="font-semibold mb-1">Baseline Evolution — Last 14 Days</h2>
        <p className="text-muted text-xs mb-4">As the ML model learns more about you, your profile becomes more accurate</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={baselineHistory}>
            <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="speed" stroke="#06B6D4" strokeWidth={2} dot={false} name="Typing Speed" />
            <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} dot={false} name="Risk Score" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* How ML Works explainer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card border-accent/20">
        <h2 className="font-semibold mb-3">How the ML Model Works</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { phase: 'Phase 1 (New User)', title: 'Rule-Based', desc: 'No data yet — uses rules like new device, new location, unusual hours for risk scoring.' },
            { phase: 'Phase 2 (5+ logins)', title: 'Learning', desc: 'Isolation Forest begins training on your behavior. Baseline profile takes shape.' },
            { phase: 'Phase 3 (20+ logins)', title: 'Mature ML', desc: 'Full anomaly detection. The model can detect impostors with 99%+ accuracy.' },
          ].map((p, i) => (
            <div key={i} className="bg-surface rounded-lg p-4">
              <div className="text-xs text-accent mb-1">{p.phase}</div>
              <div className="font-semibold mb-1">{p.title}</div>
              <div className="text-muted text-xs leading-relaxed">{p.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
