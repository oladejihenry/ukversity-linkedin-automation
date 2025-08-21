import axiosInstance from './axios'

export const login = async (email: string, password: string) => {
  //laravel sanctum
  await sanctum()
  try {
    const response = await axiosInstance.post('/login', { email, password })
    return response
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const logout = async () => {
  try {
    const response = await axiosInstance.post('/logout')
    console.log(response)
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}

//laravel sanctum
export const sanctum = async () => {
  try {
    const response = await axiosInstance.get('/sanctum/csrf-cookie')
    return response.data
  } catch (error) {
    console.error(error)
    throw error
  }
}
