'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Shield, Lock, Bell, Trash2, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useUser()
  const [mfaEnabled, setMfaEnabled] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [newDeviceAlert, setNewDeviceAlert] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your security preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Shield size={16} className="text-accent" />Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted block mb-1.5">Full Name</label>
            <input
              defaultValue={user?.fullName || ''}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">Email</label>
            <input
              defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
              disabled
              className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted mt-1">Email managed by Clerk — change in your account portal</p>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Lock size={16} className="text-accent" />Security</h2>
        <div className="space-y-4">
          {[
            {
              label: 'Email MFA',
              desc: 'Require email OTP when risk score is medium or high',
              value: mfaEnabled,
              setter: setMfaEnabled,
            },
            {
              label: 'Email Alerts',
              desc: 'Get notified by email when a suspicious login is detected',
              value: emailAlerts,
              setter: setEmailAlerts,
            },
            {
              label: 'New Device Alerts',
              desc: 'Alert me when a new device logs into my account',
              value: newDeviceAlert,
              setter: setNewDeviceAlert,
            },
          ].map((setting, i) => (
            <div key={i} className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium">{setting.label}</div>
                <div className="text-xs text-muted mt-0.5">{setting.desc}</div>
              </div>
              <button
                onClick={() => setting.setter(!setting.value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                  setting.value ? 'bg-accent' : 'bg-subtle'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  setting.value ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card border-red-900/40">
        <h2 className="font-semibold mb-4 flex items-center gap-2 text-red-400"><Trash2 size={16} />Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Delete Behavioral Profile</div>
            <div className="text-xs text-muted mt-0.5">Resets your ML model — system reverts to rule-based detection</div>
          </div>
          <button className="text-sm text-red-400 border border-red-800 px-4 py-2 rounded-lg hover:bg-red-900/20 transition-colors">
            Reset Profile
          </button>
        </div>
      </motion.div>

      {/* Save */}
      <button onClick={handleSave} className={`btn-primary flex items-center gap-2 ${saved ? 'bg-green-600 hover:bg-green-600' : ''}`}>
        {saved ? <><CheckCircle size={15} /> Saved!</> : 'Save Changes'}
      </button>
    </div>
  )
}
