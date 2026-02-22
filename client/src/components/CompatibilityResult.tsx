import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Divider
} from '@mui/material';
import {
    Calculate as CalculateIcon,
    Favorite as FavoriteIcon
} from '@mui/icons-material';
import { AnalysisResult, Language } from '../types';
import { ResultCard } from './ResultCard';
import { PythagorasGrid } from './PythagorasGrid';
import { zodiacEmoji, chineseZodiacEmoji } from '../constants/translations';
import { translateZodiac, translateChineseZodiac } from '../utils/translations';

interface CompatibilityResultProps {
    p1: AnalysisResult;
    p2: AnalysisResult;
    aiCompatibility: string;
    lang: Language;
    translations: any;
}

export const CompatibilityResultComponent: React.FC<CompatibilityResultProps> = ({
    p1,
    p2,
    aiCompatibility,
    lang,
    translations
}) => {
    return (
        <Box>
            <Grid container spacing={4} sx={{ mb: 4 }}>
                {/* Partner 1 Summary */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary.light" sx={{ textAlign: 'center', mb: 2 }}>
                                {translations.partner1}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <ResultCard
                                        title={translations.zodiac}
                                        emoji={zodiacEmoji[p1.zodiac] || '✨'}
                                        value={translateZodiac(p1.zodiac, lang)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <ResultCard
                                        title={translations.chinese}
                                        emoji={chineseZodiacEmoji[p1.chineseZodiac] || '🐉'}
                                        value={translateChineseZodiac(p1.chineseZodiac, lang)}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Partner 2 Summary */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="secondary.light" sx={{ textAlign: 'center', mb: 2 }}>
                                {translations.partner2}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <ResultCard
                                        title={translations.zodiac}
                                        emoji={zodiacEmoji[p2.zodiac] || '✨'}
                                        value={translateZodiac(p2.zodiac, lang)}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <ResultCard
                                        title={translations.chinese}
                                        emoji={chineseZodiacEmoji[p2.chineseZodiac] || '🐉'}
                                        value={translateChineseZodiac(p2.chineseZodiac, lang)}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pythagoras Comparison */}
                <Grid item xs={12}>
                    <Card sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <CalculateIcon sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {translations.pythagoras} Comparison
                                </Typography>
                            </Box>
                            <Grid container spacing={4} justifyContent="center">
                                <Grid item xs={12} sm={6} md={5}>
                                    <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 1, color: 'primary.light', fontWeight: 600 }}>
                                        {translations.partner1}
                                    </Typography>
                                    <PythagorasGrid square={p1.pythagoras.square} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={5}>
                                    <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 1, color: 'secondary.light', fontWeight: 600 }}>
                                        {translations.partner2}
                                    </Typography>
                                    <PythagorasGrid square={p2.pythagoras.square} />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* AI Compatibility Analysis */}
            <Card sx={{
                background: 'rgba(30, 27, 75, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <FavoriteIcon sx={{ fontSize: 40, color: '#ec4899', mb: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                            {translations.compatibilityMode}
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Box
                        dangerouslySetInnerHTML={{ __html: aiCompatibility || '<p>Analysis unavailable</p>' }}
                        sx={{
                            '& h3': {
                                color: 'primary.light',
                                mt: 4,
                                mb: 2,
                                fontSize: '1.4rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            },
                            '& p': {
                                mb: 2,
                                lineHeight: 1.8,
                                color: 'rgba(255,255,255,0.9)',
                            },
                            '& ul': { mb: 3, pl: 2 },
                            '& li': { mb: 1, color: 'rgba(255,255,255,0.8)' },
                            '& table': {
                                width: '100%',
                                maxWidth: '320px',
                                margin: '24px auto',
                                borderCollapse: 'separate',
                                borderSpacing: '8px',
                                '& td': {
                                    background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    textAlign: 'center',
                                    width: '33.33%',
                                    aspectRatio: '1/1',
                                    color: '#e9d5ff',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        borderColor: 'rgba(168, 85, 247, 0.6)'
                                    }
                                },
                                // Target "empty" cells (often represented as '—' or '0')
                                '& td:contains("—"), & td:contains("0")': {
                                    background: 'transparent',
                                    borderColor: 'rgba(255,255,255,0.05)',
                                    color: 'rgba(255,255,255,0.15)',
                                    boxShadow: 'none'
                                }
                            }
                        }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};
