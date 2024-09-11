'use client';
import { useState } from 'react';
import { Box, Button, Divider, Grid, Typography, TextField } from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

export default function EditMeetingForm({ meetingId, oldDateAndTimeIso, oldCost, oldDuration, oldNumberOfGuests, onEditMeeting }: {
    meetingId: string,
    oldDateAndTimeIso: Date,
    oldCost: number,
    oldDuration: number,
    oldNumberOfGuests: number,
    onEditMeeting: () => void
}) {
    const [date, setDate] = useState<Dayjs | null>(dayjs(oldDateAndTimeIso));
    const [time, setTime] = useState<Dayjs | null>(dayjs(oldDateAndTimeIso));
    const [cost, setCost] = useState(oldCost);
    const [duration, setDuration] = useState(oldDuration);
    const [numberOfGuests, setNumberOfGuests] = useState(oldNumberOfGuests);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!date || !time) {
            setError('Please select a valid date and time.');
            return;
        }

        const meetingDate = date.set('hour', time.hour()).set('minute', time.minute());

        try {
            const res = await fetch('/api/v1/meetings/' + meetingId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: meetingDate.toISOString(),
                    cost,
                    duration,
                    numberOfGuests,
                }),
            });

            if (res.ok) {
                onEditMeeting();
            } else {
                setError('Failed to edit meeting');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <Grid container spacing={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} >
                                <Typography>
                                    Are you sure you want to edit this meeting? All confirmed guests will have to reconfirm!
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date"
                                    value={date}
                                    onChange={(newDate) => setDate(newDate)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TimePicker
                                    label="Time"
                                    value={time}
                                    onChange={(newTime) => setTime(newTime)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Minutes"
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Cost"
                                    type="number"
                                    value={cost}
                                    onChange={(e) => setCost(parseInt(e.target.value))}
                                    required
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Guests"
                                    type="number"
                                    value={numberOfGuests}
                                    onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
                                    required
                                />
                            </Grid>
                            {error && (
                                <Grid item xs={12}>
                                    <Typography color="error">{error}</Typography>
                                </Grid>
                            )}
                            <Grid item xs={12} alignItems='center'>
                                <Button variant="contained" color="primary" type="submit" fullWidth>
                                    Confirm
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </LocalizationProvider>
        </Grid>
    );
}
