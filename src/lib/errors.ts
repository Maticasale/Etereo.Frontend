import type { AxiosError } from 'axios'

interface BackendError {
  error?: {
    codigo?: string
    mensaje?: string
  }
}

export function getErrorMessage(error: unknown): string {
  const axiosErr = error as AxiosError<BackendError>
  const backendMsg = axiosErr?.response?.data?.error?.mensaje
  if (backendMsg) return backendMsg
  return 'Ocurrió un error'
}

export function getErrorCode(error: unknown): string | undefined {
  const axiosErr = error as AxiosError<BackendError>
  return axiosErr?.response?.data?.error?.codigo
}
