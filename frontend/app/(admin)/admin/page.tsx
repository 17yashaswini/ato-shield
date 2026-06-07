'use client'

import { motion } from 'framer-motion'
import { Users, Shield, AlertTriangle, Activity, TrendingUp, Lock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const loginActivity = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  logins: Math.floor(Math.random() * 40 + 5),
  flagged: Math.floor(Math.random() * 5),
}))

const riskDistribution = [
  { name: 'Low Risk', value: 68, color: '#10B981' },
  { name: 'Medium Risk', value: 22, color: '#F59E0B' },
  { name: 'High Risk', value: 10, color: '#EF4444' },
]

const recentThreats = [
  { user: 'priya.k@email.com', event: 'High risk login — unfamiliar typing pattern', score: 82, time: '2m ago' },
  { user: 'ravi.m@email.com', event: 'Login from new country: UAE', score: 76, time: '15m ago' },
  { user: 'sneha.r@email.com', event: 'Multiple failed attempts (brute force attempt)', score: 91, time: '1h ago' },
  { user: 'arun.p@email.com', event: 'Session from unregistered device', score: 67, time: '2h ago' },
]

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted text-sm mt-1">Real-time threat intelligence across all users</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: '247', sub: '+12 this week', color: 'text-accent-light', bg: 'bg-accent/10 border-accent/20' },
          { icon: Activity, label: 'Active Sessions', value: '34', sub: 'Right now', color: 'text-cyan-400', bg: 'bg-cyan-900/20 border-cyan-800/50' },
          { icon: AlertTriangle, label: 'Threats Today', value: '7', sub: '3 resolved', color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/50' },
          { icon: Lock, label: 'MFA Adoption', value: '78%', sub: '193 / 247 users', color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/50' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`card border ${card.bg}`}
          >
            <card.icon className={`${card.color} mb-3`} size={20} />
            <div className="text-sm text-muted">{card.label}</div>
            <div className={`text-2xl font-bold font-mono mt-0.5 ${card.color}`}>{card.value}</div>
            <div className="text-xs text-muted mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Login activity chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card lg:col-span-2"
        >
          <h2 className="font-semibold mb-4">Login Activity — Today (Hourly)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={loginActivity}>
              <XAxis dataKey="hour" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="logins" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} name="Logins" />
              <Area type="monotone" dataKey="flagged" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} strokeWidth={2} name="Flagged" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Risk distribution pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card"
        >
          <h2 className="font-semibold mb-4">Risk Distribution</h2>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                {riskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {riskDistribution.map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-muted">{r.name}</span>
                </div>
                <span className="font-mono" style={{ color: r.color }}>{r.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Live threat feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Live Threat Feed</h2>
          <span className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Live
          </span>
        </div>
        <div className="space-y-3">
          {recentThreats.map((threat, i) => (
            <div key={i} className="flex items-start gap-4 py-2 border-b border-border/50 last:border-0">
              <div className="w-8 h-8 bg-red-900/30 border border-red-800/40 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={13} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-red-300">{threat.user}</div>
                <div className="text-xs text-muted">{threat.event}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-red-400 font-mono">{threat.score}</div>
                <div className="text-xs text-muted">{threat.time}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
