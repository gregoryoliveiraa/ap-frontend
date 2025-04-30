import { AxiosError } from 'axios';

/**
 * Padroniza o tratamento de erros de API
 * @param error Erro da API (Axios)
 * @param defaultMessage Mensagem padrão caso não seja possível extrair do erro
 * @returns Erro padronizado
 */
export const handleApiError = (error: unknown, defaultMessage: string): Error => {
  console.error(defaultMessage, error);
  
  if (error instanceof AxiosError) {
    // Se há uma mensagem de erro retornada pela API
    if (error.response?.data?.detail) {
      return new Error(error.response.data.detail);
    }
    
    // Se há um status code, usar uma mensagem apropriada
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return new Error('Requisição inválida. Verifique os dados enviados.');
        case 401:
          return new Error('Não autorizado. Faça login novamente.');
        case 403:
          return new Error('Acesso negado. Você não tem permissão para esta ação.');
        case 404:
          return new Error('Recurso não encontrado.');
        case 422:
          return new Error('Dados inválidos. Verifique as informações enviadas.');
        case 500:
          return new Error('Erro interno do servidor. Tente novamente mais tarde.');
        default:
          return new Error(`Erro ${error.response.status}: ${defaultMessage}`);
      }
    }
    
    // Se for um erro de timeout
    if (error.code === 'ECONNABORTED') {
      return new Error('Tempo limite excedido. Verifique sua conexão e tente novamente.');
    }
  }
  
  // Para qualquer outro tipo de erro
  return new Error(defaultMessage);
}; 