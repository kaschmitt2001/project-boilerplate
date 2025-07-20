import React, { useState } from 'react';
import { Container, Box, Typography, Grid, Paper, Alert, CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import FileUpload from './components/FileUpload';
import DocumentForm from './components/DocumentForm';
import DocumentViewer from './components/DocumentViewer';
import { processDocuments } from './services/api';

function App() {
  const [files, setFiles] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingComplete, setProcessingComplete] = useState(false);

  const handleFilesSelected = (selectedFiles) => {
    setFiles(selectedFiles);
    setExtractedData(null);
    setError(null);
    setProcessingComplete(false);
  };

  const handleProcessDocuments = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await processDocuments(files);
      setExtractedData(result.extracted_data);
      setProcessingComplete(true);
      toast.success(`Successfully processed ${result.processing_summary.successful_extractions} documents`);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to process documents';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormDataChange = (updatedData) => {
    setExtractedData(updatedData);
  };

  return (
    <div className="App">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
            Document Processor
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Upload shipment documents (PDF, Excel) and extract structured data automatically
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - File Upload */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                Upload Documents
              </Typography>
              <FileUpload 
                onFilesSelected={handleFilesSelected}
                onProcessDocuments={handleProcessDocuments}
                loading={loading}
                hasFiles={files.length > 0}
              />
              
              {loading && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Processing documents...
                  </Typography>
                </Box>
              )}

              {files.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Files:
                  </Typography>
                  {files.map((file, index) => (
                    <Typography key={index} variant="body2" sx={{ 
                      fontSize: '0.875rem', 
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1
                    }}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Middle Column - Extracted Data Form */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                Extracted Data
              </Typography>
              {processingComplete ? (
                <DocumentForm 
                  extractedData={extractedData} 
                  onDataChange={handleFormDataChange}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <Typography variant="body1">
                    Upload and process documents to see extracted data here
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - Document Viewer */}
          <Grid item xs={12} md={4}>
            <DocumentViewer 
              files={files} 
              extractedData={extractedData}
            />
          </Grid>
        </Grid>
      </Container>

      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App; 