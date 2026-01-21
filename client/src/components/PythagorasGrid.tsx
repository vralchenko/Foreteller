import { Box } from '@mui/material';
import { PythagorasSquare } from '../types';

interface PythagorasGridProps {
    square: PythagorasSquare;
}

export const PythagorasGrid: React.FC<PythagorasGridProps> = ({ square }) => {
    const matrix = [
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
    ];

    return (
        <Box sx={{ mt: 2, maxWidth: 300, mx: 'auto', p: 1 }}>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1.5,
                p: 1.5,
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 4,
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                {matrix.map((row) => row.map((num) => {
                    const count = square[num];
                    const content = count > 0 ? String(num).repeat(count) : '—';
                    return (
                        <Box
                            key={num}
                            sx={{
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: count > 0
                                    ? 'radial-gradient(circle at center, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.1) 100%)'
                                    : 'transparent',
                                border: count > 0
                                    ? '1px solid rgba(168, 85, 247, 0.4)'
                                    : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                fontSize: count > 3 ? '0.9rem' : '1.1rem',
                                fontWeight: 700,
                                color: count > 0 ? '#e9d5ff' : 'rgba(255,255,255,0.15)',
                                boxShadow: count > 0 ? '0 0 15px rgba(168, 85, 247, 0.15)' : 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: count > 0 ? 'scale(1.05)' : 'none',
                                    borderColor: count > 0 ? 'rgba(168, 85, 247, 0.8)' : 'rgba(255,255,255,0.1)',
                                },
                                wordBreak: 'break-all',
                                textAlign: 'center',
                                p: 0.5
                            }}
                        >
                            {content}
                        </Box>
                    );
                }))}
            </Box>
        </Box>
    );
};
