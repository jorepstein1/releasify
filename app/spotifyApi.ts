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
  options: Record<string, string>,
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
