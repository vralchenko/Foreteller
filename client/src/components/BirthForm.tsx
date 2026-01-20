import { Card, CardContent, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FormData, Translations } from '../types';

interface BirthFormProps {
    formData: FormData;
    translations: Translations;
    loading: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const BirthForm: React.FC<BirthFormProps> = ({
    formData,
    translations,
    loading,
    onChange,
    onSubmit,
}) => {
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
                            <FormControl fullWidth>
                                <InputLabel>{translations.gender}</InputLabel>
                                <Select
                                    name="gender"
                                    value={formData.gender}
                                    label={translations.gender}
                                    onChange={(e: any) => onChange(e)}
                                    required
                                >
                                    <MenuItem value="male">{translations.male}</MenuItem>
                                    <MenuItem value="female">{translations.female}</MenuItem>
                                </Select>
                            </FormControl>
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
