import {
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import { Male as MaleIcon, Female as FemaleIcon } from '@mui/icons-material';
import { FormData, Translations } from '../types';

interface BirthFormProps {
    formData: FormData;
    translations: Translations;
    loading: boolean;
    onChange: (e: any) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const BirthForm: React.FC<BirthFormProps> = ({
    formData,
    translations,
    loading,
    onChange,
    onSubmit,
}) => {
    const handleGenderChange = (_: React.MouseEvent<HTMLElement>, newGender: 'male' | 'female') => {
        if (newGender !== null) {
            onChange({ target: { name: 'gender', value: newGender } });
        }
    };

    return (
        <Card sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label={translations.dob}
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={onChange}
                                required
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    max: new Date().toISOString().split('T')[0]
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label={translations.time}
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label={translations.place}
                                placeholder={translations.defaultPlace}
                                name="place"
                                value={formData.place}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <ToggleButtonGroup
                                value={formData.gender}
                                exclusive
                                onChange={handleGenderChange}
                                fullWidth
                                size="small"
                                sx={{
                                    height: 56,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    '& .MuiToggleButton-root': {
                                        color: 'rgba(255,255,255,0.5)',
                                        border: '1px solid rgba(255,255,255,0.23)',
                                        '&.Mui-selected': {
                                            color: '#fff',
                                            bgcolor: 'rgba(168, 85, 247, 0.2)',
                                            borderColor: '#a855f7',
                                            '&:hover': {
                                                bgcolor: 'rgba(168, 85, 247, 0.3)',
                                            }
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="male" sx={{ flex: 1, gap: 1, textTransform: 'none' }}>
                                    <MaleIcon fontSize="small" />
                                    <Typography variant="body2">{translations.male}</Typography>
                                </ToggleButton>
                                <ToggleButton value="female" sx={{ flex: 1, gap: 1, textTransform: 'none' }}>
                                    <FemaleIcon fontSize="small" />
                                    <Typography variant="body2">{translations.female}</Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                disabled={loading}
                                size="large"
                                sx={{ py: 1.5 }}
                            >
                                {loading ? translations.loading : translations.submit}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
};
