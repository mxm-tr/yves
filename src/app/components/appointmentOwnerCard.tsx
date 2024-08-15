'use client'

import React, { useState } from 'react';
import { Button, Card, CardContent, Fade, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

import { AppointmentWithScheduleAndUser } from '../lib/models';

const AppointmentCardOwnerCard: React.FC<{ appointment: AppointmentWithScheduleAndUser, triggerReload: Function }> = ({ appointment, triggerReload }) => {

    const [confirmationConfirmationOpen, setConfirmConfirmationOpen] = useState(false);
    const [confirmationCancellationOpen, setConfirmCancellationOpen] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const handleParentReload = () => {
        // Invoke the callback to trigger the reload in the parent
        triggerReload();
    };

    // Locale for date and time format
    let defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    const handleConfirmAppointment = async () => {
        try {
            // Show loading state
            setIsLoading(true);

            // Close the delete confirmation modal
            setConfirmConfirmationOpen(false);

            // Send a confirmation request to the backend API
            const response = await fetch(`/api/v1/appointments/${appointment.id}/confirm`, { method: 'POST' });

            if (response.ok) {

                // If the response status is 200 OK, set isConfirmed to true to hide the card
                setIsConfirmed(true);

                // Show success alert
                setShowSuccessAlert(true);

                // Trigger the reload of the parent component
                handleParentReload()

            } else {
                // Handle non-successful response (e.g., display an error message)
                console.error('Error confirming appointment. Status:', response.status);
                setError('Error confirming appointment. Please try again later.');
            }
        } catch (error) {
            console.error('Error confirming appointment', error);
            setError('Error confirming appointment. Please try again later.');
        } finally {
            // Hide loading state
            setIsLoading(false);
        }
    };

    const handleCancelAppointment = async () => {
        try {
            // Show loading state
            setIsLoading(true);

            // Close the delete confirmation modal
            setConfirmCancellationOpen(false);

            // Send a confirmation request to the backend API
            const response = await fetch(`/api/v1/appointments/${appointment.id}/cancel`, { method: 'POST' });

            if (response.ok) {

                // If the response status is 200 OK, set isConfirmed to true to hide the card
                setIsConfirmed(true);

                // Show success alert
                setShowSuccessAlert(true);

                // Trigger the reload of the parent component
                handleParentReload()

            } else {
                // Handle non-successful response (e.g., display an error message)
                console.error('Error cancelling appointment. Status:', response.status);
                setError('Error cancelling appointment. Please try again later.');
            }
        } catch (error) {
            console.error('Error cancelling appointment', error);
            setError('Error cancelling appointment. Please try again later.');
        } finally {
            // Hide loading state
            setIsLoading(false);
        }
    };

    const handleOpenConfirmConfirmation = () => {
        // Open the delete confirmation modal
        setConfirmConfirmationOpen(true);
    };

    const handleCloseConfirmConfirmation = () => {
        // Close the delete confirmation modal
        setConfirmConfirmationOpen(false);
        // Clear any previous error
        setError('');
    };


    const handleOpenCancellationConfirmation = () => {
        // Open the delete confirmation modal
        setConfirmCancellationOpen(true);
    };

    const handleCloseCancellationConfirmation = () => {
        // Close the delete confirmation modal
        setConfirmCancellationOpen(false);
        // Clear any previous error
        setError('');
    };

    return (
        <>
            <Card key={appointment.id} style={{ marginBottom: 16 }}>
                <CardContent>
                    <Grid container direction="column" alignItems="center" spacing={2}>
                        <Grid item>
                            <Typography variant="h6">
                                {appointment.confirmed ? "✅ Confirmed" : "Pending confirmation ⌛"}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">
                                🐸 Booked by: {appointment.user.name}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">
                                📅 Date: {new Date(appointment.schedule.date).toLocaleDateString(defaultLocale)}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">
                                ⌚ Time: {new Date(appointment.schedule.date).toLocaleTimeString(defaultLocale, { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">
                                💰 Cost: {appointment.schedule.cost} 🪙
                            </Typography>
                        </Grid>
                        <Grid item>
                            {appointment.confirmed ?
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleOpenCancellationConfirmation}
                                >
                                    ❌ Cancel
                                </Button>
                                :
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleOpenConfirmConfirmation}
                                >
                                    ✅ Confirm
                                </Button>

                            }
                        </Grid>
                    </Grid>
                </CardContent>

                {/* Confirm Confirmation Modal */}
                <Dialog open={confirmationConfirmationOpen} onClose={handleCloseConfirmConfirmation}>
                    <DialogTitle>Confirm appointment</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to confirm this appointment?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmConfirmation} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmAppointment} color="primary" disabled={isLoading}>
                            Confirm appointment
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Confirm Cancellation Modal */}
                <Dialog open={confirmationCancellationOpen} onClose={handleCloseCancellationConfirmation}>
                    <DialogTitle>Confirm cancellation</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to cancel this appointment?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCancellationConfirmation} color="primary">
                            Go back
                        </Button>
                        <Button onClick={handleCancelAppointment} color="primary" disabled={isLoading}>
                            Cancel appointment
                        </Button>
                    </DialogActions>
                </Dialog>
            </Card>

            {/* Loading Spinner */}
            {isLoading && <CircularProgress />}

            {/* Cancellation or confirmation Alert */}
            <Fade
                in={showSuccessAlert} //Write the needed condition here to make it appear
                timeout={{ enter: 1000, exit: 1000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
                addEndListener={() => {
                    setTimeout(() => {
                        setShowSuccessAlert(false)
                    }, 2000);
                }}
            >
                <Alert
                    severity="success"
                    icon={<CheckIcon fontSize="inherit" />}
                    onClose={() => setShowSuccessAlert(false)}
                >
                    Done!
                </Alert>
            </Fade>


            {/* Error Modal */}
            {error && (
                <Dialog open={Boolean(error)} onClose={() => setError("")}>
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <Typography color="error">{error}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setError("")} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default AppointmentCardOwnerCard;
