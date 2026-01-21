import {
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    Autocomplete,
    CircularProgress
} from '@mui/material';
import { Male as MaleIcon, Female as FemaleIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { FormData, Translations } from '../types';

interface BirthFormProps {
    formData: FormData;
    translations: Translations;
    language: string;
    loading: boolean;
    onChange: (e: any) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const BirthForm: React.FC<BirthFormProps> = ({
    formData,
    translations,
    language,
    loading,
    onChange,
    onSubmit,
}) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [fetchingCities, setFetchingCities] = useState(false);

    // Simple debounce for city fetching
    useEffect(() => {
        let active = true;

        if (inputValue === '' || inputValue.length < 2) {
            setOptions([]);
            return undefined;
        }

        const fetchCities = async () => {
            setFetchingCities(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&addressdetails=1&limit=5&featuretype=city,town,village&accept-language=${language}`
                );
                const data = await response.json();

                if (active) {
                    const cityNames = data.map((item: any) => {
                        const city = item.address.city || item.address.town || item.address.village || item.address.human_settlement || '';
                        const country = item.address.country || '';
                        return city && country ? `${city}, ${country}` : item.display_name.split(',').slice(0, 2).join(',');
                    });
                    // Filter out duplicates and empty strings
                    setOptions([...new Set(cityNames)].filter(Boolean) as string[]);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                if (active) setFetchingCities(false);
            }
        };

        const timer = setTimeout(fetchCities, 500);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [inputValue]);

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
                            <Autocomplete
                                freeSolo
                                open={open}
                                onOpen={() => setOpen(true)}
                                onClose={() => setOpen(false)}
                                options={options}
                                loading={fetchingCities}
                                value={formData.place}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            bgcolor: '#1e1b4b', // Solid dark background
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                                            mt: 1
                                        }
                                    }
                                }}
                                onChange={(_, newValue) => {
                                    onChange({ target: { name: 'place', value: newValue || '' } });
                                }}
                                onInputChange={(_, newInputValue) => {
                                    setInputValue(newInputValue);
                                    onChange({ target: { name: 'place', value: newInputValue } });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={translations.place}
                                        placeholder={translations.defaultPlace}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {fetchingCities ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
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
                                <ToggleButton value="male" sx={{ flex: 1, gap: 0.5, px: 1, textTransform: 'none' }}>
                                    <MaleIcon fontSize="small" />
                                    <Typography variant="body2">{translations.male.charAt(0).toUpperCase()}</Typography>
                                </ToggleButton>
                                <ToggleButton value="female" sx={{ flex: 1, gap: 0.5, px: 1, textTransform: 'none' }}>
                                    <FemaleIcon fontSize="small" />
                                    <Typography variant="body2">{translations.female.charAt(0).toUpperCase()}</Typography>
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
