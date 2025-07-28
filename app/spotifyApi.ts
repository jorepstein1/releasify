export async function getNumUserPlaylists(accessToken: string, options = {}) {
  return fetchEndpoint(`https://api.spotify.com/v1/me/playlists`, accessToken, {
    limit: 1,
    ...options,
  }).then((body) => body.total);
}

async function fetchEndpoint(endpoint, accessToken, options) {
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

async function success(response, tryAgain) {
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
    throw new Error("HTTP Status: " + response.status);
  }
  return response.json();
}

async function rejected(reason) {
  throw new Error("Rejected:" + reason);
}
