'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'

const mockLogs = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  email: ['priya.k@email.com', 'ravi.m@email.com', 'sneha.r@email.com', 'arun.p@email.com', 'divya.n@email.com'][i % 5],
  timestamp: new Date(Date.now() - i * 3600000 * 2),
  ip: `203.${i + 1}.${i * 3}.1`,
  device: ['Chrome / Windows', 'Safari / iPhone', 'Firefox / Mac', 'Edge / Windows', 'Chrome / Android'][i % 5],
  location: ['Bengaluru, IN', 'Mumbai, IN', 'Delhi, IN', 'Hyderabad, IN', 'Chennai, IN'][i % 5],
  riskScore: [12, 74, 18, 45, 91, 8, 33, 67][i % 8],
  riskLevel: ['low', 'high', 'low', 'medium', 'high', 'low', 'medium', 'high'][i % 8] as 'low' | 'medium' | 'high',
  mfaRequired: [false, true, false, true, true, false, true, true][i % 8],
  duration: `${Math.floor(Math.random() * 45 + 5)}m`,
}))

const levelBadge = (level: string) => {
  if (level === 'high') return <span className="badge-high">{level}</span>
  if (level === 'medium') return <span className="badge-medium">{level}</span>
  return <span className="badge-low">{level}</span>
}

export default function AdminLogsPage() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  const filtered = mockLogs.filter(l => {
    const matchSearch = l.email.includes(search) || l.ip.includes(search)
    const matchLevel = levelFilter === 'all' || l.riskLevel === levelFilter
    return matchSearch && matchLevel
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Session Logs</h1>
          <p className="text-muted text-sm mt-1">Complete audit trail of all login events</p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-sm py-2">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email or IP..."
            className="w-full bg-surface border border-border rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-muted" />
          {(['all', 'low', 'medium', 'high'] as const).map(f => (
            <button
              key={f}
              onClick={() => setLevelFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-all ${
                levelFilter === f ? 'bg-accent text-white' : 'bg-subtle text-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Timestamp', 'User', 'IP Address', 'Device', 'Location', 'Risk', 'MFA', 'Duration'].map(h => (
                  <th key={h} className="text-left text-xs text-muted font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-border/40 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">
                    {format(log.timestamp, 'MMM d, HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3 text-xs">{log.email}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted">{log.ip}</td>
                  <td className="px-4 py-3 text-xs text-muted">{log.device}</td>
                  <td className="px-4 py-3 text-xs text-muted">{log.location}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {levelBadge(log.riskLevel)}
                      <span className={`text-xs font-mono font-bold ${
                        log.riskLevel === 'high' ? 'text-red-400' : log.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>{log.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{log.mfaRequired ? '✅ Yes' : '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted">{log.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
