import { useState, useRef, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Grid,
  CircularProgress,
  Alert,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  PictureAsPdf as PdfIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { darkTheme } from './theme';
import { FormData, AnalysisResult, Language, CompatibilityFormData, CompatibilityResult } from './types';
import { TRANSLATIONS, zodiacEmoji, chineseZodiacEmoji } from './constants/translations';
import { translateZodiac, translateChineseZodiac } from './utils/translations';
import { BirthForm } from './components/BirthForm';
import { ResultCard } from './components/ResultCard';
import { PythagorasGrid } from './components/PythagorasGrid';
import { CompatibilityForm } from './components/CompatibilityForm';
import { CompatibilityResultComponent } from './components/CompatibilityResult';

function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));

  const [mode, setMode] = useState<'analysis' | 'compatibility'>('analysis');

  const [formData, setFormData] = useState<FormData>({
    date: '',
    time: '',
    place: '',
    gender: 'male',
  });

  const [compData, setCompData] = useState<CompatibilityFormData>({
    partner1: { date: '', time: '', place: '', gender: 'male' },
    partner2: { date: '', time: '', place: '', gender: 'female' },
  });

  const resultsRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [compResult, setCompResult] = useState<CompatibilityResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const [error, setError] = useState('');

  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompChange = (partner: 'partner1' | 'partner2', field: string, value: any) => {
    setCompData({
      ...compData,
      [partner]: { ...compData[partner], [field]: value }
    });
  };

  // --- Presentation API (Playwright-like control) ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, action, payload } = event.data;

      if (type === 'PRESENTATION_COMMAND') {
        console.log('Foreteller received command:', action, payload);

        if (action === 'FILL_FIELD') {
          const { name, value } = payload;
          setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (action === 'HIGHLIGHT_FIELD') {
          setHighlightedField(payload.name);
          setApiMessage(payload.message || null);
          if (payload.name) {
            const el = document.getElementsByName(payload.name)[0];
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }

        if (action === 'SET_LANGUAGE') {
          setLang(payload.lang);
        }

        if (action === 'TOGGLE_AUDIO') {
          handleListen();
        }

        if (action === 'SUBMIT') {
          setResult(null);
          const formElement = document.querySelector('form');
          if (formElement) {
            formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
          setHighlightedField(null);
          setApiMessage(null);
        }

        if (action === 'SCROLL') {
          const { direction, value } = payload;
          setHighlightedField(null);
          setApiMessage(null);
          if (direction === 'down') {
            const scrollPos = value || 850;
            window.scrollTo({ top: scrollPos, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }

        if (action === 'DOWNLOAD_PDF') {
          handleDownloadPDF();
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [lang, result]);

  // Auto-translate analysis when language changes
  useEffect(() => {
    const translateAnalysis = async () => {
      if (result?.aiAnalysis && result.input?.language !== lang) {
        setIsTranslating(true);
        try {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: result.aiAnalysis, targetLang: lang }),
          });
          const data = await response.json();
          if (response.ok && data.translatedText) {
            setResult({
              ...result,
              aiAnalysis: data.translatedText,
              input: result.input ? {
                ...result.input,
                language: lang
              } : undefined
            });
          }
        } catch (err) {
          console.error('Translation failed:', err);
        } finally {
          setIsTranslating(false);
        }
      }
    };

    if (result) {
      translateAnalysis();
    }
  }, [lang, result?.aiAnalysis]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) {
      setError(t.fillAll);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCompResult(null);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language: lang }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompatibilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compData.partner1.date || !compData.partner2.date) {
      setError(t.fillAll);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCompResult(null);

    try {
      const response = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner1: compData.partner1,
          partner2: compData.partner2,
          language: lang
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setCompResult(data);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleListen = () => {
    const synth = window.speechSynthesis;
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      return;
    }
    if (!result?.aiAnalysis) return;

    try {
      if (!synth) throw new Error('Speech synthesis not supported');
      synth.getVoices();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = result.aiAnalysis;
      let textToSpeak = tempDiv.textContent || tempDiv.innerText || '';
      textToSpeak = textToSpeak.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
      textToSpeak = textToSpeak.replace(/\s+/g, ' ').trim();
      if (!textToSpeak) return;

      const sentences = textToSpeak.match(/[^.!?]+[.!?]+/g) || [textToSpeak];
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      let currentIdx = 0;

      const speakNext = () => {
        if (currentIdx >= sentences.length || !isSpeakingRef.current) {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentences[currentIdx].trim());
        const langMap: Record<string, string> = {
          'en': 'en-US', 'ru': 'ru-RU', 'uk': 'uk-UA',
          'de': 'de-DE', 'fr': 'fr-FR', 'es': 'es-ES'
        };
        const targetLang = langMap[lang] || 'en-US';
        utterance.lang = targetLang;
        utterance.rate = 1.0;

        const voices = synth.getVoices();
        const voice = voices.find(v => v.lang === targetLang) || voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
          currentIdx++;
          if (isSpeakingRef.current) speakNext();
        };

        utterance.onerror = (e) => {
          if (e.error !== 'interrupted' && isSpeakingRef.current) {
            console.warn('Speech error:', e.error);
            setIsSpeaking(false);
            isSpeakingRef.current = false;
          }
        };

        synth.speak(utterance);
      };

      synth.cancel();
      setTimeout(() => {
        synth.resume();
        speakNext();
      }, 100);

    } catch (err: any) {
      console.error(err);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  };

  const handleDownloadPDF = async () => {
    if (!resultsRef.current) return;
    try {
      const canvas = await html2canvas(resultsRef.current, {
        scale: 2,
        backgroundColor: '#1e1b4b',
        logging: false,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const headerHeight = 35;
      pdf.setFillColor(30, 27, 75);
      pdf.rect(0, 0, pdfWidth, headerHeight, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      const genderLabel = formData.gender === 'male' ? t.male : t.female;
      const birthInfo = `${(t.dob as string).toUpperCase()}: ${formData.date} | ${(t.time as string).toUpperCase()}: ${formData.time || '--:--'} | ${(t.gender as string).toUpperCase()}: ${genderLabel}`;
      pdf.text(birthInfo, 15, 15);
      pdf.text(`${(t.place as string).toUpperCase()}: ${formData.place}`, 15, 25);

      const imgHeightMM = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeightMM;
      let position = headerHeight;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMM);
      heightLeft -= (pdfPageHeight - headerHeight);
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeightMM;
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMM);
        heightLeft -= pdfPageHeight;
      }
      pdf.save(`foreteller-${formData.date}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <Box sx={{ flex: 1, pb: 4, overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <ToggleButtonGroup value={lang} exclusive onChange={(_, newLang) => newLang && setLang(newLang)} size={isMobile ? 'small' : 'medium'}>
                {['en', 'de', 'fr', 'es', 'uk', 'ru'].map(l => (
                  <ToggleButton key={l} value={l}>{l.toUpperCase() === 'UK' ? 'UA' : l.toUpperCase()}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '3.5rem' }, background: 'linear-gradient(to right, #e2e8f0, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
                {t.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ letterSpacing: 1 }}>{t.subtitle}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, newMode) => {
                  if (newMode) {
                    setMode(newMode);
                    setError('');
                    setResult(null);
                    setCompResult(null);
                  }
                }}
              >
                <ToggleButton value="analysis">{t.analysisMode}</ToggleButton>
                <ToggleButton value="compatibility">{t.compatibilityMode}</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {mode === 'analysis' ? (
              <BirthForm
                formData={formData}
                translations={t as any}
                language={lang}
                loading={loading}
                highlightedField={highlightedField}
                apiMessage={apiMessage}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            ) : (
              <CompatibilityForm
                formData={compData}
                translations={t as any}
                language={lang}
                loading={loading}
                onPartnerChange={handleCompChange}
                onSubmit={handleCompatibilitySubmit}
              />
            )}

            {error && <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>{error}</Alert>}
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress size={60} /></Box>}

            {mode === 'analysis' && result && (
              <Box ref={resultsRef}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                  <Button variant="outlined" startIcon={isSpeaking ? <StopIcon /> : <PlayIcon />} onClick={handleListen} sx={{ borderRadius: 8, color: 'white' }}>
                    {isSpeaking ? t.stopAudio : t.listenAudio}
                  </Button>
                  <Button variant="contained" startIcon={<PdfIcon />} onClick={handleDownloadPDF} sx={{ borderRadius: 8 }}>{t.downloadPdf}</Button>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}><ResultCard title={t.zodiac} emoji={zodiacEmoji[result.zodiac] || '✨'} value={translateZodiac(result.zodiac, lang)} /></Grid>
                  <Grid item xs={12} sm={6} md={4}><ResultCard title={t.chinese} emoji={chineseZodiacEmoji[result.chineseZodiac] || '🐉'} value={translateChineseZodiac(result.chineseZodiac, lang)} /></Grid>
                  <Grid item xs={12} sm={6} md={4}><ResultCard title={t.moon} emoji={result.moon.emoji} value={result.moon.phase} /></Grid>
                  <Grid item xs={12}>
                    <Card><CardContent>
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <CalculateIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                        <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>{t.pythagoras}</Typography>
                      </Box>
                      <PythagorasGrid square={result.pythagoras.square} />
                    </CardContent></Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card sx={{ background: 'rgba(30, 27, 75, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, textAlign: 'center', textTransform: 'uppercase', color: 'primary.light' }}>{t.analysis}</Typography>
                        <Box dangerouslySetInnerHTML={{ __html: result.aiAnalysis || '' }} sx={{ '& h3': { color: 'secondary.main', mt: 3, mb: 2 }, '& p': { mb: 2, lineHeight: 1.8 } }} />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {mode === 'compatibility' && compResult && (
              <CompatibilityResultComponent
                p1={compResult.partner1}
                p2={compResult.partner2}
                aiCompatibility={compResult.aiCompatibility}
                lang={lang}
                translations={t}
              />
            )}
          </Container>
        </Box>
        <Box component="footer" sx={{ py: 1.5, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>© 2026 Viktor Ralchenko</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
