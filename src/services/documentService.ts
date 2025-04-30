import api from './api';
import axios from 'axios';

export interface Document {
  id: string;
  title: string;
  content?: string;
  document_type: string;
  tokens_used?: number;
  created_at: Date;
  updated_at: Date;
  folder_path?: string | null;
  version?: number;
  status?: 'draft' | 'final';
  metadata?: Record<string, any>;
}

export interface Template {
  id: string;
  document_name: string;
  subfolder_1: string;
  subfolder_2: string;
  subfolder_3?: string;
  version?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface TemplateDetails {
  id: string;
  name: string;
  categoria: string;
  subcategoria: string;
  text: string;
  variables: string[];
  validation_rules?: Record<string, {
    required?: boolean;
    pattern?: string;
    min_length?: number;
    max_length?: number;
    custom_validation?: string;
  }>;
  version?: number;
  preview_text?: string;
}

export interface TemplateCategories {
  categorias: string[];
  subcategorias: Record<string, string[]>;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export class DocumentServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'DocumentServiceError';
  }
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
 * Validar variáveis do template antes da geração
 */
const validateTemplateVariables = (
  variables: Record<string, string>,
  validationRules?: TemplateDetails['validation_rules']
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  if (!validationRules) {
    return { isValid: true, errors: {} };
  }

  Object.entries(validationRules).forEach(([variable, rules]) => {
    const value = variables[variable] || '';

    if (rules.required && !value) {
      errors[variable] = 'Este campo é obrigatório';
      isValid = false;
    }

    if (rules.pattern && value) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors[variable] = 'Valor inválido para o padrão especificado';
        isValid = false;
      }
    }

    if (rules.min_length && value.length < rules.min_length) {
      errors[variable] = `Mínimo de ${rules.min_length} caracteres`;
      isValid = false;
    }

    if (rules.max_length && value.length > rules.max_length) {
      errors[variable] = `Máximo de ${rules.max_length} caracteres`;
      isValid = false;
    }

    if (rules.custom_validation) {
      try {
        const customValidationFn = new Function('value', rules.custom_validation);
        if (!customValidationFn(value)) {
          errors[variable] = 'Validação personalizada falhou';
          isValid = false;
        }
      } catch (error) {
        console.error('Erro na validação personalizada:', error);
        errors[variable] = 'Erro na validação';
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

/**
 * Gerar um documento a partir de um template
 */
export const generateDocument = async (
  templateId: string,
  variables: Record<string, string>,
  formattedTitle?: string,
  options?: {
    status?: Document['status'];
    metadata?: Record<string, any>;
  }
): Promise<Document> => {
  try {
    // Obter detalhes do template para validação
    const templateDetails = await getTemplateDetails(templateId);
    
    // Validar variáveis
    const { isValid, errors } = validateTemplateVariables(variables, templateDetails.validation_rules);
    if (!isValid) {
      throw new Error('Validação das variáveis falhou: ' + JSON.stringify(errors));
    }

    // Preparar dados para envio
    const payload = {
      template_id: templateId,
      variables: variables,
      formatted_title: formattedTitle,
      status: options?.status || 'draft',
      metadata: options?.metadata || {}
    };

    const response = await api.post('/documents/generate', payload);
    
    const doc = response.data.data;
    return {
      ...doc,
      created_at: new Date(doc.created_at),
      updated_at: new Date(doc.updated_at)
    };
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
export async function getUserDocuments(): Promise<Document[]> {
  try {
    const response = await api.get('/documents');
    
    // Handle both array response and data wrapper response
    const documents = Array.isArray(response.data) ? response.data : 
                     response.data.data ? response.data.data : [];
    
    if (!Array.isArray(documents)) {
      throw new DocumentServiceError('Invalid response format: expected array of documents');
    }
    
    return documents.map(doc => ({
      ...doc,
      created_at: new Date(doc.created_at),
      updated_at: new Date(doc.updated_at),
      folder_path: doc.folder_path || null,
      document_type: doc.document_type || 'Outro',
      title: doc.title || 'Sem título'
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0;
      const details = error.response?.data;
      
      if (status === 401) {
        throw new DocumentServiceError('Unauthorized: Please log in again', 'UNAUTHORIZED', details);
      } else if (status === 403) {
        throw new DocumentServiceError('Forbidden: Insufficient permissions', 'FORBIDDEN', details);
      } else if (status === 404) {
        throw new DocumentServiceError('Documents not found', 'NOT_FOUND', details);
      } else if (status >= 500) {
        throw new DocumentServiceError('Server error while fetching documents', 'SERVER_ERROR', details);
      }
      
      throw new DocumentServiceError(
        `Failed to fetch documents: ${error.message}`,
        'REQUEST_FAILED',
        details
      );
    }
    
    throw new DocumentServiceError(
      'Unexpected error while fetching documents',
      'UNKNOWN_ERROR',
      error
    );
  }
}

/**
 * Obter um documento específico
 */
export async function getDocument(id: string): Promise<Document> {
  try {
    const response = await api.get<Document>(`/documents/${id}`);
    
    // Validate response data
    if (!response.data || typeof response.data !== 'object') {
      throw new DocumentServiceError('Invalid response format: expected document object');
    }
    
    return {
      ...response.data,
      created_at: new Date(response.data.created_at),
      updated_at: new Date(response.data.updated_at)
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0;
      const details = error.response?.data;
      
      if (status === 401) {
        throw new DocumentServiceError('Unauthorized: Please log in again', 'UNAUTHORIZED', details);
      } else if (status === 403) {
        throw new DocumentServiceError('Forbidden: Insufficient permissions', 'FORBIDDEN', details);
      } else if (status === 404) {
        throw new DocumentServiceError(`Document with ID ${id} not found`, 'NOT_FOUND', details);
      } else if (status >= 500) {
        throw new DocumentServiceError('Server error while fetching document', 'SERVER_ERROR', details);
      }
      
      throw new DocumentServiceError(
        `Failed to fetch document: ${error.message}`,
        'REQUEST_FAILED',
        details
      );
    }
    
    throw new DocumentServiceError(
      'Unexpected error while fetching document',
      'UNKNOWN_ERROR',
      error
    );
  }
}

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
): Promise<{ title: string; content: string; document_type: string }> => {
  try {
    // Obter detalhes do template para validação
    const templateDetails = await getTemplateDetails(templateId);
    
    // Validar variáveis
    const { isValid, errors } = validateTemplateVariables(variables, templateDetails.validation_rules);
    if (!isValid) {
      throw new Error('Validação das variáveis falhou: ' + JSON.stringify(errors));
    }

    // Preparar dados para envio
    const payload = {
      template_id: templateId,
      variables: variables,
      formatted_title: formattedTitle
    };

    const response = await api.post('/documents/preview', payload);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao gerar preview do documento:', error);
    if ((error as any).response) {
      console.error('Detalhes do erro:', (error as any).response.data);
    }
    throw error;
  }
};

/**
 * Excluir um documento
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    await api.delete(`/documents/${documentId}`);
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    throw error;
  }
};

/**
 * Obter todas as pastas do usuário
 */
export const getUserFolders = async (): Promise<Folder[]> => {
  try {
    const response = await api.get('/documents/folders');
    return response.data.data.map((folder: any) => ({
      ...folder,
      created_at: new Date(folder.created_at),
      updated_at: new Date(folder.updated_at)
    }));
  } catch (error) {
    console.error('Erro ao obter pastas do usuário:', error);
    throw error;
  }
};

/**
 * Criar uma nova pasta
 */
export const createFolder = async (data: { name: string; parent_id: string | null }): Promise<Folder> => {
  try {
    const response = await api.post('/documents/folders', data);
    const folder = response.data.data;
    return {
      ...folder,
      created_at: new Date(folder.created_at),
      updated_at: new Date(folder.updated_at)
    };
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    throw error;
  }
};

/**
 * Excluir uma pasta
 */
export const deleteFolder = async (folderId: string): Promise<void> => {
  try {
    await api.delete(`/documents/folders/${folderId}`);
  } catch (error) {
    console.error('Erro ao excluir pasta:', error);
    throw error;
  }
};

/**
 * Mover um documento para outra pasta
 */
export const moveDocument = async (documentId: string, targetFolderId: string | null): Promise<Document> => {
  try {
    const response = await api.put(`/documents/${documentId}/move`, {
      folder_id: targetFolderId
    });
    
    const doc = response.data.data;
    return {
      ...doc,
      folder_path: doc.folder_path, // Ensure folder_path is properly set
      created_at: new Date(doc.created_at),
      updated_at: new Date(doc.updated_at)
    };
  } catch (error) {
    console.error('Erro ao mover documento:', error);
    throw error;
  }
};

/**
 * Importar templates de várias fontes
 */
export const importTemplates = async (
  source: 'csv' | 'docx' | 'json',
  file?: File,
  options?: {
    overwrite?: boolean;
    validate?: boolean;
    category?: string;
    subcategory?: string;
  }
): Promise<{ count: number; errors?: string[] }> => {
  try {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    
    formData.append('source', source);
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await api.post('/documents/templates/import', formData);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao importar templates:', error);
    throw error;
  }
};

/**
 * Validar template antes da importação
 */
export const validateTemplate = async (
  template: Partial<Template> & { text: string; variables: string[] }
): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    const response = await api.post('/documents/templates/validate', template);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao validar template:', error);
    throw error;
  }
}; 