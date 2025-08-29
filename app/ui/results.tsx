import {
  Box,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
} from "@mui/material";
import { Track } from "../spotifyApi";

export const Results = ({
  results,
  searchIsPending,
}: {
  results?: Track[];
  searchIsPending: boolean;
}) => {
  if (searchIsPending) {
    return <div>pending</div>;
  }
  if (!results) {
    return <div> submit pls</div>;
  }
  return (
    <Card>
      <CardContent
        sx={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Box
          sx={{
            fontFamily: "Roboto, sans-serif",
            fontSize: "var(--text-h4)",
            fontWeight: "var(--font-weight-normal)",
            color: "var(--foreground)",
          }}
        >
          Results
        </Box>
        <Box
          sx={{
            width: "100%",
            mx: "auto",
            overflowY: "auto",
          }}
        >
          <List>
            {results.map((track) => (
              <ListItem key={track.id}>
                <ListItemText
                  primary={track.name}
                  secondary={track.artists
                    .map((artist) => artist.name)
                    .join(", ")}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};
