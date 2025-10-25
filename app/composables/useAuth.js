export const useAuth = () => {
  const isAuthenticated = ref(false)

  const checkAuth = () => {
    if (process.client) {
      const storedAuth = localStorage.getItem('admin_authenticated')
      isAuthenticated.value = storedAuth === 'true'
      return isAuthenticated.value
    }
    return false
  }

  const setAuth = (value) => {
    isAuthenticated.value = value
    if (process.client) {
      if (value) {
        localStorage.setItem('admin_authenticated', 'true')
      } else {
        localStorage.removeItem('admin_authenticated')
      }
    }
  }

  const requireAuth = () => {
    if (!checkAuth()) {
      navigateTo('/')
      return false
    }
    return true
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    checkAuth,
    setAuth,
    requireAuth
  }
}
