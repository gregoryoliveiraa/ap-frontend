import { useState, useRef, ChangeEvent } from 'react';

type FileValidator = (file: File) => { valid: boolean; message?: string };

interface FileUploadOptions {
  maxSizeInBytes?: number;
  acceptedFileTypes?: string[];
  customValidators?: FileValidator[];
}

interface FileUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
  loading: boolean;
}

interface FileUploadReturn {
  fileState: FileUploadState;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  triggerFileInput: () => void;
  clearFile: () => void;
  uploadFile: (uploadFn: (file: File) => Promise<any>) => Promise<any>;
}

const defaultOptions: FileUploadOptions = {
  maxSizeInBytes: 5 * 1024 * 1024, // 5MB
  acceptedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
  customValidators: []
};

/**
 * Custom hook for handling file uploads with validation and state management
 * @param options Configuration options for file uploads
 * @returns Object with file state and methods for managing uploads
 */
export const useFileUpload = (options: FileUploadOptions = {}): FileUploadReturn => {
  const mergedOptions = { ...defaultOptions, ...options };
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fileState, setFileState] = useState<FileUploadState>({
    file: null,
    preview: null,
    error: null,
    loading: false
  });

  /**
   * Validates a file against all configured validators
   */
  const validateFile = (file: File): { valid: boolean; message?: string } => {
    // Check file size
    if (mergedOptions.maxSizeInBytes && file.size > mergedOptions.maxSizeInBytes) {
      return {
        valid: false,
        message: `O arquivo não pode exceder ${mergedOptions.maxSizeInBytes / (1024 * 1024)}MB.`
      };
    }

    // Check file type
    if (mergedOptions.acceptedFileTypes && mergedOptions.acceptedFileTypes.length > 0) {
      if (!mergedOptions.acceptedFileTypes.includes(file.type)) {
        return {
          valid: false,
          message: `Tipo de arquivo inválido. Aceitos: ${mergedOptions.acceptedFileTypes.join(', ')}.`
        };
      }
    }

    // Run custom validators
    if (mergedOptions.customValidators) {
      for (const validator of mergedOptions.customValidators) {
        const result = validator(file);
        if (!result.valid) {
          return result;
        }
      }
    }

    return { valid: true };
  };

  /**
   * Creates a data URL preview for the file
   */
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handles file input change events
   */
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate the file
      const validation = validateFile(file);
      if (!validation.valid) {
        setFileState({
          file: null,
          preview: null,
          error: validation.message || 'Arquivo inválido',
          loading: false
        });
        return;
      }

      try {
        // Create a preview
        const preview = await createPreview(file);
        
        // Update state with the new file
        setFileState({
          file,
          preview,
          error: null,
          loading: false
        });
      } catch (error) {
        setFileState({
          file: null,
          preview: null,
          error: 'Erro ao processar o arquivo',
          loading: false
        });
      }
    }
  };

  /**
   * Programmatically triggers the file input
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Clears the current file and resets state
   */
  const clearFile = () => {
    setFileState({
      file: null,
      preview: null,
      error: null,
      loading: false
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Uploads the file using the provided upload function
   */
  const uploadFile = async (uploadFn: (file: File) => Promise<any>) => {
    if (!fileState.file) {
      setFileState(prev => ({
        ...prev,
        error: 'Nenhum arquivo selecionado'
      }));
      return Promise.reject(new Error('Nenhum arquivo selecionado'));
    }

    try {
      setFileState(prev => ({ ...prev, loading: true, error: null }));
      const result = await uploadFn(fileState.file);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload do arquivo';
      setFileState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
      return Promise.reject(error);
    } finally {
      setFileState(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    fileState,
    fileInputRef,
    handleFileChange,
    triggerFileInput,
    clearFile,
    uploadFile
  };
};

export default useFileUpload; 