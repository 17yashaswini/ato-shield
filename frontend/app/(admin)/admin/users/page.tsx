'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield, AlertTriangle, Lock, Unlock, ChevronDown, CheckCircle } from 'lucide-react'

const mockUsers = Array.from({ length: 15 }, (_, i) => ({
  id: `user_${i + 1}`,
  name: ['Priya Kumar', 'Ravi Menon', 'Sneha Rao', 'Arun Patel', 'Divya Nair', 'Kiran Sharma', 'Meera Iyer', 'Sanjay Reddy', 'Anita Joshi', 'Vijay Singh', 'Pooja Mishra', 'Rohit Das', 'Lakshmi Nair', 'Amit Verma', 'Deepa Pillai'][i],
  email: [`priya.k`, `ravi.m`, `sneha.r`, `arun.p`, `divya.n`, `kiran.s`, `meera.i`, `sanjay.r`, `anita.j`, `vijay.s`, `pooja.m`, `rohit.d`, `lakshmi.n`, `amit.v`, `deepa.p`][i] + '@email.com',
  riskScore: [82, 15, 91, 67, 12, 34, 8, 76, 23, 54, 9, 18, 42, 11, 61][i],
  mfaEnabled: [false, true, true, false, true, true, true, false, true, true, true, false, true, true, false][i],
  status: [true, true, true, true, true, true, true, false, true, true, true, true, true, true, true][i],
  lastLogin: new Date(Date.now() - i * 3600000 * 8),
  sessions: Math.floor(Math.random() * 50 + 10),
}))

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = mockUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const riskColor = (score: number) =>
    score > 70 ? 'text-red-400' : score > 30 ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Users</h1>
          <p className="text-muted text-sm mt-1">{mockUsers.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Users table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs text-muted font-medium px-5 py-3">User</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Risk Score</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">MFA</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Sessions</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Status</th>
                <th className="text-left text-xs text-muted font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr
                  key={user.id}
                  className="border-b border-border/50 hover:bg-surface/50 transition-colors cursor-pointer"
                  onClick={() => setSelected(selected === user.id ? null : user.id)}
                >
                  <td className="px-5 py-3">
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-subtle rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${user.riskScore > 70 ? 'bg-red-400' : user.riskScore > 30 ? 'bg-yellow-400' : 'bg-green-400'}`}
                          style={{ width: `${user.riskScore}%` }}
                        />
                      </div>
                      <span className={`font-mono text-xs font-bold ${riskColor(user.riskScore)}`}>{user.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {user.mfaEnabled
                      ? <span className="badge-low flex items-center gap-1 w-fit"><CheckCircle size={9} />On</span>
                      : <span className="badge-high flex items-center gap-1 w-fit"><AlertTriangle size={9} />Off</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-xs text-muted font-mono">{user.sessions}</td>
                  <td className="px-5 py-3">
                    {user.status
                      ? <span className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" />Active</span>
                      : <span className="text-xs text-red-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-400 rounded-full" />Blocked</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors border border-yellow-800/40 px-2 py-1 rounded">
                        Force MFA
                      </button>
                      <button className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-800/40 px-2 py-1 rounded">
                        {user.status ? 'Block' : 'Unblock'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
