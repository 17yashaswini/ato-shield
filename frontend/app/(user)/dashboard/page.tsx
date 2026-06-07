'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Shield, Clock, Smartphone, AlertTriangle, CheckCircle, Activity, MapPin, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { userAPI } from '@/lib/api'

const mockSessions = [
  { id: 1, date: new Date(), device: 'Chrome / Windows', location: 'Bengaluru, IN', status: 'safe', riskScore: 12 },
  { id: 2, date: new Date(Date.now() - 86400000), device: 'Safari / iPhone', location: 'Bengaluru, IN', status: 'safe', riskScore: 18 },
  { id: 3, date: new Date(Date.now() - 172800000), device: 'Chrome / Windows', location: 'Bengaluru, IN', status: 'flagged', riskScore: 74 },
  { id: 4, date: new Date(Date.now() - 259200000), device: 'Firefox / Mac', location: 'Mumbai, IN', status: 'mfa', riskScore: 45 },
]

const mockRiskHistory = [
  { day: 'Mon', score: 15 },
  { day: 'Tue', score: 12 },
  { day: 'Wed', score: 74 },
  { day: 'Thu', score: 45 },
  { day: 'Fri', score: 20 },
  { day: 'Sat', score: 10 },
  { day: 'Sun', score: 8 },
]

export default function DashboardOverview() {
  const { user } = useUser()
  const [sessions, setSessions] = useState(mockSessions)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName || 'User'} 👋
        </h1>
        <p className="text-muted text-sm mt-1">
          Last login: {format(new Date(), 'PPp')} · Your account is protected
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: 'Security Status', value: 'Protected', sub: 'All systems active', color: 'text-green-400', bg: 'bg-green-900/20 border-green-800/60' },
          { icon: Activity, label: 'Avg Risk Score', value: '26/100', sub: 'Low risk profile', color: 'text-accent-light', bg: 'bg-accent/10 border-accent/20' },
          { icon: Clock, label: 'Last Login', value: 'Just now', sub: 'Bengaluru, IN', color: 'text-cyan-400', bg: 'bg-cyan-900/20 border-cyan-800/60' },
          { icon: Lock, label: 'MFA Status', value: 'Enabled', sub: 'Email OTP active', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/60' },
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
            <div className={`text-xl font-bold mt-0.5 ${card.color}`}>{card.value}</div>
            <div className="text-xs text-muted mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Risk history chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="font-semibold mb-4">Risk Score — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={mockRiskHistory}>
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ fill: '#6366F1', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            High spike on Wednesday — MFA was triggered
          </div>
        </motion.div>

        {/* Recent sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card"
        >
          <h2 className="font-semibold mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {sessions.map(session => (
              <div key={session.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center flex-shrink-0">
                  <Smartphone size={14} className="text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{session.device}</div>
                  <div className="text-xs text-muted flex items-center gap-1">
                    <MapPin size={10} /> {session.location} · {format(session.date, 'MMM d, h:mm a')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted">{session.riskScore}</span>
                  {session.status === 'safe' && <CheckCircle size={14} className="text-green-400" />}
                  {session.status === 'flagged' && <AlertTriangle size={14} className="text-red-400" />}
                  {session.status === 'mfa' && <Lock size={14} className="text-yellow-400" />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Security checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <h2 className="font-semibold mb-4">Security Checklist</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { label: 'Email MFA enabled', done: true },
            { label: 'Behavioral baseline established', done: true },
            { label: 'Strong password set', done: true },
            { label: 'Device fingerprint registered', done: true },
            { label: 'TOTP authenticator (optional)', done: false },
            { label: 'Backup recovery codes saved', done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.done
                ? <CheckCircle size={14} className="text-green-400" />
                : <div className="w-3.5 h-3.5 rounded-full border border-border" />
              }
              <span className={item.done ? 'text-white' : 'text-muted'}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
