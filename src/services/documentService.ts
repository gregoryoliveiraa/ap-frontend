import api from './api';

export interface Document {
  id: string;
  title: string;
  content?: string;
  document_type: string;
  tokens_used?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Template {
  id: string;
  document_name: string;
  subfolder_1: string;
  subfolder_2: string;
  subfolder_3?: string;
}

export interface TemplateDetails {
  id: string;
  name: string;
  categoria: string;
  subcategoria: string;
  text: string;
  variables: string[];
}

export interface TemplateCategories {
  categorias: string[];
  subcategorias: Record<string, string[]>;
}

/**
 * Obter todas as categorias de templates disponíveis
 */
export const getTemplateCategories = async (): Promise<TemplateCategories> => {
  try {
    const response = await api.get('/documents/templates/categories');
    return response.data.data;
  } catch (error) {
    console.error('Erro ao obter categorias de templates:', error);
    throw error;
  }
};

/**
 * Listar templates disponíveis com filtros opcionais e paginação
 */
export const listTemplates = async (
  categoria?: string,
  subcategoria?: string,
  skip: number = 0,
  limit: number = 50
): Promise<{templates: Template[], total: number}> => {
  try {
    const params: any = {
      skip,
      limit
    };
    if (categoria) params.categoria = categoria;
    if (subcategoria) params.subcategoria = subcategoria;
    
    const response = await api.get('/documents/templates', { params });
    return {
      templates: response.data.data,
      total: response.data.total
    };
  } catch (error) {
    console.error('Erro ao listar templates:', error);
    throw error;
  }
};

/**
 * Obter detalhes de um template específico
 */
export const getTemplateDetails = async (templateId: string): Promise<TemplateDetails> => {
  try {
    const response = await api.get(`/documents/templates/${templateId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao obter detalhes do template:', error);
    throw error;
  }
};

/**
 * Gerar sugestões de preenchimento com IA
 */
export const generateAiSuggestions = async (
  templateId: string,
  description: string
): Promise<any> => {
  try {
    const response = await api.post('/documents/ai-complete', {
      template_id: templateId,
      description
    });
    return response.data.data;
  } catch (error) {
    console.error('Erro ao gerar sugestões com IA:', error);
    throw error;
  }
};

/**
 * Gerar um documento a partir de um template
 */
export const generateDocument = async (
  templateId: string,
  variables: Record<string, string>,
  formattedTitle?: string
): Promise<any> => {
  try {
    // Debug
    console.log('Gerando documento com:', {
      templateId,
      variables,
      formattedTitle
    });
    
    // Criar FormData para envio de formulário
    const formData = new FormData();
    formData.append('template_id', templateId);
    
    // Garantir que as variáveis sejam um objeto JSON válido, mesmo que vazio
    const variablesJson = Object.keys(variables).length > 0 ? 
      JSON.stringify(variables) : 
      '{}';
    
    console.log('Variables JSON:', variablesJson);
    formData.append('variables', variablesJson);
    
    // Se fornecido, incluir o título formatado
    if (formattedTitle) {
      formData.append('formatted_title', formattedTitle);
    }
    
    console.log('FormData preparado, enviando requisição...');
    
    // Importante: Não definir o Content-Type e deixar o navegador configurar automaticamente
    // para que os limites (boundaries) do multipart/form-data sejam definidos corretamente
    const response = await api.post('/documents/generate', formData);
    
    console.log('Resposta de geração:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao gerar documento:', error);
    if ((error as any).response) {
      console.error('Detalhes do erro:', (error as any).response.data);
    }
    throw error;
  }
};

/**
 * Obter todos os documentos do usuário
 */
export const getUserDocuments = async (): Promise<Document[]> => {
  try {
    const response = await api.get('/documents');
    console.log('Documentos recebidos da API:', response.data);
    return response.data.data.map((doc: any) => ({
      ...doc,
      created_at: new Date(doc.created_at),
      updated_at: new Date(doc.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao obter documentos do usuário:', error);
    if ((error as any).response) {
      console.error('Detalhes do erro:', (error as any).response.data);
    }
    throw error;
  }
};

/**
 * Obter um documento específico
 */
export const getDocument = async (documentId: string): Promise<Document> => {
  try {
    const response = await api.get(`/documents/${documentId}`);
    const doc = response.data.data;
    return {
      ...doc,
      created_at: new Date(doc.created_at),
      updated_at: new Date(doc.updated_at)
    };
  } catch (error) {
    console.error('Erro ao obter documento:', error);
    throw error;
  }
};

/**
 * Atualiza um documento existente
 */
export const updateDocument = async (
  documentId: string,
  data: {
    title?: string;
    content?: string;
    document_type?: string;
  }
): Promise<Document> => {
  try {
    console.log('Atualizando documento:', documentId, data);
    const response = await api.put(`/documents/${documentId}`, data);
    const doc = response.data.data;
    return {
      ...doc,
      created_at: new Date(doc.created_at),
      updated_at: new Date(doc.updated_at)
    };
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    if ((error as any).response) {
      console.error('Detalhes do erro:', (error as any).response.data);
    }
    throw error;
  }
};

/**
 * Gerar preview do documento baseado no template e valores das variáveis
 */
export const previewDocument = async (
  templateId: string,
  variables: Record<string, string>,
  formattedTitle?: string
): Promise<any> => {
  try {
    // Debug
    console.log('Gerando preview do documento com:', {
      templateId,
      variables,
      formattedTitle
    });
    
    // Criar FormData para envio de formulário
    const formData = new FormData();
    formData.append('template_id', templateId);
    
    // Garantir que as variáveis sejam um objeto JSON válido, mesmo que vazio
    const variablesJson = Object.keys(variables).length > 0 ? 
      JSON.stringify(variables) : 
      '{}';
    
    console.log('Variables JSON:', variablesJson);
    formData.append('variables', variablesJson);
    
    // Se fornecido, incluir o título formatado
    if (formattedTitle) {
      formData.append('formatted_title', formattedTitle);
    }
    
    console.log('FormData preparado, enviando requisição de preview...');
    
    // Configuração explícita para permitir que o Axios defina automaticamente o Content-Type
    const config = {
      headers: {
        // Removendo Content-Type para que o Axios configure corretamente como multipart/form-data
      }
    };
    
    const response = await api.post('/documents/preview', formData, config);
    
    console.log('Resposta de preview:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao gerar preview do documento:', error);
    if ((error as any).response) {
      console.error('Detalhes do erro:', (error as any).response.data);
    }
    throw error;
  }
}; 