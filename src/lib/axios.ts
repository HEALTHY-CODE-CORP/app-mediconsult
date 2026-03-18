import axios from "axios"
import type { ApiError } from "@/types/api"

const api = axios.create({
  baseURL: "/api/bff/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiError
      return Promise.reject(apiError)
    }
    return Promise.reject(error)
  }
)

export default api
