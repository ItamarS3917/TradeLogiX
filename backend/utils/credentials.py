"""
Sample module showing how to use environment variables for sensitive data
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_google_api_credentials():
    """
    Get Google API credentials from environment variables
    """
    api_key = os.getenv('GOOGLE_API_KEY')
    
    if not api_key:
        raise EnvironmentError("GOOGLE_API_KEY environment variable is not set")
    
    return {
        'api_key': api_key
    }

def get_firebase_credentials():
    """
    Get Firebase credentials from environment variables
    """
    return {
        'api_key': os.getenv('FIREBASE_API_KEY'),
        'auth_domain': os.getenv('FIREBASE_AUTH_DOMAIN'),
        'project_id': os.getenv('FIREBASE_PROJECT_ID'),
        'storage_bucket': os.getenv('FIREBASE_STORAGE_BUCKET'),
        'messaging_sender_id': os.getenv('FIREBASE_MESSAGING_SENDER_ID'),
        'app_id': os.getenv('FIREBASE_APP_ID'),
        'measurement_id': os.getenv('FIREBASE_MEASUREMENT_ID')
    }

# Example usage
if __name__ == "__main__":
    try:
        google_creds = get_google_api_credentials()
        print("Successfully loaded Google API credentials")
        
        firebase_creds = get_firebase_credentials()
        print("Successfully loaded Firebase credentials")
    except EnvironmentError as e:
        print(f"Error: {e}")
        print("Make sure you have created a .env file with the required variables")
