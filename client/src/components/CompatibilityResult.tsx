import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Divider
} from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { AnalysisResult, Language } from '../types';
import { ResultCard } from './ResultCard';
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
                    <Card sx={{ background: 'rgba(255,255,255,0.03)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary.light">
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
                    <Card sx={{ background: 'rgba(255,255,255,0.03)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="secondary.light">
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
                            '& li': { mb: 1, color: 'rgba(255,255,255,0.8)' }
                        }}
                    />
                </CardContent>
            </Card>
        </Box>
    );
};
