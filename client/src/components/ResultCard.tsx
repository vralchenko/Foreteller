import { Card, CardContent, Box, Typography } from '@mui/material';

interface ResultCardProps {
    title: string;
    emoji: string;
    value: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, emoji, value }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ fontSize: '5rem', lineHeight: 1, mb: 2 }}>
                    {emoji}
                </Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    {title}
                </Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};
