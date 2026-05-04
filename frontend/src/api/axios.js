import axios from 'axios'

/*
  Single axios instance used throughout the app.
  
  Request interceptor:  automatically attaches Bearer token
  Response interceptor: if 401 → tries to refresh token once → retries original request
                        if refresh fails → logs user out
*/

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('tf_access')
  if (access) config.headers.Authorization = `Bearer ${access}`
  return config
})

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('tf_refresh')
      if (!refresh) {
        // No refresh token → force logout
        window.location.href = '/login'
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/refresh/`,
          { refresh }
        )
        localStorage.setItem('tf_access', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original) // retry original request
      } catch {
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api