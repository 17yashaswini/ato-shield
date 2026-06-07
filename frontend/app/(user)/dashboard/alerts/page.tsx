'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, MapPin, Smartphone, Clock, CheckCircle, Bell } from 'lucide-react'
import { format } from 'date-fns'

const alerts = [
  {
    id: 1,
    type: 'high',
    title: 'High Risk Login Detected',
    desc: 'Login attempt from an unrecognized typing pattern. MFA was triggered.',
    time: new Date(Date.now() - 172800000),
    detail: 'Risk score: 74/100 · Device: Firefox / macOS · Location: Mumbai, IN',
    resolved: true,
  },
  {
    id: 2,
    type: 'medium',
    title: 'New Device Detected',
    desc: 'Login from Safari / iPhone 15 — first time this device was used.',
    time: new Date(Date.now() - 432000000),
    detail: 'OTP verification was required and passed successfully.',
    resolved: true,
  },
  {
    id: 3,
    type: 'medium',
    title: 'Unusual Login Hour',
    desc: 'Login at 3:17 AM — outside your normal activity window.',
    time: new Date(Date.now() - 604800000),
    detail: 'Risk score: 45/100 · Location: Bengaluru, IN',
    resolved: true,
  },
  {
    id: 4,
    type: 'low',
    title: 'New Location (Same City)',
    desc: 'Login from a slightly different IP than usual within Bengaluru.',
    time: new Date(Date.now() - 864000000),
    detail: 'Risk score: 22/100 · Marked as safe after behavioral verification.',
    resolved: true,
  },
]

const iconForType = (type: string) => {
  if (type === 'high') return <AlertTriangle size={16} className="text-red-400" />
  if (type === 'medium') return <Bell size={16} className="text-yellow-400" />
  return <CheckCircle size={16} className="text-green-400" />
}

const bgForType = (type: string) => {
  if (type === 'high') return 'border-red-800/60 bg-red-900/10'
  if (type === 'medium') return 'border-yellow-800/60 bg-yellow-900/10'
  return 'border-border bg-card'
}

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Alerts</h1>
        <p className="text-muted text-sm mt-1">Every anomaly detected on your account</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`card border ${bgForType(alert.type)}`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">{iconForType(alert.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-sm">{alert.title}</h3>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock size={10} /> {format(alert.time, 'MMM d, yyyy')}
                    </span>
                    {alert.resolved && (
                      <span className="badge-low">Resolved</span>
                    )}
                  </div>
                </div>
                <p className="text-muted text-sm mt-1">{alert.desc}</p>
                <p className="text-xs text-muted/70 mt-1 font-mono">{alert.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-20 text-muted">
          <CheckCircle size={40} className="text-green-400 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-1">All Clear</h3>
          <p className="text-sm">No security alerts on your account</p>
        </div>
      )}
    </div>
  )
}
