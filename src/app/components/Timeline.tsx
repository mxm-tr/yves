import { Box, Chip, Typography, Divider, Stack, ListItemButton } from '@mui/material';

type TimelineItem = {
    date: string;
    content: string;
    onClick: () => void;
};

const Timeline = ({ events, onTimelineItemClick }: { events: TimelineItem[], onTimelineItemClick: (date: string) => void }) => {
    return (
        <Box sx={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', padding: 2 }}>

            <Typography variant="h6" sx={{ mb: 2 }}>Timeline</Typography>
            <Stack spacing={2}>
                {events.map((event, index) => (
                    <Stack key={index} spacing={1}>
                        <ListItemButton onClick={() => onTimelineItemClick(event.date)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Stack direction="row" alignItems="center">
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{event.date}</Typography>
                            </Stack>
                        </ListItemButton>
                        <Chip
                            label={event.content}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                        {index < events.length - 1 && <Divider />}
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
};

export default Timeline;
