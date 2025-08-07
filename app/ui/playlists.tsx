"use client";
import * as React from "react";
import { Box, TextField, List, ListItem, ListItemText } from "@mui/material";
import type { Playlist } from "../spotifyApi";

type PlaylistsProps = {
  playlists: Array<Pick<Playlist, "id" | "name">>;
};

export const Playlists: React.FC<PlaylistsProps> = ({ playlists }) => {
  const [search, setSearch] = React.useState("");
  const filtered = React.useMemo(
    () =>
      playlists.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [playlists, search],
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
      <TextField
        label="Search Playlists"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <List>
        {filtered.map((playlist) => (
          <ListItem key={playlist.id} disablePadding>
            <ListItemText primary={playlist.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
