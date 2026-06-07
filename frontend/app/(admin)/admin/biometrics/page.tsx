'use client'

import { motion } from 'framer-motion'
import { Brain, Activity, Fingerprint, TrendingUp } from 'lucide-react'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Simulated scatter: dwell time vs flight time per user session
const scatterData = Array.from({ length: 60 }, (_, i) => ({
  dwell: 60 + Math.random() * 60,
  flight: 80 + Math.random() * 80,
  risk: Math.random() > 0.85 ? 'high' : Math.random() > 0.7 ? 'medium' : 'low',
}))

const perUserRisk = [
  { name: 'priya.k', avg: 72, count: 23 },
  { name: 'ravi.m', avg: 15, count: 34 },
  { name: 'sneha.r', avg: 88, count: 12 },
  { name: 'arun.p', avg: 45, count: 19 },
  { name: 'divya.n', avg: 11, count: 41 },
  { name: 'kiran.s', avg: 32, count: 28 },
  { name: 'meera.i', avg: 8, count: 56 },
]

export default function BiometricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Behavioral Biometrics Panel</h1>
        <p className="text-muted text-sm mt-1">ML model insights and per-user behavioral analytics</p>
      </div>

      {/* ML stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Brain, label: 'Trained Profiles', value: '189', sub: 'of 247 users', color: 'text-accent-light' },
          { icon: Activity, label: 'Avg Accuracy', value: '94.2%', sub: 'On trained users', color: 'text-green-400' },
          { icon: Fingerprint, label: 'Anomalies Caught', value: '341', sub: 'Last 30 days', color: 'text-red-400' },
          { icon: TrendingUp, label: 'False Positives', value: '0.8%', sub: 'Industry avg: 4%', color: 'text-cyan-400' },
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
        {/* Scatter plot: dwell vs flight time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-semibold mb-1">Keystroke Dynamics Scatter</h2>
          <p className="text-xs text-muted mb-4">Dwell time vs flight time — clusters show normal behavior, outliers flagged</p>
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <XAxis dataKey="dwell" name="Dwell (ms)" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} label={{ value: 'Dwell Time (ms)', fill: '#6B7280', fontSize: 10, position: 'insideBottom', offset: -2 }} />
              <YAxis dataKey="flight" name="Flight (ms)" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 11 }} />
              <Scatter
                data={scatterData.filter(d => d.risk === 'low')}
                fill="#10B981"
                opacity={0.6}
                name="Low Risk"
              />
              <Scatter
                data={scatterData.filter(d => d.risk === 'medium')}
                fill="#F59E0B"
                opacity={0.7}
                name="Medium Risk"
              />
              <Scatter
                data={scatterData.filter(d => d.risk === 'high')}
                fill="#EF4444"
                opacity={0.9}
                name="High Risk"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Per-user avg risk bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <h2 className="font-semibold mb-1">Top Users by Avg Risk Score</h2>
          <p className="text-xs text-muted mb-4">Average risk score per user across all sessions</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perUserRisk} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 11 }} />
              <Bar
                dataKey="avg"
                radius={[0, 4, 4, 0]}
                fill="#6366F1"
                label={{ position: 'right', fill: '#6B7280', fontSize: 10 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ML model explainer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card border-accent/20">
        <h2 className="font-semibold mb-4">Isolation Forest — How It Works</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            {
              step: '01',
              title: 'Feature Extraction',
              desc: 'Each login produces a feature vector: dwell time, flight time, typing speed, login hour, day of week, and derived ratios.',
            },
            {
              step: '02',
              title: 'Isolation Forest Training',
              desc: 'After 5+ logins, the model learns your "normal" behavior by building random decision trees that isolate data points.',
            },
            {
              step: '03',
              title: 'Anomaly Scoring',
              desc: 'Anomalies are isolated faster (shorter paths). The score is inverted so high = suspicious. Threshold: 0.6 = flag.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-surface rounded-lg p-4">
              <div className="text-3xl font-black text-border font-mono mb-2">{item.step}</div>
              <div className="font-semibold mb-1">{item.title}</div>
              <div className="text-muted text-xs leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
