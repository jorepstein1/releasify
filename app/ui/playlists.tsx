"use client";
import * as React from "react";
import { Box, TextField, List, ListItem, ListItemText } from "@mui/material";
import type { Playlist } from "../spotifyApi";

export const Playlists: React.FC<{ playlists: Playlist[] }> = ({
  playlists,
}) => {
  const [search, setSearch] = React.useState("");
  const filtered = playlists.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
      <TextField
        label="Search Playlists"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <List sx={{ height: 500, overflowY: "auto" }}>
        {filtered.map((playlist) => (
          <ListItem key={playlist.id} disablePadding>
            <ListItemText primary={playlist.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
