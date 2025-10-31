import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to extract user-friendly error message from API response
export const extractErrorMessage = (error: any): string => {
  if (error.response) {
    const { data, status } = error.response;
    
    // Try to extract message from different possible response structures
    if (typeof data === 'string') {
      // Sometimes the error is just a string - try to extract just the message part
      // For .NET exceptions, the string might contain the full stack trace
      const lines = data.split('\n');
      const firstLine = lines[0].trim();
      
      // Check if it's a .NET exception format (e.g., "System.InvalidOperationException: Message")
      const exceptionMatch = firstLine.match(/^[\w\.]+Exception:\s*(.+)$/);
      if (exceptionMatch) {
        return exceptionMatch[1].trim();
      }
      
      return firstLine || data;
    }
    
    if (data?.message) {
      return data.message;
    }
    
    if (data?.title) {
      return data.title;
    }
    
    if (data?.error) {
      return data.error;
    }
    
    // For .NET exceptions, the message might be in the exception details
    if (typeof data === 'object') {
      // Try to find any property that looks like an error message
      const possibleMessage = data.Message || data.detail || data.Detail || data.errors;
      if (possibleMessage) {
        if (typeof possibleMessage === 'string') {
          return possibleMessage;
        }
        // If it's an object (validation errors), try to extract the first error
        if (typeof possibleMessage === 'object') {
          const firstError = Object.values(possibleMessage)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            return firstError[0];
          }
          if (typeof firstError === 'string') {
            return firstError;
          }
        }
      }
    }
    
    // Default messages based on status code
    switch (status) {
      case 400:
        return 'Dados inválidos. Por favor, verifique as informações enviadas.';
      case 401:
        return 'Não autorizado. Por favor, faça login novamente.';
      case 403:
        return 'Acesso negado.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return 'Conflito: o recurso já existe.';
      case 422:
        return 'Erro de validação. Por favor, verifique os dados enviados.';
      case 500:
        return 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
      default:
        return `Erro na requisição (${status}).`;
    }
  }
  
  if (error.request) {
    // The request was made but no response was received
    return 'Erro de conexão. Verifique sua conexão com a internet ou se o servidor está disponível.';
  }
  
  // Something happened in setting up the request
  return error.message || 'Erro desconhecido.';
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log to console for debugging
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }
    
    // Enhance error with user-friendly message
    const userMessage = extractErrorMessage(error);
    error.userMessage = userMessage;
    
    return Promise.reject(error);
  }
);
