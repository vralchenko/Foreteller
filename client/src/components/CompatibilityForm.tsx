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
    Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import 'dayjs/locale/uk';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';
import { Male as MaleIcon, Female as FemaleIcon, Favorite as FavoriteIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { FormData, Translations, CompatibilityFormData } from '../types';

interface CompatibilityFormProps {
    formData: CompatibilityFormData;
    translations: Translations;
    language: string;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onPartnerChange: (partner: 'partner1' | 'partner2', field: string, value: any) => void;
}

const PartnerFields: React.FC<{
    title: string;
    data: FormData;
    translations: Translations;
    language: string;
    onChange: (field: string, value: any) => void;
}> = ({ title, data, translations, language, onChange }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [fetchingCities, setFetchingCities] = useState(false);

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

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6" color="primary.light" sx={{ mb: 1, fontWeight: 600 }}>
                    {title}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <DatePicker
                    label={translations.dob}
                    value={data.date ? dayjs(data.date) : null}
                    onChange={(date) => onChange('date', date?.format('YYYY-MM-DD'))}
                    maxDate={dayjs()}
                    format="DD.MM.YYYY"
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TimePicker
                    label={translations.time}
                    value={data.time ? dayjs(`2000-01-01T${data.time}`) : null}
                    onChange={(time) => onChange('time', time?.format('HH:mm'))}
                    ampm={false}
                    slotProps={{ textField: { fullWidth: true } }}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Autocomplete
                    freeSolo
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    options={options}
                    loading={fetchingCities}
                    value={data.place}
                    onChange={(_, newValue) => onChange('place', newValue || '')}
                    onInputChange={(_, newInputValue) => {
                        setInputValue(newInputValue);
                        onChange('place', newInputValue);
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
            <Grid item xs={12} sm={6}>
                <ToggleButtonGroup
                    value={data.gender}
                    exclusive
                    onChange={(_, gender) => gender && onChange('gender', gender)}
                    fullWidth
                    size="small"
                    sx={{ height: 56 }}
                >
                    <ToggleButton value="male" sx={{ gap: 1 }}>
                        <MaleIcon fontSize="small" />
                        {translations.male}
                    </ToggleButton>
                    <ToggleButton value="female" sx={{ gap: 1 }}>
                        <FemaleIcon fontSize="small" />
                        {translations.female}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Grid>
        </Grid>
    );
};

export const CompatibilityForm: React.FC<CompatibilityFormProps> = ({
    formData,
    translations,
    language,
    loading,
    onSubmit,
    onPartnerChange
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language === 'ru' ? 'ru' : (language === 'uk' ? 'uk' : language)}>
            <Card sx={{
                maxWidth: 1000,
                mx: 'auto',
                mb: 4,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 4
            }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                    <form onSubmit={onSubmit}>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <PartnerFields
                                    title={translations.partner1}
                                    data={formData.partner1}
                                    translations={translations}
                                    language={language}
                                    onChange={(field, val) => onPartnerChange('partner1', field, val)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <PartnerFields
                                    title={translations.partner2}
                                    data={formData.partner2}
                                    translations={translations}
                                    language={language}
                                    onChange={(field, val) => onPartnerChange('partner2', field, val)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                                <Button
                                    fullWidth
                                    variant="contained"
                                    type="submit"
                                    disabled={loading}
                                    size="large"
                                    startIcon={loading ? <CircularProgress size={20} /> : <FavoriteIcon />}
                                    sx={{
                                        py: 2,
                                        borderRadius: 3,
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        background: 'linear-gradient(45deg, #ec4899 30%, #a855f7 90%)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #db2777 30%, #9333ea 90%)',
                                        }
                                    }}
                                >
                                    {loading ? translations.loading : translations.checkCompatibility}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </LocalizationProvider>
    );
};
