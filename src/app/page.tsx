'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      text_original: formData.get('text_original'),
      category: formData.get('category'),
      comment: formData.get('comment'),
    };

    try {
      const res = await fetch('/api/missing-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Erro ao registrar.');
      }

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>O que não tem onde você vive?</h1>
        <p className={styles.subtitle}>Registre o que está faltando em Osasco.</p>
      </header>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.field}>
            <label htmlFor="text_original" className={styles.label}>
              O que está faltando? <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <input
              type="text"
              id="text_original"
              name="text_original"
              className={styles.input}
              placeholder="Ex: Aqui não tem uma cantina italiana tradicional"
              required
              minLength={10}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="category" className={styles.label}>Categoria</label>
            <select id="category" name="category" className={styles.select} defaultValue="">
              <option value="" disabled>Selecione uma opção (opcional)</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Saúde">Saúde</option>
              <option value="Serviços">Serviços</option>
              <option value="Mobilidade">Mobilidade</option>
              <option value="Lazer">Lazer</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="comment" className={styles.label}>Comentário adicional</label>
            <textarea
              id="comment"
              name="comment"
              className={styles.textarea}
              placeholder="Ex: Tenho que ir até Alphaville para achar uma boa."
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
        </form>

        {success && (
          <div className={`${styles.message} ${styles.success}`}>
            Registrado! Obrigado por contribuir.
          </div>
        )}

        {error && (
          <div className={`${styles.message} ${styles.error}`}>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
