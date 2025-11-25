import { useState, useEffect } from 'react';
import { ExpressiveView } from './components/ExpressiveView';
import { sentimentEngine } from './lib/sentiment-engine';
import type { SentimentResult } from './lib/sentiment-engine';

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.trim()) {
        handleAnalyze(text);
      } else {
        setResult(null);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [text]);

  const handleAnalyze = async (inputText: string) => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const res = await sentimentEngine.predict(inputText);
      setResult(res);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ExpressiveView
      text={text}
      onChange={setText}
      result={result}
      loading={loading}
    />
  );
}

export default App;
