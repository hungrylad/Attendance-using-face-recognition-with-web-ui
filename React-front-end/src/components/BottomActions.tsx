import React, { useState } from 'react';
import axios from 'axios';
import { Brain, XCircle } from 'lucide-react';
import { Button } from './Button';
import { useAppState } from '../context/AppStateContext';

export function BottomActions() {
  const [message, setMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { resetState } = useAppState();

  const handleApiCall = async (endpoint: string, actionName: string) => {
    setIsProcessing(true);
    setMessage('Model is being trained, please wait...');

    try {
      const response = await axios.get(`http://localhost:5000${endpoint}`);
      setMessage(response.data.message || 'Training completed successfully!');

      setTimeout(() => {
        setMessage('');
      }, 8000);
    } catch (error) {
      console.error(`Error during ${actionName}:`, error);
      setMessage(`Error during ${actionName}: ${error.message}`);

      setTimeout(() => {
        setMessage('');
      }, 8000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setIsProcessing(false);
    resetState();
  };

  return (
    <div className="flex justify-between w-full max-w-4xl mx-auto px-4">
      <Button
        variant="secondary"
        icon={Brain}
        onClick={() => handleApiCall('/api/train', 'Train')}
        className="relative overflow-hidden animate-color-flow text-white"
      >
        Train
      </Button>

      <Button
        variant="danger"
        icon={XCircle}
        onClick={handleReset}
      >
        Reset
      </Button>

      {message && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white p-4 rounded-md shadow-lg transition-opacity duration-1000 ${
            isProcessing ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transition: 'opacity 8s' }}
        >
          {message}
        </div>
      )}
    </div>
  );
}