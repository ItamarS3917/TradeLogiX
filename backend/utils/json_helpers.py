
import json
from typing import Any, Dict, List, Optional, Union

def ensure_json_serializable(value):
    if value is None:
        return value
    
    if isinstance(value, (str, int, float, bool)):
        return value
    
    if isinstance(value, (list, tuple)):
        return [ensure_json_serializable(item) for item in value]
    
    if isinstance(value, dict):
        return {key: ensure_json_serializable(val) for key, val in value.items()}
    
    return str(value)

def process_json_field(field_value):
    if field_value is None:
        return None
    
    if isinstance(field_value, (list, dict)):
        return ensure_json_serializable(field_value)
    
    if isinstance(field_value, str):
        try:
            return json.loads(field_value)
        except json.JSONDecodeError:
            return [field_value]
    
    return [str(field_value)]
