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
    CircularProgress,
    Box
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import 'dayjs/locale/ru';
import 'dayjs/locale/uk';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import dayjs, { Dayjs } from 'dayjs';
import { Male as MaleIcon, Female as FemaleIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { FormData, Translations } from '../types';

interface BirthFormProps {
    formData: FormData;
    translations: Translations;
    language: string;
    loading: boolean;
    translating?: boolean;
    highlightedField?: string | null;
    onChange: (e: any) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const BirthForm: React.FC<BirthFormProps> = ({
    formData,
    translations,
    language,
    loading,
    translating,
    highlightedField,
    onChange,
    onSubmit,
}) => {
    const isHighlighted = (name: string) => highlightedField === name;
    const highlightStyles = {
        outline: '3px solid #fbbf24',
        outlineOffset: '2px',
        boxShadow: '0 0 40px rgba(251, 191, 36, 0.4)',
        borderRadius: '8px',
        transition: 'all 0.4s ease-in-out',
        zIndex: 50
    };

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
    }, [inputValue, language]);

    const handleGenderChange = (_: React.MouseEvent<HTMLElement>, newGender: 'male' | 'female') => {
        if (newGender !== null) {
            onChange({ target: { name: 'gender', value: newGender } });
        }
    };

    const handleDateChange = (date: Dayjs | null) => {
        if (date) {
            onChange({ target: { name: 'date', value: date.format('YYYY-MM-DD') } });
        }
    };

    const handleTimeChange = (time: Dayjs | null) => {
        if (time) {
            onChange({ target: { name: 'time', value: time.format('HH:mm') } });
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language === 'ua' ? 'uk' : language}>
            <Card sx={{
                maxWidth: 1000,
                mx: 'auto',
                mb: 4,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
                borderRadius: 4
            }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <form onSubmit={onSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3} sx={isHighlighted('date') ? highlightStyles : {}}>
                                <DatePicker
                                    label={translations.dob}
                                    value={formData.date ? dayjs(formData.date) : null}
                                    onChange={handleDateChange}
                                    maxDate={dayjs()}
                                    format="DD.MM.YYYY"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            name: 'date'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3} sx={isHighlighted('time') ? highlightStyles : {}}>
                                <TimePicker
                                    label={translations.time}
                                    value={formData.time ? dayjs(`2000-01-01T${formData.time}`) : null}
                                    onChange={handleTimeChange}
                                    ampm={false}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            name: 'time'
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3} sx={isHighlighted('place') ? highlightStyles : {}}>
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
                                                bgcolor: '#1e1b4b',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                                                mt: 1,
                                                borderRadius: 2
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
                                            name="place"
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
                            <Grid item xs={12} sm={6} md={3} sx={isHighlighted('gender') ? highlightStyles : {}}>
                                <ToggleButtonGroup
                                    value={formData.gender}
                                    exclusive
                                    onChange={handleGenderChange}
                                    fullWidth
                                    size="small"
                                    sx={{
                                        height: 56,
                                        bgcolor: 'rgba(255,255,255,0.03)',
                                        '& .MuiToggleButton-root': {
                                            color: 'rgba(255,255,255,0.6)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            transition: 'all 0.3s ease',
                                            '&.Mui-selected': {
                                                color: '#fff',
                                                bgcolor: 'rgba(168, 85, 247, 0.3)',
                                                borderColor: 'rgba(168, 85, 247, 0.6)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(168, 85, 247, 0.4)',
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <ToggleButton value="male" sx={{ flex: 1, gap: 1, textTransform: 'none' }}>
                                        <MaleIcon fontSize="small" />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{translations.male}</Typography>
                                    </ToggleButton>
                                    <ToggleButton value="female" sx={{ flex: 1, gap: 1, textTransform: 'none' }}>
                                        <FemaleIcon fontSize="small" />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{translations.female}</Typography>
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Grid>
                            <Grid item xs={12} sx={isHighlighted('submit') ? highlightStyles : {}}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    name="submit"
                                    disabled={loading}
                                    size="large"
                                    sx={{
                                        py: 2,
                                        borderRadius: 3,
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        letterSpacing: 1,
                                        background: 'linear-gradient(45deg, #a855f7 30%, #6366f1 90%)',
                                        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #9333ea 30%, #4f46e5 90%)',
                                            boxShadow: '0 6px 25px rgba(168, 85, 247, 0.4)',
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {(loading || translating) && <CircularProgress size={20} sx={{ color: 'white' }} />}
                                        {translating ? translations.translating : (loading ? translations.loading : translations.submit)}
                                    </Box>
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </LocalizationProvider>
    );
};
