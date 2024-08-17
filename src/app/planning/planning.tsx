'use client'
import { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    CircularProgress,
    Divider,
    Grid,
    List,
    ListItem,
    Paper,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSession } from "next-auth/react";
import SignIn from '../components/signIn';
import UserCard from '../components/userCard';
import AppointmentCard from '../components/appointmentCard';
import Sidebar from '../components/sidebar';
import Timeline from '../components/Timeline';
import { AppointmentWithScheduleAndUser } from '../lib/models';

// Helper function to format the date
function formatDate(date: Date, locale: string): string {
    const newDate = new Date(date);
    return newDate.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
};

interface GroupedAppointments {
    groups: Map<string, Array<AppointmentWithScheduleAndUser>>;
    dates: Array<string>;
}

// Helper function to group appointments by date and generate a list of all dates in range
function groupAppointmentsByDate(
    appointments: Array<AppointmentWithScheduleAndUser>, 
    locale: string
): GroupedAppointments {
    const groups: Map<string, Array<AppointmentWithScheduleAndUser>> = new Map();
    const dates = new Set<string>();

    appointments.forEach((appointment) => {
        const formattedDate = formatDate(appointment.schedule.date, locale);
        dates.add(formattedDate);

        if (groups.get(formattedDate)) {
            groups.get(formattedDate)?.push(appointment);
        }
        else {
            groups.set(formattedDate, []);
        }
    });

    console.log(appointments);
    console.log(groups);
    console.log(Array.from(dates));

    return { groups, dates: Array.from(dates) };
};

// Main component
export default function Planning() {
    const session = useSession();
    const [appointments, setAppointments] = useState<Array<AppointmentWithScheduleAndUser>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedDate, setExpandedDate] = useState<string | null>(null); // State to track expanded Accordion
    const defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/v1/appointments')
            .then((res) => res.json())
            .then((data) => {
                Array.isArray(data) ? setAppointments(data) : setAppointments([]);
                setIsLoading(false);
            })
            .catch(err => {
                setError('Failed to load appointments.');
                setIsLoading(false);
            });
    }, []);

    // Group and prepare dates
    const { groups: groupedAppointments, dates } = groupAppointmentsByDate(appointments, defaultLocale);

    // Create timeline events
    const timelineEvents = dates.map(date => ({
        date,
        content: groupedAppointments.get(date) && groupedAppointments.get(date)!.length > 0
            ? `${groupedAppointments.get(date)!.length} appointment(s)`
            : 'No appointments',
        onClick: () => setExpandedDate(date) // Set the expanded date on click
    }));

    const handleDelete = () => {
        // Trigger a reload by setting a dummy state
        setAppointments([...appointments]);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ flexGrow: 1 }}
            >
                <Grid item xs={2} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Sidebar />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Box p={2}>
                        {/* Appointments Section */}
                        <Box mb={2} textAlign="center">
                            <Typography variant="h2">Planning</Typography>
                        </Box>

                        {/* Loading Spinner */}
                        <Box textAlign="center">
                            {isLoading && <CircularProgress />}
                            {error && <Typography variant="h6" color="error">{error}</Typography>}
                        </Box>

                        {/* Display Appointments by Date */}
                        <Grid container spacing={2}>
                            {dates.map(date => (
                                <Grid item xs={12} key={date}>
                                    <Paper elevation={2} sx={{ mb: 2 }}>
                                        <Accordion
                                            expanded={expandedDate === date}
                                            onChange={() => setExpandedDate(expandedDate === date ? null : date)}
                                        >
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Box p={2} width="100%">
                                                    <Typography variant="h4">{date}</Typography>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                {groupedAppointments.get(date) && groupedAppointments.get(date)!.length > 0 ? (
                                                    <Grid container spacing={2}>
                                                        {groupedAppointments.get(date)?.map(appointment => (
                                                            <Grid item xs={12} sm={6} md={5} lg={4} key={appointment.id}>
                                                                <AppointmentCard
                                                                    appointment={appointment}
                                                                    onDelete={handleDelete} // Pass the handleDelete function
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                ) : (
                                                    <Typography variant="body1" color="textSecondary" textAlign="center">
                                                        No appointments scheduled for this day.
                                                    </Typography>
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Grid>

                <Grid item xs={2} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Timeline events={timelineEvents} onTimelineItemClick={(date) => setExpandedDate(date)} />
                </Grid>
            </Grid>
        </Box>
    );
}
