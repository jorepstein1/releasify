import { Box, List, ListItem, ListItemText } from "@mui/material";
import { Track } from "../spotifyApi";

export const Results = (props: { tracks: Track[] }) => {
  let tracks = props.tracks;
  if (!tracks.length) {
    tracks = [
      {
        id: "1",
        name: "No Results Found",
      },
    ];
  }
  return (
    <Box>
      <List>
        {tracks.map((track) => (
          <ListItem key={track.id} disablePadding>
            <ListItemText primary={track.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
