"use client";
import * as React from "react";
import {
  Box,
  Button,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
} from "@mui/material";
import type { Playlist } from "../spotifyApi";

export const Playlists: React.FC<{ playlists: Playlist[] }> = ({
  playlists,
}) => {
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const filtered = playlists.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card>
      <CardContent
        sx={{ display: "flex", maxHeight: 500, flexDirection: "column" }}
      >
        <TextField
          label="Search Playlists"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Box
          sx={{
            width: "100%",
            mx: "auto",
            overflowY: "auto",
          }}
        >
          <List>
            {filtered.map((playlist) => (
              <ListItemButton
                key={playlist.id}
                selected={selected.has(playlist.id)}
                onClick={() => {
                  if (selected.has(playlist.id)) {
                    selected.delete(playlist.id);
                  } else {
                    selected.add(playlist.id);
                  }
                  setSelected(new Set(selected));
                }}
              >
                <ListItemText primary={playlist.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Button>Search</Button>
      </CardContent>
    </Card>
  );
};
