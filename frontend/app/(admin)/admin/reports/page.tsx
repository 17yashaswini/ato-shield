'use client'

import { motion } from 'framer-motion'
import { Download, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'

const weeklyData = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  total: Math.floor(Math.random() * 200 + 100),
  flagged: Math.floor(Math.random() * 30 + 5),
  blocked: Math.floor(Math.random() * 5),
  newUsers: Math.floor(Math.random() * 20 + 5),
}))

const mfaAdoption = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  adoption: 40 + i * 1.3 + Math.random() * 5,
}))

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted text-sm mt-1">Security trends and system performance</p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-sm py-2">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Logins (30d)', value: '4,821', trend: '+12%', up: true },
          { label: 'Threats Blocked', value: '127', trend: '-8%', up: false },
          { label: 'MFA Triggers', value: '341', trend: '+3%', up: true },
          { label: 'Avg Risk Score', value: '24.3', trend: '-15%', up: false },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="card">
            <div className="text-xs text-muted mb-1">{s.label}</div>
            <div className="text-2xl font-bold font-mono">{s.value}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${s.up ? 'text-green-400' : 'text-red-400'}`}>
              {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {s.trend} vs last month
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-semibold mb-4">Weekly Login & Threat Activity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="total" fill="#6366F1" radius={[3, 3, 0, 0]} name="Total Logins" />
              <Bar dataKey="flagged" fill="#EF4444" radius={[3, 3, 0, 0]} name="Flagged" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* MFA adoption trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <h2 className="font-semibold mb-4">MFA Adoption Rate (30 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mfaAdoption}>
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v.toFixed(1)}%`, 'Adoption']} />
              <Area type="monotone" dataKey="adoption" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
