'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'Alimentação',
    'Saúde',
    'Serviços',
    'Mobilidade',
    'Lazer',
    'Segurança'
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      text_original: formData.get('text_original'),
      category: selectedCategory || null, // Use state for category
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
      setSelectedCategory('');
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '2rem' }}>map</span>
          <h2 className={styles.brandText}>OsascoMap</h2>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.headlineContainer}>
            <h1 className={styles.headline}>
              O que está faltando aqui?
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            {/* Main Input */}
            <div className={styles.inputGroup}>
              <input
                autoFocus
                type="text"
                name="text_original"
                className={styles.mainInput}
                placeholder="Aqui não tem..."
                required
                minLength={10}
              />
            </div>

            {/* Action Button */}
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                'Registrando...'
              ) : (
                <>
                  <span>Registrar</span>
                </>
              )}
            </button>

            {/* Messages */}
            {success && (
              <div style={{ color: 'var(--success)', textAlign: 'center', marginBottom: '1rem', fontWeight: 500 }}>
                Registrado! Obrigado por contribuir.
              </div>
            )}
            {error && (
              <div style={{ color: 'var(--error)', textAlign: 'center', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {/* Details Section */}
            <details className={styles.details} open={false}>
              <summary className={styles.summary}>
                <span className="material-symbols-outlined text-base">+</span>
                Adicionar detalhes (opcional)
              </summary>

              <div className={styles.detailsContent}>
                <div>
                  <p className={styles.categoryLabel}>Categoria</p>
                  <div className={styles.categoryGroup}>
                    {categories.map((cat) => (
                      <label key={cat} style={{ position: 'relative' }}>
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={selectedCategory === cat}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className={styles.categoryRadio}
                        />
                        <span className={styles.categoryTag}>
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <textarea
                    name="comment"
                    className={styles.textarea}
                    placeholder="Comentário adicional..."
                    rows={3}
                  />
                </div>
              </div>
            </details>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.badge}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>visibility_off</span>
          <p className={styles.badgeText}>
            100% anônimo • Sem cadastro
          </p>
        </div>
      </footer>

      {/* Material Symbols Script (loaded here for simplicity if not in layout) */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    </>
  );
}
