import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})


export interface BehavioralPayload {
  clerk_user_id: string
  email: string
  avg_dwell_time: number
  avg_flight_time: number
  typing_speed: number
  total_duration: number
  keystroke_count: number
  ip_address?: string
  user_agent?: string
  timezone?: string
  login_hour: number
  login_day_of_week: number
}

export interface RiskResponse {
  risk_score: number
  risk_level: 'low' | 'medium' | 'high'
  anomaly_factors: string[]
  require_mfa: boolean
  session_id: string
}

export const behaviorAPI = {
  // Send behavioral data for risk analysis
  analyze: async (payload: BehavioralPayload): Promise<RiskResponse> => {
    const { data } = await api.post('/behavior/analyze', payload)
    return data
  },

  // Confirm successful MFA (unlock session)
  confirmMFA: async (session_id: string, clerk_user_id: string) => {
    const { data } = await api.post('/behavior/confirm-mfa', { session_id, clerk_user_id })
    return data
  },

  // Get user's behavioral baseline
  getBaseline: async (clerk_user_id: string) => {
    const { data } = await api.get(`/behavior/baseline/${clerk_user_id}`)
    return data
  },
}

export const adminAPI = {
  // Get all users with risk data
  getUsers: async (token: string) => {
    const { data } = await api.get('/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  // Get all sessions (paginated)
  getSessions: async (token: string, page = 1, limit = 50) => {
    const { data } = await api.get(`/admin/sessions?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  // Get threat feed
  getThreats: async (token: string) => {
    const { data } = await api.get('/admin/threats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  // Block a user
  blockUser: async (token: string, userId: string, reason: string) => {
    const { data } = await api.post('/admin/users/block', { user_id: userId, reason }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  // Get dashboard stats
  getStats: async (token: string) => {
    const { data } = await api.get('/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  // Export CSV
  exportCSV: async (token: string) => {
    const { data } = await api.get('/admin/export/csv', {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    })
    return data
  },
}

export const userAPI = {
  // Get user's own session history
  getSessions: async (clerk_user_id: string) => {
    const { data } = await api.get(`/user/sessions/${clerk_user_id}`)
    return data
  },

  // Get user's security alerts
  getAlerts: async (clerk_user_id: string) => {
    const { data } = await api.get(`/user/alerts/${clerk_user_id}`)
    return data
  },

  // Get user's behavior profile for visualization
  getBehaviorProfile: async (clerk_user_id: string) => {
    const { data } = await api.get(`/user/behavior-profile/${clerk_user_id}`)
    return data
  },
}

export default api
