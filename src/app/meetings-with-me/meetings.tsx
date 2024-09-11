"use client"
import { useEffect, useState } from 'react';

import MeetingCardOwnerCard from '../components/meetingOwnerCard';
import Sidebar from '../components/sidebar';
import NewMeetingForm from './NewMeetingForm';

import { MeetingsWithMeetingConfirmationsAndGuests } from '../lib/models';

import {
    Box, CircularProgress,
    Grid,
    Typography,
    Button,
    Modal
} from '@mui/material';

import { useSession } from "next-auth/react"

export default function MeetingsForm() {
    const session = useSession();

    const [meetingsWithMe, setMeetingsWithMe] = useState<Array<MeetingsWithMeetingConfirmationsAndGuests>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false); // State to manage form visibility

    const triggerReload = () => {
        setReload(!reload);
    };

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };

    const modalStyle = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
    };

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/v1/meetings/with-me')
            .then((res) => res.json())
            .then((data: MeetingsWithMeetingConfirmationsAndGuests[]) => {
                setMeetingsWithMe(data);
                setIsLoading(false);
            });
    }, [reload]);

    return (
        <Box>
            {/* New Meeting Form Modal */}
            <Modal
                open={isFormOpen}
                onClose={handleCloseForm}
                aria-labelledby="new-meeting-form"
                aria-describedby="form-to-create-a-new-meeting"
            >
                <Grid sx={modalStyle} xs={12}>
                    <NewMeetingForm onCreateMeeting={() => { handleCloseForm(); triggerReload(); }} />
                </Grid>
            </Modal>
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
                rowSpacing={1}
                columnSpacing={1}>

                <Grid item xs={12}>
                    {/* Meetings Section */}
                    <Box p={2} mb={2} textAlign="center">
                        <Typography variant="h2">Meetings taken with you</Typography>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    {/* Button to Open Form */}
                    <Box textAlign="center" mb={2}>
                        <Button variant="contained" color="primary" onClick={handleOpenForm}>
                            Create a new slot
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={12}>

                    {/* Loading Spinner */}
                    {isLoading && <CircularProgress />}

                </Grid>
                <Grid item xs={8}>
                    {!isLoading && Array.from(meetingsWithMe).length > 0 ?
                        <Grid container spacing={2}>
                            {meetingsWithMe.map((meeting) => (
                                <Grid item xs={12} sm={6} md={4} key={meeting.id}>
                                    <MeetingCardOwnerCard meeting={meeting} triggerReload={triggerReload} />
                                </Grid>
                            ))}
                        </Grid>
                        : <Typography variant="h6">No meetings confirmed with you.</Typography>}
                </Grid>
            </Grid>
        </Box>
    );
}
