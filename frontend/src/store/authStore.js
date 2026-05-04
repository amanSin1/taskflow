import { create } from 'zustand'

/*
  WHY Zustand?
  - No boilerplate (no reducers, no actions, no context providers)
  - Persists auth state in localStorage so user stays logged in on refresh
  - Accessible from any component without wrapping the tree
*/

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('tf_user') || 'null'),
  access: localStorage.getItem('tf_access') || null,
  refresh: localStorage.getItem('tf_refresh') || null,

  login: (user, access, refresh) => {
    localStorage.setItem('tf_user', JSON.stringify(user))
    localStorage.setItem('tf_access', access)
    localStorage.setItem('tf_refresh', refresh)
    set({ user, access, refresh })
  },

  logout: () => {
    localStorage.removeItem('tf_user')
    localStorage.removeItem('tf_access')
    localStorage.removeItem('tf_refresh')
    set({ user: null, access: null, refresh: null })
  },

  updateTokens: (access, refresh) => {
    localStorage.setItem('tf_access', access)
    if (refresh) localStorage.setItem('tf_refresh', refresh)
    set({ access, refresh: refresh || useAuthStore.getState().refresh })
  },
}))

export default useAuthStore