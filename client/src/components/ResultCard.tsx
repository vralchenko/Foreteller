import { Card, CardContent, Box, Typography } from '@mui/material';

interface ResultCardProps {
    title: string;
    emoji: string;
    value: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, emoji, value }) => {
    return (
        <Card sx={{
            height: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                borderColor: 'rgba(168, 85, 247, 0.3)'
            }
        }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{
                    fontSize: '4.5rem',
                    lineHeight: 1,
                    mb: 2,
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.2))'
                }}>
                    {emoji}
                </Box>
                <Typography variant="overline" sx={{
                    fontSize: '0.8rem',
                    letterSpacing: 2,
                    color: 'primary.light',
                    fontWeight: 600
                }}>
                    {title}
                </Typography>
                <Typography variant="h5" sx={{
                    mt: 1,
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};
