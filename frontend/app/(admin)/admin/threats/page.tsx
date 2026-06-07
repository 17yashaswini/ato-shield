'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Clock, MapPin, Smartphone, Activity } from 'lucide-react'
import { format } from 'date-fns'

const threats = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  user: ['priya.k@email.com', 'ravi.m@email.com', 'unknown@email.com', 'sneha.r@email.com', 'arun.p@email.com'][i % 5],
  type: ['Behavioral Anomaly', 'New Location', 'Brute Force', 'New Device', 'Impossible Travel'][i % 5],
  score: [82, 76, 91, 67, 88][i % 5],
  level: ['high', 'high', 'high', 'medium', 'high'][i % 5] as 'high' | 'medium',
  location: ['Mumbai, IN', 'Dubai, UAE', 'Unknown', 'Hyderabad, IN', 'London, UK'][i % 5],
  device: ['Firefox / Unknown OS', 'Chrome / Android', 'Bot', 'Safari / iPhone', 'Chrome / Windows'][i % 5],
  time: new Date(Date.now() - i * 1800000),
  resolved: i > 5,
}))

export default function ThreatsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Threat Feed</h1>
          <p className="text-muted text-sm mt-1">Real-time suspicious activity across all accounts</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-red-400 border border-red-800/40 bg-red-900/10 px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Live monitoring
        </div>
      </div>

      {/* Threat stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Today', value: '23', color: 'text-white' },
          { label: 'High Risk', value: '7', color: 'text-red-400' },
          { label: 'Medium Risk', value: '11', color: 'text-yellow-400' },
          { label: 'Resolved', value: '16', color: 'text-green-400' },
        ].map((s, i) => (
          <div key={i} className="card text-center">
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Threat list */}
      <div className="space-y-3">
        {threats.map((threat, i) => (
          <motion.div
            key={threat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`card border ${
              threat.resolved ? 'opacity-50 border-border' :
              threat.level === 'high' ? 'border-red-800/60 bg-red-900/10' : 'border-yellow-800/50 bg-yellow-900/10'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                threat.level === 'high' ? 'bg-red-900/40 border border-red-700' : 'bg-yellow-900/30 border border-yellow-700'
              }`}>
                <AlertTriangle size={15} className={threat.level === 'high' ? 'text-red-400' : 'text-yellow-400'} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-sm">{threat.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-mono font-bold ${
                    threat.level === 'high' ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
                  }`}>
                    {threat.score}/100
                  </span>
                  {threat.resolved && (
                    <span className="badge-low text-xs">Resolved</span>
                  )}
                </div>
                <div className="text-xs text-muted mt-1">{threat.user}</div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-muted/70">
                  <span className="flex items-center gap-1"><MapPin size={9} />{threat.location}</span>
                  <span className="flex items-center gap-1"><Smartphone size={9} />{threat.device}</span>
                  <span className="flex items-center gap-1"><Clock size={9} />{format(threat.time, 'HH:mm')}</span>
                </div>
              </div>

              {!threat.resolved && (
                <div className="flex gap-2 flex-shrink-0">
                  <button className="text-xs bg-red-900/30 border border-red-700 text-red-400 px-2 py-1 rounded hover:bg-red-900/50 transition-colors">
                    Block
                  </button>
                  <button className="text-xs bg-subtle border border-border text-muted px-2 py-1 rounded hover:text-white transition-colors">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
