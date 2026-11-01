import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function useFormSubmit(action, { successMessage, redirectTo, onSuccess } = {}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);

  const submit = async (payload) => {
    setSubmitting(true);
    setServerErrors([]);
    try {
      const res = await action(payload);
      if (successMessage) toast.success(successMessage);
      if (onSuccess) onSuccess(res);
      if (redirectTo) navigate(redirectTo);
    } catch (err) {
      setServerErrors(err.errors || []);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, serverErrors };
}