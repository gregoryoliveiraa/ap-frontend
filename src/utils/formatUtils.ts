/**
 * Formata um texto substituindo underscores por espaços e deixando a primeira letra de cada palavra maiúscula
 * @param text Texto a ser formatado
 * @returns Texto formatado
 */
export const formatTitle = (text: string): string => {
  if (!text) return '';
  
  // Substituir underscores por espaços
  const withSpaces = text.replace(/_/g, ' ');
  
  // Capitalizar a primeira letra de cada palavra
  return withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formata um nome de documento para exibição
 * @param documentName Nome do documento
 * @returns Nome formatado
 */
export const formatDocumentName = (documentName: string): string => {
  return formatTitle(documentName);
}; 