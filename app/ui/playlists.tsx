"use client";
import * as React from "react";
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
  CardHeader,
} from "@mui/material";
import {
  getNumPlaylistTracks,
  getArtistsFromPlaylist,
  type Playlist,
  type Artist,
} from "../spotifyApi";

export const Playlists: React.FC<{
  playlists: Playlist[];
  accessToken: string;
}> = ({ playlists, accessToken }) => {
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set());
  const [numTracks, setNumTracks] = React.useState(0);
  const [artists, setArtists] = React.useState<Artist[]>([]);
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

    const allArtists = await Promise.all(
      Array.from(selected).map((id) => getArtistsFromPlaylist(id, accessToken)),
    ) // get artists from each playlist
      .then((values) => values.flat())
      .then((allArtists) => {
        const artistIdMap = new Map<string, Artist>(
          allArtists.map((a) => [a.id, a]),
        );
        console.log("allArtists", allArtists);
        const uniqueArtists = Array.from(artistIdMap.values());
        console.log("Unique Artists", uniqueArtists);
        return uniqueArtists;
      }); // remove duplicates
    setArtists(allArtists);
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
                <ListItemIcon>
                  <img
                    src={playlist.images.at(-1)?.url} // The images are ordered smallest to largest
                    alt={playlist.name}
                    width={50}
                    height={50}
                  />
                </ListItemIcon>
                <ListItemText primary={playlist.name} />
              </ListItemButton>
            ))}
          </List>
        </Box>
        <Button onClick={onSearchClick}>Search</Button>
        <Box>{`numTracks: ${numTracks}`}</Box>
        <Box>{`artists.length: ${artists.length}`}</Box>
        <Box sx={{ height: 500, overflowY: "auto" }}>
          {artists.map((artist) => (
            <Box key={artist.id}>{artist.name}</Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
