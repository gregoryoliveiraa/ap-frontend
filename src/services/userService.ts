import api from './api';

// Tipo para os dados de atualização do usuário
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  oab?: string;
}

// Tipo para resposta do usuário
export interface UserResponse {
  id: string;
  email: string;
  nome_completo: string;
  verificado: boolean;
  numero_oab?: string;
  estado_oab?: string;
  plano: string;
  creditos_disponiveis: number;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  oab?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Mapear dados do usuário da API para o formato do frontend
 */
const mapUserFromApi = (apiUser: any): UserResponse => {
  // Recuperar dados persistidos do perfil
  const persistentUser = localStorage.getItem('userProfile');
  let savedProfile = {};
  
  if (persistentUser) {
    try {
      savedProfile = JSON.parse(persistentUser);
    } catch (e) {
      console.error('Erro ao analisar perfil salvo:', e);
    }
  }
  
  // Verificar se existe um avatar local
  const localAvatar = localStorage.getItem('userAvatar');
  
  // Extrair firstName e lastName do nome_completo se não estiverem explicitamente fornecidos
  let firstName = apiUser.firstName || '';
  let lastName = apiUser.lastName || '';
  
  if ((!firstName || !lastName) && apiUser.nome_completo) {
    const nameParts = apiUser.nome_completo.split(' ');
    firstName = firstName || nameParts[0] || '';
    lastName = lastName || nameParts.slice(1).join(' ') || '';
  }
  
  // Se firstName e lastName estiverem explicitamente fornecidos mas nome_completo não, atualizar nome_completo
  if ((apiUser.firstName || apiUser.lastName) && !apiUser.nome_completo) {
    apiUser.nome_completo = `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim();
  }
  
  // Verificar a prioridade de dados (primeiro apiUser, depois savedProfile, depois derivados)
  const mappedUser = {
    id: apiUser.id || '',
    email: apiUser.email || '',
    nome_completo: apiUser.nome_completo || `${firstName} ${lastName}`.trim(),
    verificado: apiUser.verificado || false,
    numero_oab: apiUser.numero_oab || null,
    estado_oab: apiUser.estado_oab || null,
    plano: apiUser.plano || 'free',
    creditos_disponiveis: apiUser.creditos_disponiveis || 0,
    firstName: apiUser.firstName || firstName || (savedProfile as any).firstName || '',
    lastName: apiUser.lastName || lastName || (savedProfile as any).lastName || '',
    avatar: apiUser.avatar || localAvatar || null,
    phone: apiUser.phone || (savedProfile as any).phone || '',
    oab: apiUser.oab || (savedProfile as any).oab || apiUser.numero_oab || '',
    created_at: apiUser.created_at || '',
    updated_at: apiUser.updated_at || ''
  };
  
  // Salvar informações de perfil relevantes no localStorage para persistência
  localStorage.setItem('userProfile', JSON.stringify({
    firstName: mappedUser.firstName,
    lastName: mappedUser.lastName,
    phone: mappedUser.phone,
    oab: mappedUser.oab
  }));

  // Se tiver um avatar da API mas não tiver um avatar local, também salve o avatar
  if (mappedUser.avatar && !localAvatar) {
    localStorage.setItem('userAvatar', mappedUser.avatar);
  }

  // Salvar usuário atual completo para referência
  localStorage.setItem('currentUser', JSON.stringify(mappedUser));
  
  console.log('Mapeando usuário para o frontend:', mappedUser);
  return mappedUser;
};

/**
 * Obter dados do usuário atual
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await api.get('/users/me');
  return mapUserFromApi(response.data);
};

/**
 * Atualizar dados do perfil do usuário
 */
export const updateUserProfile = async (userData: UpdateUserData): Promise<UserResponse> => {
  // Criar uma versão modificada do objeto userData para a API
  const apiUserData: any = { ...userData };
  
  // Se firstName e lastName estiverem presentes, combinar em nome_completo
  if (userData.firstName !== undefined || userData.lastName !== undefined) {
    // Garantir que pegamos os valores atuais se algum estiver indefinido
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const firstName = userData.firstName !== undefined ? userData.firstName : currentUser.firstName || '';
    const lastName = userData.lastName !== undefined ? userData.lastName : currentUser.lastName || '';
    
    // Combinar firstName e lastName em nome_completo
    apiUserData.nome_completo = `${firstName} ${lastName}`.trim();
  }
  
  // Enviar para a API
  const response = await api.put('/users/me', apiUserData);
  
  // Mapear a resposta para o formato do frontend
  return mapUserFromApi({
    ...response.data,
    // Garantir que os dados enviados pelo usuário sejam mantidos
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    oab: userData.oab
  });
};

/**
 * Fazer upload de avatar do usuário
 */
export const uploadAvatar = async (file: File): Promise<UserResponse> => {
  try {
    // Criar uma FormData para o upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Tentar fazer o upload para o backend
    const response = await api.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return mapUserFromApi(response.data);
  } catch (error) {
    console.error('Erro ao fazer upload do avatar:', error);
    
    // Fallback: salvar o avatar localmente se o backend falhar
    return saveAvatarLocally(file);
  }
};

/**
 * Salvar avatar localmente (fallback se o backend falhar)
 */
const saveAvatarLocally = async (file: File): Promise<UserResponse> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        // Salvar o avatar como base64 no localStorage
        const avatarDataUrl = event.target.result.toString();
        localStorage.setItem('userAvatar', avatarDataUrl);
        
        // Obter dados atuais do usuário
        const userProfile = localStorage.getItem('userProfile');
        let userData: any = {};
        
        if (userProfile) {
          try {
            userData = JSON.parse(userProfile);
          } catch (e) {
            console.error('Erro ao analisar perfil do usuário:', e);
          }
        }
        
        // Buscar o usuário atual e mapear com o novo avatar
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Adicionar o avatar aos dados do usuário
        const updatedUser = {
          ...currentUser,
          avatar: avatarDataUrl,
          ...userData
        };
        
        // Armazenar usuário atualizado
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Retornar usuário mapeado com o novo avatar
        resolve(mapUserFromApi({
          ...currentUser,
          avatar: avatarDataUrl
        }));
      }
    };
    
    // Ler o arquivo como uma URL de dados
    reader.readAsDataURL(file);
  });
};

/**
 * Atualizar senha do usuário
 */
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.put('/users/me/password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
};

/**
 * Excluir avatar do usuário
 */
export const deleteAvatar = async (): Promise<UserResponse> => {
  try {
    // Tentar excluir no backend
    const response = await api.delete('/users/me/avatar');
    return mapUserFromApi(response.data);
  } catch (error) {
    console.error('Erro ao excluir avatar:', error);
    
    // Fallback: remover o avatar localmente
    localStorage.removeItem('userAvatar');
    
    // Obter usuário atual
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Remover avatar
    const updatedUser = { ...currentUser, avatar: null };
    
    // Atualizar no localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return mapUserFromApi(updatedUser);
  }
}; 