from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import tempfile
import json

from app.services.document_processor import process_documents
from app.services.llm_service import extract_field_from_document
from app.core.config import settings

router = APIRouter()

@router.post("/process-documents", response_model=dict)
async def process_documents_endpoint(
    files: List[UploadFile] = File(...)
):
    # Validation
    if len(files) > settings.MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Too many files. Maximum {settings.MAX_FILES} allowed.")
    
    temp_file_paths = []
    
    try:
        for file in files:
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in settings.ALLOWED_DOCUMENT_TYPES:
                raise HTTPException(
                    status_code=400, 
                    detail=f"File type {file_ext} not allowed. Allowed types: {settings.ALLOWED_DOCUMENT_TYPES}"
                )
            
            content = await file.read()
            if len(content) > settings.MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail=f"File {file.filename} too large. Maximum size: {settings.MAX_FILE_SIZE} bytes")
            
            temp_file = tempfile.NamedTemporaryFile(suffix=file.filename, delete=False)
            temp_file_paths.append(temp_file.name)
            temp_file.write(content)
            temp_file.close()

        processing_result = process_documents(temp_file_paths)
        
        if processing_result['successful_extractions'] == 0:
            raise HTTPException(status_code=422, detail="No documents could be processed successfully")

        extracted_data_raw = extract_field_from_document(processing_result['extracted_data'])
        
        # Parse JSON response from LLM
        try:
            if isinstance(extracted_data_raw, dict):
                # Check if it's an error response from LLM service
                if "error" in extracted_data_raw:
                    raise HTTPException(status_code=500, detail=extracted_data_raw["error"])
                extracted_data = extracted_data_raw
            elif isinstance(extracted_data_raw, str):
                extracted_data_raw = extracted_data_raw.strip()
                if not extracted_data_raw:
                    raise HTTPException(status_code=500, detail="Empty response from LLM API - check your API key")
                
                # Clean up markdown code blocks
                if extracted_data_raw.startswith('```json'):
                    extracted_data_raw = extracted_data_raw[7:]
                if extracted_data_raw.endswith('```'):
                    extracted_data_raw = extracted_data_raw[:-3]
                
                # Extract JSON from response (LLM often adds explanatory text)
                json_start = extracted_data_raw.find('{')
                json_end = extracted_data_raw.rfind('}')
                if json_start != -1 and json_end != -1:
                    extracted_data_raw = extracted_data_raw[json_start:json_end+1]
                
                extracted_data = json.loads(extracted_data_raw)
            else:
                raise HTTPException(status_code=500, detail=f"Unexpected response type from LLM: {type(extracted_data_raw)}")
                
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse LLM response: {str(e)}")

        return {
            "success": True,
            "message": f"Successfully processed {processing_result['successful_extractions']} documents",
            "extracted_data": extracted_data,
            "processing_summary": processing_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
    finally:
        # Clean up temp files
        for path in temp_file_paths:
            try:
                if os.path.exists(path):
                    os.unlink(path)
            except Exception:
                pass


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "allowed_types": settings.ALLOWED_DOCUMENT_TYPES
    } 
