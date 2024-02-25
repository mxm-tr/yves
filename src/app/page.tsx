'use client'
import { Box, Button, CircularProgress, Container, Grid, Typography } from '@mui/material';

import Sidebar from './components/sidebar';
import AppointmentCard from './components/appointmentCard';

import { useEffect, useState } from 'react';

import { Appointment, Schedule } from '@prisma/client'

interface AppointmentWithSchedule extends Appointment{
  schedule: Schedule
}

export default function Home() {

  const initAppointments: AppointmentWithSchedule[] = [];
  const [appointments, setAppointments] = useState(initAppointments)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/appointments')
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data)
        setLoading(false)
      })
  }, [])

  return (
    <Box>
      <Sidebar />
      <Container maxWidth="sm">
        <Box>
          <Typography variant="h1">Hello</Typography>
        </Box>
        {/* My Appointments Section */}
        <Box>
          <Typography variant="h2">My Appointments</Typography>
        </Box>

        {/* Loading Spinner */}
        {isLoading && <CircularProgress />}

        {!isLoading && appointments.length === 0 ? (
          <Box>
            <Typography variant="body1">You have no appointments scheduled.</Typography>
          </Box>
        ) :
          (
            <Box>
              <Grid container spacing={2}>
                {appointments.map(appointment => (
                  <Grid item xs={5} key={appointment.id}>
                    <AppointmentCard appointment={appointment} data-superjson/>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
        }


        {/* Button to Schedule New Appointments */}
        <Button variant="contained" color="primary" href="/schedule">
          Schedule New Appointment
        </Button>
      </Container>
    </Box>
  );
}
