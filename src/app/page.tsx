"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, ShieldCheck, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Handle mounting to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
      data-testid="button-theme-toggle"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Moon className="w-5 h-5 text-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-foreground" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

export default function Home() {
  const [suggestion, setSuggestion] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  // UX Instrumentation State
  const [sessionId, setSessionId] = useState("");
  const [loadTime, setLoadTime] = useState(0);
  const [hasFocused, setHasFocused] = useState(false);
  const [hasInput, setHasInput] = useState(false);

  // Initialize Session and T0
  useEffect(() => {
    // t0: Time when component mounts (approx DOM ready for interaction)
    const t0 = performance.now();
    setLoadTime(t0);

    // Generate or retrieve Session ID
    let sid = localStorage.getItem("ux_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("ux_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  const trackEvent = async (metric: any) => {
    if (!sessionId) return; // Wait for hydration

    // Determine device type roughly
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          page: '/',
          device_type: isMobile ? 'mobile' : 'desktop',
          referrer: document.referrer,
          ...metric
        }),
        keepalive: true // Ensure request is sent even if page unloads (optional but good)
      });
    } catch (e) {
      console.error("Metric error", e);
    }
  };

  const handleFocus = () => {
    if (!hasFocused) {
      setHasFocused(true);
      const tFocus = performance.now();
      // We can track focus time if we want, but user emphasized TTFC.
      // Keeping it simple for now, or we could send it.
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuggestion(e.target.value);

    // Track First Input (TTFC)
    if (!hasInput && e.target.value.length > 0) {
      setHasInput(true);
      const t1 = performance.now();
      const ttfc = Math.round(t1 - loadTime);
      const tFocus = performance.now(); // Approx

      // Send the golden metric
      trackEvent({
        ttfc_ms: ttfc,
        first_focus_ms: Math.round(tFocus - loadTime) // Rough estimate if they focused just before
      });
    }
  };

  // Placeholder Typewriter Effect
  const placeholders = [
    "Ex: farmácia 24h no bairro…",
    "Ex: Alguem pra conversar",
    "Ex: alguém que recolha vidro…",
    "Ex: Clube de tiro",
    "Ex: restaurante árabe perto…",
    "Ex: parque infantil seguro…"
  ];
  const [placeholder, setPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % placeholders.length;
      const fullText = placeholders[i];

      setPlaceholder(isDeleting
        ? fullText.substring(0, placeholder.length - 1)
        : fullText.substring(0, placeholder.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 100);

      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 1500); // Wait before deleting
      } else if (isDeleting && placeholder === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed, placeholders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/missing-items', {
        method: 'POST',
        body: JSON.stringify({
          text_original: suggestion,
          comment: details,
          category: null // Optional in V2
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        // In case of error (rate limit, etc), we could show it.
        // For now, fail silently or maybe shake the input? 
        // The V2 UI spec didn't handle errors explicitly, so we keep it simple.
        const json = await res.json();
        console.error(json.error);
        // Optional: alert(json.error);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSuggestion("");
        setDetails("");
        setShowDetails(false);
      }, 3000);

    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <header className="w-full py-5 px-6 flex items-center justify-end">
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-24">
        <div className="w-full max-w-md -mt-20">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-500" />
                </div>
                <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                  Sugestão registrada!
                </h2>
                <p className="text-muted-foreground">
                  Obrigado por contribuir com sua comunidade.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="flex flex-col items-center mb-12">
                  <div className="flex items-center gap-2.5 mb-20">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                    <span className="font-display font-extrabold text-2xl text-foreground" data-testid="text-logo">
                      Aqui não tem!
                    </span>
                  </div>
                  <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4 text-center" data-testid="text-heading">
                    O que está faltando aqui?
                  </h1>
                  <p className="font-display font-medium text-lg text-muted-foreground text-center" data-testid="text-subheading">
                    Ex: na sua rua, bairro, cidade ou vida
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder={placeholder}
                    value={suggestion}
                    onFocus={handleFocus}
                    onChange={handleChange}
                    className="h-14 px-5 text-base border-2 border-primary/20 focus:border-primary rounded-xl bg-background shadow-sm transition-all duration-200 focus:shadow-md"
                    data-testid="input-suggestion"
                    minLength={10}
                  />

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          placeholder="Adicione mais detalhes sobre sua sugestão..."
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          rows={3}
                          className="w-full px-5 py-4 text-base border-2 border-primary/20 focus:border-primary rounded-xl bg-background shadow-sm transition-all duration-200 focus:shadow-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground mb-4"
                          data-testid="input-details"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full flex items-center justify-center gap-1 text-primary font-medium text-sm hover:text-primary/80 transition-colors py-2 mb-2"
                    data-testid="button-toggle-details"
                  >
                    <Plus className={`w-4 h-4 transition-transform duration-200 ${showDetails ? 'rotate-45' : ''}`} />
                    {showDetails ? "Ocultar detalhes" : "Adicionar detalhes (opcional)"}
                  </button>

                  <Button
                    type="submit"
                    disabled={!suggestion.trim() || isSubmitting}
                    className="w-full h-14 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
                    data-testid="button-submit"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : (
                      "Registrar"
                    )}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-5 flex justify-center pointer-events-none">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 shadow-sm pointer-events-auto">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium" data-testid="text-privacy">
            100% anônimo • Sem cadastro
          </span>
        </div>
      </footer>
    </div>
  );
}
