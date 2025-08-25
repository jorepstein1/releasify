export interface Track {
  id: string;
  name: string;
}

export interface Album {
  tracks: {
    items: Track[];
  };
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
}

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

export async function getNumUserPlaylists(
  accessToken: string,
  options = {},
): Promise<string> {
  console.log("Getting num playlists");
  return fetchEndpoint(`https://api.spotify.com/v1/me/playlists`, accessToken, {
    limit: "1",
    ...options,
  }).then((body) => body.total);
}

export async function getTracksFromAlbums(
  albumIds: string[],
  accessToken: string,
  options = {},
): Promise<Track[]> {
  let albumPromise = fetchEndpoint(
    "https://api.spotify.com/v1/albums",
    accessToken,
    {
      ids: albumIds,
      ...options,
    },
  ) as Promise<{ albums: Album[] }>;

  return albumPromise
    .then((body) => body.albums)
    .then((albums) => albums.flatMap((album) => album.tracks.items));
}

/**
 * Artists
 */

export async function getArtistAlbums(
  artistId: string,
  accessToken: string,
  options = {},
): Promise<Album[]> {
  return fetchEndpoint(
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
  return fetchEndpoint(
    `https://api.spotify.com/v1/artists/${artistId}/albums`,
    accessToken,
    { limit: 1, ...options },
  ).then((body) => body.total);
}

/**
 * PLAYLISTS
 */

export async function getUserPlaylists(
  accessToken: string,
  options = {},
): Promise<Playlist[]> {
  return fetchEndpoint(
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
  return await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
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

async function fetchEndpoint(
  endpoint: string,
  accessToken: string,
  options: Record<string, any>,
): Promise<any> {
  let url = endpoint;
  if (Object.keys(options).length != 0) {
    url += "?" + new URLSearchParams(options);
  }
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

async function success(response: Response, tryAgain: () => Promise<any>) {
  if (!response.ok) {
    if (response.status == 429) {
      // Too Many Requests
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
      return tryAgain();
    }
    if (response.status == 503) {
      // Service Unavailable
      return tryAgain();
    }
    throw new Error(`HTTP Status: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function rejected(reason: string) {
  throw new Error("Rejected:" + reason);
}
