"use client";
import { useActionState, useEffect, useState, useTransition } from "react";

import { Box, Paper } from "@mui/material";
import { Playlists } from "./playlists";
import { Results } from "./results";
import {
  GetPlaylists,
  type Playlist,
  // getArtistAlbums,
  // getTracksFromAlbums,
  getUniqueArtists,
} from "../spotifyApi";

export const Body = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [playlistsAreLoading, startLoadingPlaylists] = useTransition();
  useEffect(() => {
    startLoadingPlaylists(async () => {
      const playlists = await GetPlaylists();
      console.log(`loaded ${playlists.length} playlists`);
      setPlaylists(playlists);
    });
    return () => setPlaylists([]);
  }, []); // Get initial list of user's playlists

  const [artists, searchAction, isPending] = useActionState(async () => {
    return await getUniqueArtists(Array.from(selectedPlaylistIds));
  }, []); // The Action to perform the Search

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: "16px",
      }}
    >
      <Paper
        sx={{
          maxHeight: 800,
          margin: 5,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {playlists.length > 0 ? (
          <Playlists
            playlists={playlists}
            playlistsAreLoading={playlistsAreLoading}
            searchAction={searchAction}
            selectedPlaylistIds={selectedPlaylistIds}
            setSelectedPlaylistIds={setSelectedPlaylistIds}
          />
        ) : (
          <div> Sign In </div>
        )}
      </Paper>
      <Paper
        sx={{
          maxHeight: 800,
          margin: 5,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Results results={artists} isPending={isPending} />
      </Paper>
    </Box>
  );
};
