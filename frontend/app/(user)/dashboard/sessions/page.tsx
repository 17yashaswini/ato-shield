'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Smartphone, Globe, CheckCircle, AlertTriangle, Lock, Filter } from 'lucide-react'
import { format } from 'date-fns'

const allSessions = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  date: new Date(Date.now() - i * 86400000 * (Math.random() + 0.3)),
  device: ['Chrome / Windows 11', 'Safari / iPhone 15', 'Firefox / macOS', 'Edge / Windows 10'][i % 4],
  location: ['Bengaluru, IN', 'Mumbai, IN', 'Bengaluru, IN', 'Hyderabad, IN'][i % 4],
  ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  status: i === 2 ? 'flagged' : i === 5 ? 'mfa' : 'safe',
  riskScore: i === 2 ? 74 : i === 5 ? 48 : Math.floor(Math.random() * 25 + 5),
  duration: `${Math.floor(Math.random() * 60 + 5)}m`,
}))

const statusBadge = (status: string) => {
  if (status === 'safe') return <span className="badge-low flex items-center gap-1"><CheckCircle size={9} />Safe</span>
  if (status === 'flagged') return <span className="badge-high flex items-center gap-1"><AlertTriangle size={9} />Flagged</span>
  return <span className="badge-medium flex items-center gap-1"><Lock size={9} />MFA</span>
}

export default function SessionsPage() {
  const [filter, setFilter] = useState<'all' | 'safe' | 'flagged' | 'mfa'>('all')

  const filtered = filter === 'all' ? allSessions : allSessions.filter(s => s.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Login History</h1>
          <p className="text-muted text-sm mt-1">Every session, every device, every location</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-muted" />
        {(['all', 'safe', 'flagged', 'mfa'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${
              filter === f ? 'bg-accent text-white' : 'bg-subtle text-muted hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Date & Time</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Device</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Location</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Risk</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Status</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(session => (
                <tr key={session.id} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted whitespace-nowrap">
                    {format(session.date, 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Smartphone size={12} className="text-muted" />
                      <span className="text-xs">{session.device}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Globe size={12} className="text-muted" />
                      <span className="text-xs">{session.location}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-mono font-bold text-xs ${
                      session.riskScore > 70 ? 'text-red-400' : session.riskScore > 30 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {session.riskScore}
                    </span>
                  </td>
                  <td className="px-5 py-3">{statusBadge(session.status)}</td>
                  <td className="px-5 py-3 text-xs text-muted">{session.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
