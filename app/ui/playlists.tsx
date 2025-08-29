import { useState } from "react";

import {
  Box,
  Button,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
} from "@mui/material";
import { type Playlist } from "../spotifyApi";

export const Playlists = ({
  playlists,
  searchAction,
  selectedPlaylistIds,
  setSelectedPlaylistIds,
  playlistsAreLoading,
}: {
  playlists: Playlist[];
  searchAction: () => void;
  selectedPlaylistIds: Set<string>;
  setSelectedPlaylistIds: (playlists: Set<string>) => void;
  playlistsAreLoading: boolean;
}) => {
  const [search, setSearch] = useState("");
  const filtered = playlists.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
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
        >{`Select Playlists (${selectedPlaylistIds.size} selected)`}</Box>
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
          {playlistsAreLoading ? (
            <div>Loading...</div>
          ) : (
            <List>
              {filtered.map((playlist) => (
                <ListItemButton
                  key={playlist.id}
                  selected={selectedPlaylistIds.has(playlist.id)}
                  onClick={() => {
                    if (selectedPlaylistIds.has(playlist.id)) {
                      selectedPlaylistIds.delete(playlist.id);
                    } else {
                      selectedPlaylistIds.add(playlist.id);
                    }
                    setSelectedPlaylistIds(new Set(selectedPlaylistIds));
                  }}
                >
                  <ListItemIcon>
                    <img
                      src={playlist.images?.at(-1)?.url} // The images are ordered smallest to largest
                      alt={playlist.name}
                      width={50}
                      height={50}
                    />
                  </ListItemIcon>
                  <ListItemText primary={playlist.name} />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
        <form>
          <Button type="submit" formAction={() => searchAction()}>
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
