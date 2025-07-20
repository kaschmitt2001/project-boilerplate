import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  Alert
} from '@mui/material';
import { Save, Download } from '@mui/icons-material';

const DocumentForm = ({ extractedData, onDataChange }) => {
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when extractedData changes
  useEffect(() => {
    if (extractedData) {
              try {
        let data = extractedData;
        
        if (typeof extractedData === 'string') {
          const cleanedData = extractedData.replace(/```json|```/g, '').trim();
          data = JSON.parse(cleanedData);
        }
        
        setFormData(data);
        setHasChanges(false);
      } catch (error) {
        setFormData({ error: 'Failed to parse extracted data', raw: extractedData });
      }
    }
  }, [extractedData]);

  const handleFieldChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    setHasChanges(true);
    onDataChange(updatedData);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted-shipment-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!extractedData) {
    return (
      <Typography variant="body2" color="text.secondary">
        No data to display
      </Typography>
    );
  }

  if (formData.error || formData.parse_error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Data Parsing Issue</Typography>
        <Typography variant="body2">
          {formData.error || formData.parse_error}
        </Typography>
        {formData.raw_response && (
          <Box sx={{ mt: 1, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(formData.raw_response, null, 2)}
            </Typography>
          </Box>
        )}
      </Alert>
    );
  }

  const sections = [
    {
      title: 'Document Information',
      fields: [
        { key: 'bill_of_lading_number', label: 'Bill of Lading Number' },
        { key: 'container_number', label: 'Container Number' },
        { key: 'date', label: 'Date' }
      ]
    },
    {
      title: 'Consignee Information',
      fields: [
        { key: 'consignee_name', label: 'Consignee Name' },
        { key: 'consignee_address', label: 'Consignee Address', multiline: true }
      ]
    },
    {
      title: 'Shipment Analytics',
      fields: [
        { key: 'line_items_count', label: 'Line Items Count' },
        { key: 'average_gross_weight', label: 'Average Gross Weight' },
        { key: 'average_price', label: 'Average Price' }
      ]
    }
  ];

  return (
    <Box>
      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={handleSave}
          disabled={!hasChanges}
          startIcon={<Save />}
          sx={{ fontSize: '0.75rem' }}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleExport}
          startIcon={<Download />}
          sx={{ fontSize: '0.75rem' }}
        >
          Export
        </Button>
        {hasChanges && (
          <Chip label="Unsaved changes" color="warning" size="small" />
        )}
      </Box>

      {/* Form Sections */}
      {sections.map((section, sectionIndex) => (
        <Box key={section.title} sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 2 }}>
            {section.title}
          </Typography>
          
          <Grid container spacing={2}>
            {section.fields.map((field) => (
              <Grid item xs={12} key={field.key}>
                <TextField
                  fullWidth
                  size="small"
                  label={field.label}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  multiline={field.multiline}
                  rows={field.multiline ? 2 : 1}
                  sx={{ 
                    '& .MuiInputBase-input': { fontSize: '0.875rem' },
                    '& .MuiInputLabel-root': { fontSize: '0.875rem' }
                  }}
                />
              </Grid>
            ))}
          </Grid>
          
          {sectionIndex < sections.length - 1 && (
            <Divider sx={{ mt: 3 }} />
          )}
        </Box>
      ))}


    </Box>
  );
};

export default DocumentForm; 