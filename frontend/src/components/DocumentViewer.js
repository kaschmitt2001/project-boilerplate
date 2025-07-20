import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import { Description, TableChart, Visibility } from '@mui/icons-material';

const DocumentViewer = ({ files, extractedData }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  if (!files || files.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No documents to preview
      </Typography>
    );
  }

  const renderFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      return <Description sx={{ color: '#d32f2f' }} />;
    } else if (['xlsx', 'xls'].includes(ext)) {
      return <TableChart sx={{ color: '#2e7d32' }} />;
    }
    return <Description />;
  };

  const renderFilePreview = (file, index) => {
    const ext = file.name.split('.').pop().toLowerCase();
    
    return (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {renderFileIcon(file.name)}
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {ext.toUpperCase()} • {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          </Box>

          {ext === 'pdf' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                PDF preview not available in this demo. The content has been extracted and processed.
              </Typography>
            </Alert>
          )}

          {(['xlsx', 'xls'].includes(ext)) && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Excel preview not available in this demo. The data has been extracted and processed.
              </Typography>
            </Alert>
          )}

          {/* Basic file info */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`Type: ${ext.toUpperCase()}`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`Size: ${(file.size / 1024).toFixed(0)} KB`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label="Processed ✓" 
              size="small" 
              color="success" 
              variant="outlined" 
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderExtractedDataPreview = () => {
    if (!extractedData) {
      return (
        <Alert severity="info">
          Process documents to see extracted data mapping
        </Alert>
      );
    }

    const highlights = [];
    
    // Parse extracted data if it's a string
    let data = extractedData;
    try {
      if (typeof extractedData === 'string') {
        data = JSON.parse(extractedData.replace(/```json|```/g, '').trim());
      }
    } catch (error) {
      data = { error: 'Failed to parse data' };
    }

    // Extract key highlights
    if (data && typeof data === 'object' && !data.error) {
      if (data.bill_of_lading_number) highlights.push({ label: 'BOL #', value: data.bill_of_lading_number });
      if (data.container_number) highlights.push({ label: 'Container', value: data.container_number });
      if (data.consignee_name) highlights.push({ label: 'Consignee', value: data.consignee_name });
      if (data.date) highlights.push({ label: 'Date', value: data.date });
      if (data.line_items_count) highlights.push({ label: 'Line Items', value: data.line_items_count });
      if (data.average_gross_weight) highlights.push({ label: 'Avg Weight', value: data.average_gross_weight });
      if (data.average_price) highlights.push({ label: 'Avg Price', value: data.average_price });
    }

    return (
      <Box>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
          Extracted Highlights
        </Typography>
        
        {highlights.length > 0 ? (
          <List dense>
            {highlights.map((item, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>
                        {item.value}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Alert severity="warning">
            No key data points extracted yet
          </Alert>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Tabs 
        value={selectedTab} 
        onChange={handleTabChange} 
        variant="fullWidth"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab 
          icon={<Visibility />} 
          label="Files" 
          sx={{ fontSize: '0.75rem', minHeight: 'auto', py: 1 }}
        />
        <Tab 
          icon={<Description />} 
          label="Data" 
          sx={{ fontSize: '0.75rem', minHeight: 'auto', py: 1 }}
        />
      </Tabs>

      {selectedTab === 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
            Uploaded Documents ({files.length})
          </Typography>
          {files.map((file, index) => renderFilePreview(file, index))}
        </Box>
      )}

      {selectedTab === 1 && renderExtractedDataPreview()}
    </Box>
  );
};

export default DocumentViewer; 