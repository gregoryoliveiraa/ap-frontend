import { Document, DocumentServiceError, getUserDocuments } from '../services/documentService';
import { useState } from 'react';
import { Typography, Alert, Button } from '@mui/material';

interface ErrorState {
  message: string;
  code?: string;
  severity: 'error' | 'warning' | 'info';
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const docs = await getUserDocuments();
      setDocuments(docs);
    } catch (err) {
      let errorState: ErrorState;
      
      if (err instanceof DocumentServiceError) {
        switch (err.code) {
          case 'UNAUTHORIZED':
            errorState = {
              message: 'Your session has expired. Please log in again.',
              code: err.code,
              severity: 'error'
            };
            // Optionally trigger a logout or redirect to login
            break;
          case 'FORBIDDEN':
            errorState = {
              message: 'You do not have permission to view these documents.',
              code: err.code,
              severity: 'error'
            };
            break;
          case 'NOT_FOUND':
            errorState = {
              message: 'No documents found.',
              code: err.code,
              severity: 'info'
            };
            break;
          case 'SERVER_ERROR':
            errorState = {
              message: 'The server encountered an error. Please try again later.',
              code: err.code,
              severity: 'error'
            };
            break;
          default:
            errorState = {
              message: err.message,
              code: err.code,
              severity: 'error'
            };
        }
      } else {
        errorState = {
          message: 'An unexpected error occurred while loading documents.',
          severity: 'error'
        };
      }
      
      setError(errorState);
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Documents
      </Typography>
      
      {error && (
        <Alert 
          severity={error.severity}
          sx={{ mb: 2 }}
          action={
            error.code === 'SERVER_ERROR' && (
              <Button color="inherit" size="small" onClick={fetchDocuments}>
                Retry
              </Button>
            )
          }
        >
          {error.message}
        </Alert>
      )}
      
      {/* ... rest of the existing JSX ... */}
    </div>
  );
} 