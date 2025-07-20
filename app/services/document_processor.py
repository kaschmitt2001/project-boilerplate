import os
from app.utils.pdf_utils import extract_text_from_pdf, extract_data_from_excel, get_pdf_info, get_excel_info
from app.core.config import settings

def process_documents(file_paths):
    """
    Process different types of documents and extract relevant information.
    
    Args:
        file_paths: List of paths to the documents
        
    Returns:
        dict: Extracted data from documents with metadata
    """
    extracted_data = {}
    document_metadata = {}
    
    for file_path in file_paths:
        if not os.path.exists(file_path):
            extracted_data[f'error_{os.path.basename(file_path)}'] = "File not found"
            continue
            
        file_ext = os.path.splitext(file_path)[1].lower()
        file_name = os.path.basename(file_path)
        
        try:
            if file_ext == ".pdf":
                extracted_data[f'pdf_{file_name}'] = extract_text_from_pdf(file_path)
                document_metadata[f'pdf_{file_name}'] = get_pdf_info(file_path)
                
            elif file_ext in [".xlsx", ".xls"]:
                extracted_data[f'excel_{file_name}'] = extract_data_from_excel(file_path)
                document_metadata[f'excel_{file_name}'] = get_excel_info(file_path)
                
            else:
                extracted_data[f'unsupported_{file_name}'] = f"Unsupported file type: {file_ext}"
                
        except Exception as e:
            extracted_data[f'error_{file_name}'] = f"Error processing file: {str(e)}"
    
    return {
        "extracted_data": extracted_data,
        "metadata": document_metadata,
        "processed_files": len(file_paths),
        "successful_extractions": len([k for k in extracted_data.keys() if not k.startswith('error_')])
    } 