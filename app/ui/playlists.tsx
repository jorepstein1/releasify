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
  CardHeader,
} from "@mui/material";
import { getNumPlaylistTracks, type Playlist } from "../spotifyApi";

export const Playlists: React.FC<{
  playlists: Playlist[];
  accessToken: string;
}> = ({ playlists, accessToken }) => {
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [numTracks, setNumTracks] = React.useState(0);
  const filtered = playlists.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const onSearchClick = async () => {
    const totalNum = await Promise.all(
      Array.from(selected).map((id) =>
        getNumPlaylistTracks(id, accessToken, {}),
      ),
    ).then((values) => values.reduce((acc, curr) => acc + curr, 0));
    setNumTracks(totalNum);
  };

  return (
    <Card>
      <CardHeader
        title={`Select Playlists (${selected.size} selected)`}
      ></CardHeader>
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
        <Button onClick={onSearchClick}>Search</Button>
        <Box>{numTracks}</Box>
      </CardContent>
    </Card>
  );
};
