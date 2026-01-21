import {
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Box
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
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', ml: 1 }}>
                                    {translations.gender}
                                </Typography>
                                <ToggleButtonGroup
                                    value={formData.gender}
                                    exclusive
                                    onChange={handleGenderChange}
                                    fullWidth
                                    size="medium"
                                    sx={{ height: 56 }}
                                >
                                    <ToggleButton value="male" sx={{ gap: 1 }}>
                                        <MaleIcon />
                                        {translations.male}
                                    </ToggleButton>
                                    <ToggleButton value="female" sx={{ gap: 1 }}>
                                        <FemaleIcon />
                                        {translations.female}
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
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
