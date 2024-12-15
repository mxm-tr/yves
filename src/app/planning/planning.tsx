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
import MeetingConfirmationCard from '../components/meetingConfirmationCard';
import Sidebar from '../components/sidebar';
import Timeline from '../components/Timeline';
import { MeetingConfirmationsWithMeetingAndOwnerAndGuests } from '../lib/models';

// Helper function to format the date
function formatDate(date: Date, locale: string): string {
    const newDate = new Date(date);
    return newDate.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' });
};

interface GroupedMeetingConfirmations {
    groups: Map<string, Array<MeetingConfirmationsWithMeetingAndOwnerAndGuests>>;
    dates: Array<string>;
}

// Helper function to group meetings by date and generate a list of all dates in range
function groupMeetingsByDate(
    meetings: Array<MeetingConfirmationsWithMeetingAndOwnerAndGuests>,
    locale: string
): GroupedMeetingConfirmations {
    const groups: Map<string, Array<MeetingConfirmationsWithMeetingAndOwnerAndGuests>> = new Map();
    const dates = new Set<string>();

    meetings.forEach((meetingConfirmation) => {
        const formattedDate = formatDate(meetingConfirmation.meeting.date, locale);

        dates.add(formattedDate);

        if (groups.get(formattedDate)) {
            groups.get(formattedDate)?.push(meetingConfirmation);
        }
        else {
            groups.set(formattedDate, [meetingConfirmation]);
        }
    });

    return { groups, dates: Array.from(dates) };
};

// Main component
export default function Planning() {
    const session = useSession();
    const [meetings, setMeetings] = useState<Array<MeetingConfirmationsWithMeetingAndOwnerAndGuests>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedDate, setExpandedDate] = useState<string | null>(null); // State to track expanded Accordion
    const defaultLocale = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/v1/meetings')
            .then((res) => res.json())
            .then((data) => {
                Array.isArray(data) ? setMeetings(data) : setMeetings([]);
                setIsLoading(false);
            })
            .catch(err => {
                setError('Failed to load meetings.');
                setIsLoading(false);
            });
    }, []);

    // Group and prepare dates
    const { groups: groupedMeetingConfirmations, dates } = groupMeetingsByDate(meetings, defaultLocale);

    // Create timeline events
    function timelineEvents() {
        return dates.map(date => ({
            date,
            content: groupedMeetingConfirmations.get(date) && groupedMeetingConfirmations.get(date)!.length > 0
                ? `${groupedMeetingConfirmations.get(date)!.length} meeting(s)`
                : 'No meetings',
            onClick: () => setExpandedDate(date) // Set the expanded date on click
        }));
    }

    const handleCancel = () => {
        setIsLoading(true); // Show loading state
        fetch('/api/v1/meetings')
            .then((res) => res.json())
            .then((data) => {
                Array.isArray(data) ? setMeetings(data) : setMeetings([]);
                setIsLoading(false);
            })
            .catch(err => {
                setError('Failed to reload meetings.');
                setIsLoading(false);
            });
    };

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
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ flexGrow: 1 }}
            >
                <Grid item xs={12} md={8}>
                    <Box p={2}>
                        {/* Meetings Section */}
                        <Box mb={2} textAlign="center">
                            <Typography variant="h2">Planning</Typography>
                        </Box>

                        {/* Loading Spinner */}
                        <Box textAlign="center">
                            {isLoading && <CircularProgress />}
                            {error && <Typography variant="h6" color="error">{error}</Typography>}
                        </Box>

                        {dates.length < 1 ?
                            <Box textAlign="center" >
                                <Typography>Nothing confirmed yet, go create a slot or invite someone!</Typography>
                            </Box> : ""
                        }

                        {/* Display Meetings by Date */}
                        <Grid container spacing={2}>
                            {dates.map((date, index) => (
                                <Grid item xs={12} key={date}>
                                    <Paper
                                        elevation={3}
                                        sx={{ mb: 2, borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}
                                    >
                                        <Accordion
                                            expanded={expandedDate === date || (!expandedDate && index === 0)}
                                            onChange={() => setExpandedDate(expandedDate === date ? null : date)}
                                            sx={{ p: 1 }}
                                        >
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Typography variant="h5" fontWeight="bold">
                                                    {date}
                                                </Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                {groupedMeetingConfirmations.get(date) && groupedMeetingConfirmations.get(date)!.length > 0 ? (
                                                    <Grid container spacing={2}>
                                                        {groupedMeetingConfirmations.get(date)?.map(meetingConfirmation => (
                                                            <Grid item xs={12} sm={6} md={4} key={meetingConfirmation.id}>
                                                                <MeetingConfirmationCard
                                                                    meetingConfirmation={meetingConfirmation}
                                                                    onCancel={handleCancel}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                ) : (
                                                    <Typography variant="body2" textAlign="center" color="textSecondary">
                                                        No meetings scheduled for this day.
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
                    <Timeline events={timelineEvents()} onTimelineItemClick={(date) => setExpandedDate(date)} />
                </Grid>
            </Grid>
        </Box>
    );
}
