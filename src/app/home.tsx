'use client'
import { Box, Button, CircularProgress, Container, Grid, Typography, Accordion, AccordionSummary, AccordionDetails, Paper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for Accordion
import MeetingConfirmationCard from './components/meetingConfirmationCard';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"

import Sidebar from './components/sidebar';
import SignIn from './components/signIn';

export default function Home() {

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {

  }, [])

  // Filter meetings based on confirmation status

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

        <WelcomePage />

      </Grid>
    </Box>
  );
}


export function WelcomePage() {

  const router = useRouter()
  const session = useSession();

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Grid container spacing={4} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, p: 2 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Welcome to Yves
            </Typography>
            <Typography variant="h6" component="p" gutterBottom>
              Manage your meetings with ease, stay on top of your schedule, and let Yves take care of the rest.
            </Typography>
            <Box sx={{ mt: 4 }}>
              {session.status === 'authenticated' ?
                <Box>
                  <Button variant="contained" color="primary" size="large" sx={{ mr: 2 }} onClick={() => router.push('/planning')}>
                    My meetings
                  </Button>
                  <Button variant="contained" color="secondary" size="large" sx={{ mr: 2 }} onClick={() => router.push('/book')}>
                    Book a meeting
                  </Button>
                </Box>
                :
                <SignIn />
              }
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Placeholder for an image or graphic */}
          <Box
            component="img"
            src="/logo.svg" // Replace with your image path
            alt="Yves Meeting Illustration"
            sx={{ width: '100%', maxWidth: '500px', mx: 'auto' }}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
