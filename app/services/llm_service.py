import anthropic
from app.core.config import settings

# client = anthropic.Anthropic(api_key=settings.API_KEY)
client = None  # Commented out for review - API key removed


def extract_field_from_document(document_data):
    """
    Use Anthropic Claude to extract specific fields from document data.
    
    Args:
        document_data: Dictionary containing extracted text from documents
        
    Returns:
        dict: Extracted field values
    """
    if not document_data:
        return {}
    
    # Combine all document text
    combined_text = ""
    for key, value in document_data.items():
        if isinstance(value, str):
            combined_text += f"\n{key.upper()}:\n{value}\n"
    
    if not combined_text.strip():
        return {}

    prompt = f"""Extract these 8 fields from the shipment documents (treat PDF+Excel as single shipment):

- bill_of_lading_number: HBL/BOL number
- container_number: Container ID  
- consignee_name: Recipient company name
- consignee_address: Full consignee address
- date: Shipment/invoice date
- line_items_count: Number of distinct product items
- average_gross_weight: Total weight ÷ line_items_count
- average_price: Total value ÷ line_items_count

DATA QUALITY: If Excel and PDF have similar values differing by 1-2 characters, prefer Excel version.

DOCUMENTS:
{combined_text}

Return valid JSON with these 8 fields. Use null for missing values. Use numbers for weights/prices."""

    try:
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1500,
            temperature=0.1,
            messages=[{"role": "user", "content": prompt}]
        )
        
        result = response.content[0].text.strip()
        if not result:
            return {"error": "Empty response from Anthropic API"}
        return result
    except Exception as e:
        return {"error": f"Failed to extract data: {str(e)}"}
