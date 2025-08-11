// config/api.ts

// Configuración de la API
export const API_CONFIG = {
  // Cambia esta URL por la de tu servidor local
  // Para Android emulador: "http://10.0.2.2:8000"
  // Para iOS simulator: "http://localhost:8000"
  // Para dispositivo físico: "http://TU_IP_LOCAL:8000"
  BASE_URL: "http://192.168.163.214:5000",
  
  ENDPOINTS: {
    USERS: "/lanaapp/user",
    TRANSACTIONS: "/lanaapp/transaccion",
    BUDGETS: "/lanaapp/presupuesto",
  },
  
  TIMEOUT: 10000, // 10 segundos
};

// Tipos para las requests de la API
export interface UserCreateRequest {
  nombre_usuario: string;
  email: string;
  password: string;
  telefono: string;
}

export interface UserResponse {
  id: number;
  nombre_usuario: string;
  email: string;
  telefono: string;
  foto_perfil?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Función simplificada para hacer requests a la API
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch {
    throw new Error('Error de conexión. Verifica tu red e intenta de nuevo.');
  }
};