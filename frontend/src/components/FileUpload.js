import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Button, Paper } from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

const FileUpload = ({ onFilesSelected, onProcessDocuments, loading, hasFiles }) => {
  const onDrop = useCallback((acceptedFiles) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true,
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <Box>
      <Paper
        {...getRootProps()}
        elevation={isDragActive ? 4 : 1}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.50' : 'grey.50',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.50',
          }
        }}
      >
        <input {...getInputProps()} />
        
        <CloudUpload 
          sx={{ 
            fontSize: 48, 
            color: isDragActive ? 'primary.main' : 'grey.400',
            mb: 2 
          }} 
        />
        
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop documents'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse
        </Typography>
        
        <Typography variant="caption" color="text.secondary">
          Supports PDF, Excel (.xlsx, .xls) • Max 50MB per file • Up to 10 files
        </Typography>
      </Paper>

      {hasFiles && (
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={onProcessDocuments}
          disabled={loading}
          startIcon={<Description />}
          sx={{ 
            mt: 3,
            py: 1.5,
            fontWeight: 600,
            backgroundColor: '#059669',
            '&:hover': {
              backgroundColor: '#047857',
            }
          }}
        >
          {loading ? 'Processing...' : 'Process Documents'}
        </Button>
      )}
    </Box>
  );
};

export default FileUpload; 