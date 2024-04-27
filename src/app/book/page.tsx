'use client'
import { useState, useEffect, use } from 'react';
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation';

import Sidebar from '../components/sidebar';

import {
  Box, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContentText, DialogContent,
  DialogTitle, Typography, List, ListItem, ListItemText, Divider
} from '@mui/material';

import { Schedule, User } from 'prisma/prisma-client'

export default function ScheduleForm() {
  const router = useRouter();

  const emptySchedules: Map<String, Schedule[]> = new Map();
  const [availableSchedules, setAvailableSchedules] = useState(emptySchedules)

  const emptyUsers: User[] = new Array();
  const [relatedUsers, setRelatedUsers] = useState(emptyUsers)
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
        console.error('Error deleting appointment. Status:', response.status);
        setError('Error deleting appointment. Please try again later.');
      }
    } catch (error) {
      console.error('Error deleting appointment', error);
      setError('Error deleting appointment. Please try again later.');
    } finally {
      // Hide loading state
      setIsLoading(false);
    }
  }

  return (
    <Box>
      <Sidebar />
      <Container maxWidth="sm">
        <Typography variant="h1">Schedule New Appointment</Typography>

        {/* Loading Spinner */}
        {isLoading && <CircularProgress />}

        {/* List of acquaintances */}
        {scheduleOwner ?
          <Chip label={scheduleOwner.pseudo} onDelete={() => setScheduleOwner(undefined)} />
          :
          <Box>
            {!isLoading && relatedUsers.length > 0 ?
              <Box>
                <Typography variant="h2">People you know</Typography>
                <List>
                  {relatedUsers.map((relatedUser) => (
                    <ListItem key={relatedUser.id}>
                      <Button
                        onClick={() => handleSelectUser(relatedUser)}
                      >
                        {relatedUser.pseudo}
                      </Button>
                      <Divider />
                    </ListItem>
                  ))}
                </List>
              </Box>
              : <Typography variant="h6">Oh no you don&apos;t know anyone yet!</Typography>}
          </Box>
        }

        {/* Available Schedules */}
        {scheduleOwner ?
          <section>
            <Typography variant="h2">Available Schedules</Typography>
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
      </Container>
    </Box>
  );
}
