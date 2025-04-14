import { useState } from 'react';

// Lista de senhas comuns para bloquear
const COMMON_PASSWORDS = [
  'password', 'admin', '123456', '12345678', 'qwerty', 'letmein', 
  'senha', 'abc123', 'admin123', 'welcome', 'password123', 
  'iloveyou', '1234', '123123', '123321', '654321', 'qwerty123',
  'advogado', 'advogada', 'parceiro', 'parceira', 'juridico', 'direito'
];

/**
 * Interface para o resultado da validação de senha
 */
export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-4, onde 4 é a mais forte
  errors: string[];
  warnings: string[];
}

/**
 * Valida a força de uma senha
 * @param password A senha a ser validada
 * @returns Resultado da validação com score e mensagens
 */
export const validatePassword = (password: string): PasswordValidationResult => {
  const result: PasswordValidationResult = {
    isValid: false,
    score: 0,
    errors: [],
    warnings: []
  };

  // Verificar comprimento mínimo (10 caracteres para maior segurança)
  if (password.length < 10) {
    result.errors.push('A senha deve ter pelo menos 10 caracteres');
  }

  // Verificar se contém pelo menos um número
  if (!/\d/.test(password)) {
    result.errors.push('A senha deve conter pelo menos um número');
  }

  // Verificar se contém pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    result.errors.push('A senha deve conter pelo menos uma letra minúscula');
  }

  // Verificar se contém pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    result.errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }

  // Verificar se contém pelo menos um caractere especial
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    result.errors.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{};\'"\\|,.<>/?)');
  }

  // Verificar se contém pelo menos 2 números
  if ((password.match(/\d/g) || []).length < 2) {
    result.warnings.push('Recomendamos usar pelo menos 2 números na senha');
  }

  // Verificar se a senha é comum ou facilmente adivinhável
  const lowerPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.some(commonPwd => lowerPassword.includes(commonPwd))) {
    result.errors.push('A senha contém palavras comuns ou facilmente adivinháveis');
  }

  // Avisos adicionais para melhorar a segurança
  if (password.length < 14) {
    result.warnings.push('Recomendamos senhas com pelo menos 14 caracteres para maior segurança');
  }

  if (/(.)\1{2,}/.test(password)) {
    result.warnings.push('A senha contém caracteres repetidos, o que pode reduzir a segurança');
  }

  // Verificar sequências óbvias
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/.test(lowerPassword)) {
    result.warnings.push('A senha contém sequências óbvias de letras ou números');
  }

  // Verificar números de telefone comuns ou datas
  if (/(?:\d{2}\/\d{2}\/\d{2,4}|\d{2}\.\d{2}\.\d{2,4}|\d{2}\-\d{2}\-\d{2,4})/.test(password)) {
    result.warnings.push('A senha parece conter uma data, o que pode comprometer a segurança');
  }

  // Calcular pontuação (0-4)
  let score = 0;
  
  // Comprimento
  if (password.length >= 10) score += 0.5;
  if (password.length >= 12) score += 0.5;
  if (password.length >= 14) score += 0.5;
  if (password.length >= 16) score += 0.5;
  
  // Complexidade
  const hasNumber = /\d/.test(password);
  const hasMultipleNumbers = (password.match(/\d/g) || []).length >= 2;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasMultipleSpecial = (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length >= 2;
  
  if (hasNumber) score += 0.5;
  if (hasMultipleNumbers) score += 0.5;
  if (hasLowercase) score += 0.5;
  if (hasUppercase) score += 0.5;
  if (hasSpecial) score += 0.5;
  if (hasMultipleSpecial) score += 0.5;
  
  // Distribuição de caracteres
  const hasGoodMix = hasNumber && hasLowercase && hasUppercase && hasSpecial;
  if (hasGoodMix) score += 1;
  
  // Penalidades
  if (result.errors.length > 0) score = Math.max(0, score - 1);
  if (result.warnings.length > 1) score = Math.max(0, score - 0.5);
  
  // Ajustar para escala de 0-4
  score = Math.min(4, Math.round(score));
  
  result.score = score;
  
  // A senha é válida se não tiver erros
  result.isValid = result.errors.length === 0;
  
  return result;
};

/**
 * Hook React para validação de senha em tempo real
 */
export const usePasswordValidator = () => {
  const [result, setResult] = useState<PasswordValidationResult>({
    isValid: false,
    score: 0,
    errors: [],
    warnings: []
  });

  const validatePasswordInput = (password: string) => {
    const validationResult = validatePassword(password);
    setResult(validationResult);
    return validationResult;
  };

  return {
    result,
    validatePassword: validatePasswordInput
  };
};

/**
 * Calcula a força da senha como uma string descritiva
 */
export const getPasswordStrength = (score: number): string => {
  switch (score) {
    case 0:
      return 'Muito fraca';
    case 1:
      return 'Fraca';
    case 2:
      return 'Média';
    case 3:
      return 'Forte';
    case 4:
      return 'Muito forte';
    default:
      return 'Desconhecida';
  }
}; 