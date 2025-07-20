# Document Processing Application

Extracts shipment data from PDF and Excel documents using Anthropic's Claude API. Built as a 3-hour technical demonstration.

## Local Development Setup

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```
###2. Start Backend Server
```bash
# From project root directory
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
```

### 5. Test the Application
- Open http://localhost:3000
- Upload both PDF and Excel files to test extraction
- Backend API available at http://localhost:8000/docs

## What It Does

Extracts 8 specific fields from shipment documents:
- Bill of Lading number
- Container number  
- Consignee name & address
- Date
- Line items count
- Average gross weight & price

## Key Design Decisions & Tradeoffs

**OCR for PDFs**: Many shipping documents are scanned images, so we added Tesseract OCR. This works but is slower than pure text extraction.

**Excel + PDF combo**: Treating both documents as a single shipment rather than separate extractions. The Excel usually has detailed line items while the PDF has shipping info.

**Claude over GPT**: Anthropic's Claude handles structured extraction better in our testing, especially with inconsistent document formats.

**No database**: Everything processes in-memory for simplicity. In production you'd want persistent storage for documents and extracted data.

**Frontend validation**: Basic client-side editing of extracted data, but no complex validation rules since document formats vary wildly.

## With More Time

**Docker**: Complete and test Docker setup. It is close to ready but not fully tested

**Document storage**: Upload files to S3/similar instead of processing in-memory. Store original documents for audit trails.

**Database layer**: PostgreSQL with tables for shipments, documents, extracted_data. Would enable search, reporting, batch processing.

**Better PDF handling**: Multiple OCR engines (Tesseract + cloud services), better preprocessing for image quality.

**Template detection**: Auto-detect document types and apply specialized extraction logic per shipping line or document format.

**Confidence scoring**: Have the LLM return confidence levels for each extracted field. Flag low-confidence extractions for human review.

**API rate limiting**: Anthropic API costs add up quickly with large documents.

## Technical Stack

- **Backend**: FastAPI + Anthropic Claude + PyPDF2 + Tesseract OCR
- **Frontend**: React + Material-UI  
- **Processing**: pandas for Excel, pdfplumber + pytesseract for PDFs