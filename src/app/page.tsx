'use client'
import { Box, Button, CircularProgress, Container, Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Paper } from '@mui/material';
import { green, blue } from '@mui/material/colors'; // Import colors
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for Accordion
import Sidebar from './components/sidebar';
import AppointmentCard from './components/appointmentCard';
import { useEffect, useState } from 'react';
import { AppointmentWithSchedule } from './lib/models'

export default function Home() {
  const initAppointments: AppointmentWithSchedule[] = [];
  const [appointments, setAppointments] = useState(initAppointments);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/appointments')
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data)
        setLoading(false)
      })
  }, [])

  // Filter appointments based on confirmation status
  const confirmedAppointments = appointments.filter(appointment => appointment.confirmed);
  const unconfirmedAppointments = appointments.filter(appointment => !appointment.confirmed);

  return (
    <Box>
      <Sidebar />
      <Grid container
        justifyContent="center"
        alignItems="center"
        rowSpacing={3}
        columnSpacing={2}>

        <Grid item xs={12}>
          {/* My Appointments Section */}
          <Box p={2} mb={2} textAlign="center">
            <Typography variant="h2">My Appointments</Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>

          {/* Loading Spinner */}
          {isLoading && <CircularProgress />}

          {/* No Appointments Message */}
          {!isLoading && appointments.length === 0 &&
            <Box textAlign="center">
              <Typography variant="body1">You have no appointments scheduled.</Typography>
            </Box>
            ||
            <Box textAlign="center" paddingBottom={3}>
              <Typography variant="body1">Look at your upcoming appointments or book a new one.</Typography>
            </Box>
          }

          {/* Button to Schedule New Appointments */}
          <Box textAlign="center" mt={2}>
            <Button variant="contained" color="primary" href="/book">
              Schedule New Appointment
            </Button>
          </Box>

        </Grid>

        <Grid item xs={8}>
          {/* Confirmed Appointments */}
          {!isLoading && confirmedAppointments.length > 0 && (
            <Paper elevation={2}>
              <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box p={2} mb={2} width="100%">
                    <Typography variant="h4">✅ Confirmed Appointments</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}
                    justifyContent="center"
                    alignItems="center"
                    rowSpacing={3}
                    columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                  >
                    {confirmedAppointments.map(appointment => (
                      <Grid item xs={5} key={appointment.id}>
                        <AppointmentCard appointment={appointment} />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Paper>
          )}

        </Grid>
        <Grid item xs={8}>

          {/* Unconfirmed Appointments */}
          {!isLoading && unconfirmedAppointments.length > 0 && (
            <Accordion elevation={2}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box p={2} mb={2} width="100%">
                  <Typography variant="h4">⌛ Pending Appointments ({unconfirmedAppointments.length})</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}
                  justifyContent="center"
                  alignItems="center"
                  rowSpacing={3}
                  columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                >
                  {unconfirmedAppointments.map(appointment => (
                    <Grid item xs={5} key={appointment.id}>
                      <AppointmentCard appointment={appointment} />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )}


        </Grid>
      </Grid>
    </Box>
  );
}
