'use client'
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import AppointmentCardOwnerCard from '../components/appointmentOwnerCard';
import Sidebar from '../components/sidebar';

import { AppointmentWithScheduleAndUser } from '../lib/models';

import {
    Box, CircularProgress, Container,
    Divider,
    Grid,
    List, ListItem,
    Typography
} from '@mui/material';


export default function AppointmentsForm() {
    const router = useRouter();

    const emptyAppointments: Array<AppointmentWithScheduleAndUser> = new Array();
    const [appointmentsConfirmed, setAppointmentsConfirmed] = useState(emptyAppointments)
    const [appointmentsUnconfirmed, setAppointmentsUnconfirmed] = useState(emptyAppointments)

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
                setAppointmentsConfirmed(data.filter(a => a.confirmed));
                setAppointmentsUnconfirmed(data.filter(a => !a.confirmed));
            })
        setIsLoading(false);
    }, [reload])

    return (
        <Box>
            <Sidebar />
            <Container maxWidth="sm">
                <Typography variant="h1">Appointment with you</Typography>

                {/* Loading Spinner */}
                {isLoading && <CircularProgress />}

                {/* Available Appointments */}
                <section>
                    {!isLoading && Array.from(appointmentsUnconfirmed).length > 0 ?
                        <Box>
                            <Typography variant="h2">Pending confirmation</Typography>
                            <List>
                                {appointmentsUnconfirmed.map((appointment) => (
                                    <ListItem key={appointment.id}>
                                        <Grid item xs={5} key={appointment.id}>
                                            <AppointmentCardOwnerCard appointment={appointment} triggerReload={triggerReload} />
                                        </Grid>
                                        <Divider />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                        : <Typography variant="h6">No appointments pending confirmation.</Typography>
                    }
                </section>
                <section>
                    <Typography variant="h2">Confirmed appointments</Typography>
                    {!isLoading && Array.from(appointmentsConfirmed).length > 0 ?
                        <List>
                            {appointmentsConfirmed.map((appointment) => (
                                <ListItem key={appointment.id}>
                                    <Grid item xs={5} key={appointment.id}>
                                        <AppointmentCardOwnerCard appointment={appointment} triggerReload={triggerReload}/>
                                    </Grid>
                                    <Divider />
                                </ListItem>
                            ))}
                        </List>
                        : <Typography variant="h6">No appointments confirmed with you.</Typography>}
                </section>

            </Container>
        </Box>
    );
}
