/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data para exibição no formato pt-BR
 * @param dateString String da data no formato ISO
 * @returns Data formatada no padrão DD/MM/YYYY
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString;
  }
};

/**
 * Formata uma data para exibição incluindo horário
 * @param dateString String da data no formato ISO
 * @returns Data e hora formatadas no padrão DD/MM/YYYY HH:mm
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return dateString;
  }
};

/**
 * Formata uma data relativa (quanto tempo atrás)
 * @param dateString String da data no formato ISO
 * @returns Texto indicando há quanto tempo ocorreu (ex: "há 2 dias")
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 30) {
      return formatDate(dateString);
    } else if (diffDays === 1) {
      return 'há 1 dia';
    } else if (diffDays > 1) {
      return `há ${diffDays} dias`;
    } else if (diffHours === 1) {
      return 'há 1 hora';
    } else if (diffHours > 1) {
      return `há ${diffHours} horas`;
    } else if (diffMinutes === 1) {
      return 'há 1 minuto';
    } else if (diffMinutes > 1) {
      return `há ${diffMinutes} minutos`;
    } else {
      return 'agora mesmo';
    }
  } catch (error) {
    console.error('Erro ao formatar tempo relativo:', error);
    return dateString;
  }
};

/**
 * Formata uma data para exibição relativa (Hoje, Ontem, x dias atrás)
 * @param date Data a ser formatada
 * @returns String formatada
 */
export const formatRelativeDate = (date: Date) => {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString();
}; 