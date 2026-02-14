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
import { FormData, AnalysisResult, Language } from './types';
import { TRANSLATIONS, zodiacEmoji, chineseZodiacEmoji } from './constants/translations';
import { translateZodiac, translateChineseZodiac } from './utils/translations';
import { BirthForm } from './components/BirthForm';
import { ResultCard } from './components/ResultCard';
import { PythagorasGrid } from './components/PythagorasGrid';

function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = TRANSLATIONS[lang];
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('sm'));

  const [formData, setFormData] = useState<FormData>({
    date: '',
    time: '',
    place: '',
    gender: 'male',
  });
  const resultsRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Presentation API (Playwright-like control) ---
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // For security, you might want to check event.origin here
      const { type, action, payload } = event.data;

      if (type === 'PRESENTATION_COMMAND') {
        console.log('Foreteller received command:', action, payload);

        if (action === 'FILL_FIELD') {
          const { name, value } = payload;
          setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (action === 'SUBMIT') {
          // Trigger the submit logic
          // Since handleSubmit needs a form event, we can call the logic directly or dispatch a 'submit' event to the form
          const formElement = document.querySelector('form');
          if (formElement) {
            formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-translate analysis when language changes
  useEffect(() => {
    const translateAnalysis = async () => {
      // If we have an analysis and the UI language is different from the analysis language
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
      if (!synth) {
        throw new Error('Speech synthesis not supported in this browser');
      }

      // Important: some browsers need voices to be loaded
      synth.getVoices();

      // Prepare text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = result.aiAnalysis;
      let textToSpeak = tempDiv.textContent || tempDiv.innerText || '';

      // Clean text: remove emojis and normalize spaces
      textToSpeak = textToSpeak.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F910}-\u{1F96B}\u{1F980}-\u{1F9E0}]/gu, '');
      textToSpeak = textToSpeak.replace(/\s+/g, ' ').trim();

      if (!textToSpeak) return;

      // Mobile/Stability fix: split text into small chunks
      const sentences = textToSpeak.match(/[^.!?]+[.!?]+/g) || [textToSpeak];

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      utterancesRef.current = [];

      let currentIdx = 0;

      const speakNext = () => {
        if (currentIdx >= sentences.length || !isSpeakingRef.current) {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sentences[currentIdx].trim());
        utterancesRef.current.push(utterance);

        const langMap: Record<string, string> = {
          'en': 'en-US', 'ru': 'ru-RU', 'uk': 'uk-UA',
          'de': 'de-DE', 'fr': 'fr-FR', 'es': 'es-ES'
        };
        const targetLang = langMap[lang] || 'en-US';
        utterance.lang = targetLang;
        utterance.rate = 1.0;

        // Try to pick a specific voice for the language
        const voices = synth.getVoices();
        const voice = voices.find(v => v.lang === targetLang) ||
          voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        if (voice) {
          utterance.voice = voice;
        }

        utterance.onend = () => {
          currentIdx++;
          if (isSpeakingRef.current) {
            speakNext();
          }
        };

        utterance.onerror = (e) => {
          // 'interrupted' is normal when we stop manually
          if (e.error !== 'interrupted' && isSpeakingRef.current) {
            console.error('Speech error:', e);
            setError(`Audio Error: ${e.error}.`);
            setIsSpeaking(false);
            isSpeakingRef.current = false;
          }
        };

        synth.speak(utterance);
      };

      synth.cancel();
      // Increase timeout for desktop browsers to 100ms
      setTimeout(() => {
        synth.resume(); // Ensure not stuck in paused state
        speakNext();
      }, 100);

    } catch (err: any) {
      setError(`Audio Feature Error: ${err.message}`);
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
      const imgHeightMM = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeightMM;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMM);
      heightLeft -= pdfPageHeight;

      // Add subsequent pages if necessary
      while (heightLeft > 0) {
        position = heightLeft - imgHeightMM;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMM);
        heightLeft -= pdfPageHeight;
      }

      pdf.save(`foreteller-${formData.date}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        }}
      >
        <Box sx={{ flex: 1, pb: 4, overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            {/* Language Switcher */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <ToggleButtonGroup
                value={lang}
                exclusive
                onChange={(_, newLang) => {
                  if (newLang) {
                    setLang(newLang);
                    window.speechSynthesis.cancel();
                    setIsSpeaking(false);
                    isSpeakingRef.current = false;
                  }
                }}
                size={isMobile ? 'small' : 'medium'}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="de">DE</ToggleButton>
                <ToggleButton value="fr">FR</ToggleButton>
                <ToggleButton value="es">ES</ToggleButton>
                <ToggleButton value="uk">UA</ToggleButton>
                <ToggleButton value="ru">RU</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2rem', md: '3.5rem' },
                  background: 'linear-gradient(to right, #e2e8f0, #cbd5e1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                {t.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ letterSpacing: 1 }}>
                {t.subtitle}
              </Typography>
            </Box>

            {/* Form */}
            <BirthForm
              formData={formData}
              translations={t as any}
              language={lang}
              loading={loading}
              translating={isTranslating}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />

            {/* Error */}
            {error && (
              <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
                {error}
              </Alert>
            )}

            {/* Loading */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={60} />
              </Box>
            )}

            {/* Results */}
            {result && (
              <Box ref={resultsRef}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={isSpeaking ? <StopIcon /> : <PlayIcon />}
                    onClick={handleListen}
                    sx={{ borderRadius: 8, borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    {isSpeaking ? t.stopAudio : t.listenAudio}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PdfIcon />}
                    onClick={handleDownloadPDF}
                    sx={{ borderRadius: 8 }}
                  >
                    {t.downloadPdf}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  {/* Zodiac */}
                  <Grid item xs={12} sm={6} md={4}>
                    <ResultCard
                      title={t.zodiac}
                      emoji={zodiacEmoji[result.zodiac] || '✨'}
                      value={translateZodiac(result.zodiac, lang)}
                    />
                  </Grid>

                  {/* Chinese Zodiac */}
                  <Grid item xs={12} sm={6} md={4}>
                    <ResultCard
                      title={t.chinese}
                      emoji={chineseZodiacEmoji[result.chineseZodiac] || '🐉'}
                      value={translateChineseZodiac(result.chineseZodiac, lang)}
                    />
                  </Grid>

                  {/* Moon */}
                  <Grid item xs={12} sm={6} md={4}>
                    <ResultCard
                      title={t.moon}
                      emoji={result.moon.emoji}
                      value={result.moon.phase}
                    />
                  </Grid>

                  {/* Pythagoras Square */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <CalculateIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                          <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                            {t.pythagoras}
                          </Typography>
                        </Box>
                        <PythagorasGrid square={result.pythagoras.square} />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* AI Analysis */}
                  <Grid item xs={12}>
                    <Card sx={{
                      background: 'rgba(30, 27, 75, 0.4)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                    }}>
                      <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                        <Typography variant="h5" gutterBottom sx={{
                          fontWeight: 700,
                          mb: 4,
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          letterSpacing: 2,
                          color: 'primary.light'
                        }}>
                          {t.analysis}
                        </Typography>
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: result.aiAnalysis || '<p>AI Analysis unavailable</p>',
                          }}
                          sx={{
                            '& h3': {
                              color: 'secondary.main',
                              mt: 5,
                              mb: 2,
                              fontSize: '1.5rem',
                              borderBottom: '1px solid rgba(255,255,255,0.1)',
                              pb: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            },
                            '& p': {
                              mb: 3,
                              lineHeight: 1.8,
                              fontSize: '1.05rem',
                              color: 'rgba(255,255,255,0.9)',
                              textAlign: 'justify'
                            },
                            '& ul': {
                              mb: 4,
                              pl: 2,
                              listStyleType: '"✧ "',
                            },
                            '& li': {
                              mb: 1.5,
                              lineHeight: 1.6,
                              color: 'rgba(255,255,255,0.85)'
                            },
                            '& strong': {
                              color: 'primary.light',
                              fontWeight: 600
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 1.5,
            textAlign: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            bgcolor: 'transparent',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>
            © 2026 Viktor Ralchenko
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
