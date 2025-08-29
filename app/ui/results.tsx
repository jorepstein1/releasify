import {
  Box,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
} from "@mui/material";
import { Artist } from "../spotifyApi";

export const Results = ({
  results,
  isPending,
}: {
  results?: Artist[];
  isPending: boolean;
}) => {
  if (isPending) {
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
              <ListItem key={track.id} disablePadding>
                <ListItemText primary={track.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};
