"use client";
import { useActionState, useEffect, useState, useTransition } from "react";

import { Box, Paper } from "@mui/material";
import { Playlists } from "./playlists";
import { Results } from "./results";
import {
  GetPlaylists,
  type Playlist,
  getArtistAlbums,
  getTracksFromAlbums,
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

  const [tracks, searchAction, searchIsPending] = useActionState(async () => {
    const uniqueArtists = await getUniqueArtists(
      Array.from(selectedPlaylistIds),
    );
    return await Promise.all(
      uniqueArtists.map((artist) => {
        // Perform any additional actions for each artist
        return getArtistAlbums(artist.id);
      }),
    )
      .then((albumsLists) => {
        console.log("Albums lists:", albumsLists);
        return albumsLists.flat().filter((album) => {
          const albumTime = Date.parse(album.release_date);
          const nowTime = Date.now();
          const weekAgoTime = nowTime - 7 * 24 * 60 * 60 * 1000;
          return albumTime > weekAgoTime; // return albums less than a week old
        });
      })
      .then((allAlbums) =>
        getTracksFromAlbums(allAlbums.map((album) => album.id)),
      )
      .then((allTracks) => {
        const trackMap = new Map(allTracks.map((p) => [p.id, p]));
        return Array.from(trackMap.values()); // deduplicate
      })
      .then((tracks) => {
        console.log("Tracks from albums:", tracks);
        return tracks;
      });
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
        <Playlists
          playlists={playlists}
          playlistsAreLoading={playlistsAreLoading}
          searchAction={searchAction}
          selectedPlaylistIds={selectedPlaylistIds}
          setSelectedPlaylistIds={setSelectedPlaylistIds}
        />
      </Paper>
      <Paper
        sx={{
          maxHeight: 800,
          margin: 5,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Results results={tracks} searchIsPending={searchIsPending} />
      </Paper>
    </Box>
  );
};
