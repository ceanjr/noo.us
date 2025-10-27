import { useState, useCallback } from 'react';
import { showToast } from '../components/Toast';

/**
 * Hook compartilhado para formulários de criação de surpresas
 * Gerencia estado, validação e submissão de forma unificada
 * 
 * @param {string} type - Tipo da surpresa ('message' | 'photo' | 'music' | 'date')
 * @param {Function} onSubmit - Callback de submissão
 * @param {Function} onClose - Callback de fechamento
 * @returns {Object} Estado e handlers do formulário
 */
export const useSurpriseForm = (type, onSubmit, onClose) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subtitle: '',
  });
  const [submitting, setSubmitting] = useState(false);

  /**
   * Atualiza campo do formulário
   */
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Valida campos obrigatórios baseado no tipo
   */
  const validate = useCallback(() => {
    if (!formData.title.trim()) {
      showToast('Título é obrigatório', 'error');
      return false;
    }

    if (!formData.content.trim()) {
      const contentLabel = {
        message: 'Mensagem',
        photo: 'URL da foto',
        music: 'Link da música',
        date: 'Local do encontro',
      }[type] || 'Conteúdo';
      
      showToast(`${contentLabel} é obrigatório`, 'error');
      return false;
    }

    // Validação específica para música (deve ser URL)
    if (type === 'music') {
      try {
        new URL(formData.content);
      } catch {
        showToast('Link da música inválido', 'error');
        return false;
      }
    }

    return true;
  }, [formData, type]);

  /**
   * Handler de submissão
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        subtitle: formData.subtitle?.trim() || '',
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar surpresa:', error);
      showToast('Erro ao criar surpresa', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [formData, type, validate, onSubmit, onClose]);

  /**
   * Reseta formulário
   */
  const reset = useCallback(() => {
    setFormData({ title: '', content: '', subtitle: '' });
    setSubmitting(false);
  }, []);

  return {
    formData,
    updateField,
    submitting,
    handleSubmit,
    reset,
  };
};
