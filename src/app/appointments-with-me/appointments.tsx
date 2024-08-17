'use client'
import { useEffect, useState } from 'react';

import AppointmentCardOwnerCard from '../components/appointmentOwnerCard';
import Sidebar from '../components/sidebar';

import { AppointmentWithScheduleAndUser } from '../lib/models';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box, CircularProgress,
    Divider,
    Grid,
    List, ListItem,
    Paper,
    Typography
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for Accordion

import { useSession } from "next-auth/react"
import SignIn from '../components/signIn';
import UserCard from '../components/userCard';

export default function AppointmentsForm() {
    const session = useSession()

    const [appointmentsWithMe, setAppointmentsWithMe] = useState<Array<AppointmentWithScheduleAndUser>>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [reload, setReload] = useState(false);

    const triggerReload = () => {
        setReload(!reload);
    };

    const [error, setError] = useState('');

    // Locale for date and time format
    let defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/v1/appointments/with-me')
            .then((res) => res.json())
            .then((data: AppointmentWithScheduleAndUser[]) => {
                setAppointmentsWithMe(data);
                setIsLoading(false);
            })
    }, [reload])

    const appointmentsWithMeConfirmed = () => Array.isArray(appointmentsWithMe) ? appointmentsWithMe.filter(a => a.confirmed) : [];
    const appointmentsUnconfirmedWithMe = () => Array.isArray(appointmentsWithMe) ? appointmentsWithMe.filter(a => !a.confirmed) : [];

    return (
        <Box>
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
            >
                <Grid item xs>
                    <Sidebar />
                </Grid>

            </Grid>

            <Grid container
                justifyContent="center"
                alignItems="center"
                rowSpacing={3}
                columnSpacing={2}>

                <Grid item xs={12}>
                    {/* Appointments Section */}
                    <Box p={2} mb={2} textAlign="center">
                        <Typography variant="h2">Appointments taken with you</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>

                    {/* Loading Spinner */}
                    {isLoading && <CircularProgress />}

                    {/* No Appointments Message */}
                    <Box textAlign="center">
                        <Typography variant="body1">Manage the appointments taken with you.</Typography>
                    </Box>
                </Grid>
                {/* Available Appointments */}
                <Grid item xs={8}>
                    <Paper elevation={2}>
                        <Accordion elevation={2} defaultExpanded={true}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box p={2} mb={2} width="100%">
                                    <Typography variant="h4">⌛ Appointments to confirm ({appointmentsUnconfirmedWithMe().length})</Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                {!isLoading && Array.from(appointmentsUnconfirmedWithMe()).length > 0 ? (
                                    <List>
                                        {appointmentsUnconfirmedWithMe().map((appointment) => (
                                            <ListItem key={appointment.id}>
                                                <Grid item xs={5} key={appointment.id}>
                                                    <AppointmentCardOwnerCard appointment={appointment} triggerReload={triggerReload} />
                                                </Grid>
                                                <Divider />
                                            </ListItem>
                                        ))}
                                    </List>
                                )
                                    : <Typography variant="h6">No appointments pending confirmation.</Typography>
                                }
                            </AccordionDetails>
                        </Accordion>
                    </Paper>
                </Grid>
                <Grid item xs={8}>
                    <Paper elevation={2}>
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box p={2} mb={2} width="100%">
                                    <Typography variant="h4">✅ Confirmed Appointments ({appointmentsWithMeConfirmed().length})</Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>

                                {!isLoading && Array.from(appointmentsWithMeConfirmed()).length > 0 ?
                                    <List>
                                        {appointmentsWithMeConfirmed().map((appointment) => (
                                            <ListItem key={appointment.id}>
                                                <Grid item xs={5} key={appointment.id}>
                                                    <AppointmentCardOwnerCard appointment={appointment} triggerReload={triggerReload} />
                                                </Grid>
                                                <Divider />
                                            </ListItem>
                                        ))}
                                    </List>
                                    : <Typography variant="h6">No appointments confirmed with you.</Typography>}
                            </AccordionDetails>
                        </Accordion>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
