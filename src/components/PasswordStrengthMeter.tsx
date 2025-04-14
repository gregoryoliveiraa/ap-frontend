import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { getPasswordStrength } from '../utils/passwordValidator';

interface PasswordStrengthMeterProps {
  score: number;
  showText?: boolean;
}

/**
 * Componente para exibir a força da senha em um medidor visual
 */
const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  score, 
  showText = true 
}) => {
  // Definir cor com base na pontuação
  const getColor = () => {
    switch (score) {
      case 0:
        return '#f44336'; // Vermelho - Muito fraca
      case 1:
        return '#ff9800'; // Laranja - Fraca
      case 2:
        return '#ffeb3b'; // Amarelo - Média
      case 3:
        return '#4caf50'; // Verde claro - Forte
      case 4:
        return '#2e7d32'; // Verde escuro - Muito forte
      default:
        return '#e0e0e0'; // Cinza - Nenhuma senha
    }
  };

  // Transformar a pontuação (0-4) em porcentagem (0-100)
  const progressValue = score * 25;
  const strength = getPasswordStrength(score);
  const color = getColor();

  return (
    <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
      {showText && (
        <Typography 
          variant="caption" 
          color={color}
          sx={{ 
            display: 'block', 
            mb: 0.5, 
            fontWeight: 'medium',
            transition: 'color 0.3s ease'
          }}
        >
          Força da senha: {strength}
        </Typography>
      )}
      
      <LinearProgress 
        variant="determinate" 
        value={progressValue} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          bgcolor: 'rgba(0, 0, 0, 0.09)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            bgcolor: color,
            transition: 'transform 0.4s ease, background-color 0.3s ease'
          }
        }}
      />
      
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 0.5 
        }}
      >
        <Typography variant="caption" color="text.secondary">Fraca</Typography>
        <Typography variant="caption" color="text.secondary">Forte</Typography>
      </Box>
    </Box>
  );
};

export default PasswordStrengthMeter; 