import React from 'react';
import LoadingStates from './LoadingStates';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export default function LoadingSpinner({ 
  size = 'large', 
  color, 
  message 
}: LoadingSpinnerProps) {
  return (
    <LoadingStates 
      type="spinner" 
      size={size} 
      color={color} 
      message={message} 
    />
  );
} 