
from datetime import datetime
from typing import Optional, Union, Any

def parse_date_string(date_string):
    if isinstance(date_string, datetime):
        return date_string
        
    if not isinstance(date_string, str):
        return None
        
    try:
        if date_string.endswith('Z'):
            date_string = date_string[:-1] + '+00:00'
        
        return datetime.fromisoformat(date_string)
    except ValueError:
        pass
    
    formats = [
        '%Y-%m-%dT%H:%M:%S.%f',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d',
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    
    return None
