import { useState } from 'react';

interface FormState {
  loading: boolean;
  error: string;
  success: string;
}

export const useFormState = () => {
  const [formState, setFormState] = useState<FormState>({
    loading: false,
    error: '',
    success: ''
  });

  const setLoading = (loading: boolean) => {
    setFormState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string) => {
    setFormState(prev => ({ ...prev, error, success: '' }));
  };

  const setSuccess = (success: string) => {
    setFormState(prev => ({ ...prev, success, error: '' }));
  };

  const clearMessages = () => {
    setFormState(prev => ({ ...prev, error: '', success: '' }));
  };

  return {
    ...formState,
    setLoading,
    setError,
    setSuccess,
    clearMessages
  };
};