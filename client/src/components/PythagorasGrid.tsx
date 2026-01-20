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
        <Box sx={{ mt: 2, maxWidth: 280, mx: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {matrix.flat().map((num) => {
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
                                bgcolor: count > 0 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                borderRadius: 2,
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: count > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
                            }}
                        >
                            {content}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};
