"use server";
import { auth } from "@/auth";

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
}

export interface Album {
  id: string;
  tracks: {
    items: Track[];
  };
  release_date: string; // example 1981-10
}

export interface Artist {
  id: string;
  name: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: {
    total: number;
    items: {
      track: Track;
    }[];
  };
  images: {
    url: string;
    height: number;
    width: number;
  }[];
}

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const client_id = process.env.AUTH_SPOTIFY_ID;
const client_secret = process.env.AUTH_SPOTIFY_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

export async function GetPlaylists() {
  const session = await auth();
  if (!session?.access_token) return [];
  return getUserPlaylists(session.access_token);
}

export async function getUniqueArtists(
  selectedPlaylistIds: string[],
): Promise<Artist[]> {
  console.log("Getting unique artists");
  const session = await auth();
  const accessToken = session?.access_token;
  if (!accessToken) {
    console.log("No access token");
    return [];
  }

  return Promise.all(
    Array.from(selectedPlaylistIds).map((id) =>
      getArtistsFromPlaylist(id, accessToken),
    ),
  ) // get artists from each playlist
    .then((values) => values.flat())
    .then((allArtists) => {
      const artistIdMap = new Map<string, Artist>(
        allArtists.map((a) => [a.id, a]),
      );
      const uniqueArtists = Array.from(artistIdMap.values());
      return uniqueArtists;
    });
}
export async function getNumUserPlaylists(
  accessToken: string,
  options = {},
): Promise<number> {
  console.log("Getting num playlists");
  return fetchEndpoint<{ total: number }>(
    `https://api.spotify.com/v1/me/playlists`,
    accessToken,
    {
      limit: "1",
      ...options,
    },
  ).then((body) => body.total);
}

export async function getTracksFromAlbums(
  albumIds: string[],
  options = {},
): Promise<Track[]> {
  console.log("Getting tracks from albums");
  const session = await auth();
  const accessToken = session?.access_token;
  if (!accessToken) {
    console.log("No access token");
    return [];
  }
  return fetchEndpoint<{ albums: { tracks: { items: Track[] } }[] }>(
    "https://api.spotify.com/v1/albums",
    accessToken,
    {
      ids: albumIds.join(","),
      ...options,
    },
  )
    .then((body) => body.albums)
    .then((albums) => albums.flatMap((album) => album.tracks.items));
}

/**
 * Artists
 */

export async function getArtistAlbums(
  artistId: string,
  options = {},
): Promise<Album[]> {
  console.log("Getting artist albums:", artistId);
  const session = await auth();
  const accessToken = session?.access_token;
  if (!accessToken) {
    console.log("No access token");
    return [];
  }

  return fetchEndpoint<{ items: Album[] }>(
    `https://api.spotify.com/v1/artists/${artistId}/albums`,
    accessToken,
    options,
  ).then((body) => body.items);
}

export async function getNumArtistsAlbums(
  artistId: string,
  accessToken: string,
  options = {},
): Promise<number> {
  return fetchEndpoint<{ total: number }>(
    `https://api.spotify.com/v1/artists/${artistId}/albums`,
    accessToken,
    { limit: "1", ...options },
  ).then((body) => body.total);
}

/**
 * PLAYLISTS
 */

export async function getUserPlaylists(
  accessToken: string,
  options = {},
): Promise<Playlist[]> {
  return fetchEndpoint<{ items: Playlist[] }>(
    `https://api.spotify.com/v1/me/playlists`,
    accessToken,
    options,
  ).then((body) => body.items);
}

export async function getPlaylistTracks(
  playlistId: string,
  accessToken: string,
  options = {},
): Promise<Track[]> {
  return getPlaylist(playlistId, accessToken, options).then((body) =>
    body.tracks.items.map((item) => item.track),
  );
}

export async function getNumPlaylistTracks(
  playlistId: string,
  accessToken: string,
  options = {},
): Promise<number> {
  return getPlaylist(playlistId, accessToken, options).then(
    (body) => body.tracks.total,
  );
}

export async function getArtistsFromPlaylist(
  playlistId: string,
  accessToken: string,
): Promise<Artist[]> {
  return getPlaylist(playlistId, accessToken).then((body) => {
    console.log(body);
    const allArtists = body.tracks.items.flatMap((item) => item.track.artists);

    return allArtists;
  });
}

async function getPlaylist(
  playlistId: string,
  accessToken: string,
  options = {},
): Promise<Playlist> {
  return fetchEndpoint(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    accessToken,
    options,
  );
}

export async function performTokenRefresh(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: number;
}> {
  console.log("Refreshing token");
  console.log("Using refresh token", refreshToken);
  console.log("Using client_id", client_id);
  console.log("Using client_secret", client_secret);
  const headers = {
    Authorization: `Basic ${basic}`,
    "content-type": "application/x-www-form-urlencoded",
  };
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  console.log("Headers:", headers);
  console.log("Body:", body.toString());
  return await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers,
    body,
  })
    .then(
      (response) => success(response, () => performTokenRefresh(refreshToken)),
      rejected,
    )
    .then((body) => {
      return {
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        expires_at: Math.floor(Date.now() / 1000 + body.expires_in),
      };
    });
}

async function fetchEndpoint<T>(
  endpoint: string,
  accessToken: string,
  options: Record<string, string>,
): Promise<T> {
  let url = endpoint;
  if (Object.keys(options).length != 0) {
    url += "?" + new URLSearchParams(options);
  }
  console.log("Fetching", url);
  // console.log("Fetching - Token", accessToken);
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(
    (response) =>
      success(response, () => fetchEndpoint(endpoint, accessToken, options)),
    rejected,
  );
}

async function success<T>(response: Response, tryAgain: () => Promise<T>) {
  if (!response.ok) {
    if (response.status == 429) {
      // Too Many Requests
      await new Promise((resolve) => {
        setTimeout(resolve, 1000); // TODO: use Retry-After, add maxAttempts/exponential backoff/Jitter
      });
      return tryAgain();
    }
    if (response.status == 503) {
      // Service Unavailable
      return tryAgain(); // TODO: add maxAttempts/exponential backoff/jitter
    }
    throw new Error(
      `HTTP Status: ${response.status} ${response.statusText} ${response.headers}`,
    );
  }
  return response.json();
}

async function rejected(reason: string) {
  throw new Error("Rejected:" + reason);
}
