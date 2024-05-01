'use client'
import { useState, useEffect, use } from 'react';
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation';

import Sidebar from '../components/sidebar';

import {
  Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContentText, DialogContent,
  DialogTitle, Typography, List, ListItem, ListItemText, Divider,
  TextField,
  Grid
} from '@mui/material';

import { Schedule, User } from 'prisma/prisma-client'
import { Event } from 'react-big-calendar';

export default function ScheduleForm() {
  const router = useRouter();

  const emptySchedules: Map<string, Schedule[]> = new Map();
  const [availableSchedules, setAvailableSchedules] = useState(emptySchedules)

  const [relatedUsers, setRelatedUsers] = useState<User[]>()
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [scheduleOwner, setScheduleOwner] = useState<User>();

  // Locale for date and time format
  let defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

  useEffect(() => {
    setIsLoading(true);
    if (!scheduleOwner) {
      fetch('/api/v1/users')
        .then((res) => res.json())
        .then((data) => {
          setRelatedUsers(data);
        })
    } else {
      fetch(`/api/v1/schedules/${scheduleOwner.id}`)
        .then((res) => res.json())
        .then((data) => {
          setAvailableSchedules(new Map(Object.entries(data)));
        })
    }
    setIsLoading(false);

  }, [scheduleOwner])

  // State to track selected day and time
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState(""); // State to store the selected scheduleId

  const handleSelectUser = (user: User) => {
    setScheduleOwner(user);
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setSelectedTime(""); // Reset selected time when a new day is selected
  };

  const handleTimeSelect = (time: string, scheduleId: string) => {
    setSelectedTime(time);
    setSelectedScheduleId(scheduleId);
  };

  // State for the success modal
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const handleSuccessModalClose = () => {
    // Close the success modal
    setSuccessModalOpen(false);
    // Redirect to the home page
    router.push('/');
  };


  const handleScheduleAppointment = async () => {
    try {
      // Show loading state
      setIsLoading(true);

      // Send a POST request to the backend API
      const response = await fetch(`/api/v1/appointments/schedule/${selectedScheduleId}`, { method: 'POST' });

      if (response.ok) {

        // If the response status is 200 OK, set isDeleted to true to hide the card
        setIsLoading(true);

        // Show success alert
        setSuccessModalOpen(true);

      } else {
        // Handle non-successful response (e.g., display an error message)
        console.error('Error scheduling appointment. Status:', response.status);
        setError('Error scheduling appointment: ' + await response.text());
      }
    } catch (error) {
      console.error('Error scheduling appointment', error);
      setError('Error scheduling appointment. Please try again later.');
    } finally {
      // Hide loading state
      setIsLoading(false);
    }
  }

  // State to hold the search query
  const [searchQuery, setSearchQuery] = useState("");

  // Function to filter users based on search query
  const filteredUsers = () => {
    return relatedUsers && relatedUsers.filter(user =>
      user.pseudo.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  }

  // Function to handle search query change
  const handleSearchChange = (event) => {
    console.log(event.target.value);
    setSearchQuery(event.target.value);
  };

  return (
    <Box>
      <Sidebar />
      <Grid container
        justifyContent="center"
        alignItems="center"
        rowSpacing={3}
        columnSpacing={2}>

        <Grid item xs={12} textAlign="center">
          <Typography variant="h2">Book an appointment</Typography>

          {/* Loading Spinner */}
          {isLoading && <CircularProgress />}
        </Grid>

        {/* List of acquaintances */}
        <Grid item xs={4} textAlign="center">
          {!scheduleOwner &&
            <Box>
              {!isLoading && relatedUsers && relatedUsers.length > 0 ?
                <Box>
                  <Typography variant="h2">Who with?</Typography>
                  <Box>
                    <Box marginBottom={2}>
                      <TextField
                        label="Search for people"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </Box>
                  </Box>
                  {filteredUsers() && filteredUsers().length > 0 ? (
                    <List>
                      {filteredUsers().map((relatedUser) => (
                        <ListItem key={relatedUser.id}>
                          <Button onClick={() => handleSelectUser(relatedUser)}>
                            {relatedUser.pseudo}
                          </Button>
                          <Divider />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="h6">No user found, fix your search filter!</Typography>
                  )}
                </Box>
                : <Typography variant="h6">Oh no you don&apos;t know anyone yet!</Typography>}
            </Box>
          }


          {/* Available Schedules */}
          {scheduleOwner ?
            <section>
              <Typography variant="h2">When do you want to meet&nbsp;&nbsp;
                <b><Chip label={scheduleOwner.pseudo} onDelete={() => setScheduleOwner(undefined)} /></b>
                &nbsp;&nbsp;?
              </Typography>
              {!isLoading && Array.from(availableSchedules).length > 0 ?
                <List>
                  {Array.from(availableSchedules).map(([day, dates]) => (
                    <ListItem key={day}>
                      <Button
                        onClick={() => handleDaySelect(day)}
                        variant={selectedDay === day ? "contained" : "outlined"}
                      >
                        {new Date(day).toLocaleDateString(defaultLocale)}
                      </Button>
                      <List>
                        {dates.map(date => (
                          <ListItem key={date.id}>
                            <Button
                              onClick={() => handleTimeSelect(date, date.id)}
                              disabled={selectedDay !== day} // Disable times for other days
                              variant={selectedTime === date ? "contained" : "outlined"}
                            >
                              {new Date(date.date).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                            </Button>
                            <Chip
                              label={`Cost: ${date.cost}`}
                              color="primary"
                              size="small"
                              style={{ marginLeft: '0.5rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Divider />
                    </ListItem>
                  ))}
                </List>
                : <Typography variant="h6">No more schedule available for {scheduleOwner.pseudo}</Typography>}
            </section>
            : ""}

          {/* Button to Schedule Appointment */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleScheduleAppointment}
            disabled={!selectedDay || !selectedTime}
            aria-disabled={isLoading}
          >
            Schedule Appointment
          </Button>
        </Grid>

        <Dialog open={successModalOpen} onClose={handleSuccessModalClose}>
          <DialogTitle>Appointment Scheduled Successfully</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Your appointment with {scheduleOwner?.pseudo} has been scheduled successfully.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSuccessModalClose} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
        {/* Error Modal */}
        <Dialog open={error.length > 0} onClose={() => setError("")}>
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {error}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setError("")} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
}
