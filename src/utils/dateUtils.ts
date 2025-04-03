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