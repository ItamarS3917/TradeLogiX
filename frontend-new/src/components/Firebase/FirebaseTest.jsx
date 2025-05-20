// File: FirebaseTest.jsx
// Purpose: Component to test Firebase connection

import React, { useState } from 'react';
import { db, collection, addDoc, getDocs } from '../../config/firebase';

const FirebaseTest = () => {
  const [status, setStatus] = useState('');
  const [documents, setDocuments] = useState([]);

  // Test adding a document to Firestore
  const testAddDocument = async () => {
    try {
      setStatus('Testing Firebase connection...');
      
      // Add a document to the test collection
      const docRef = await addDoc(collection(db, 'test'), {
        message: 'Test document',
        timestamp: new Date(),
        value: Math.random()
      });
      
      setStatus(`Success! Document added with ID: ${docRef.id}`);
      
      // Refresh the document list
      testGetDocuments();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Firebase test error:', error);
    }
  };

  // Test getting documents from Firestore
  const testGetDocuments = async () => {
    try {
      setStatus('Getting documents...');
      
      // Get all documents from the test collection
      const querySnapshot = await getDocs(collection(db, 'test'));
      
      // Convert to array of documents
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setDocuments(docs);
      setStatus(`Found ${docs.length} documents`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      console.error('Firebase get documents error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Firebase Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testAddDocument}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4285F4', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Add Test Document
        </button>
        
        <button 
          onClick={testGetDocuments}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#34A853', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Get Test Documents
        </button>
      </div>
      
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <strong>Status:</strong> {status}
      </div>
      
      {documents.length > 0 && (
        <div>
          <h3>Documents in 'test' Collection</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {documents.map((doc) => (
              <li key={doc.id} style={{ 
                padding: '10px', 
                margin: '5px 0',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <strong>ID:</strong> {doc.id}<br />
                <strong>Message:</strong> {doc.message}<br />
                <strong>Timestamp:</strong> {doc.timestamp.toDate().toString()}<br />
                <strong>Value:</strong> {doc.value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
