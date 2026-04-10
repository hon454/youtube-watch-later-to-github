export class GitHubRequestError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status: number, details?: string) {
    super(message);
    this.name = "GitHubRequestError";
    this.status = status;
    this.details = details;
  }
}

export async function githubRestRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
  fetchImpl: typeof fetch = fetch,
): Promise<T> {
  const url = `https://api.github.com${path}`;
  const response = await fetchImpl(url, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "user-agent": "youtube-watch-later-to-github",
      "x-github-api-version": "2022-11-28",
      ...init.headers,
    },
  });

  const bodyText = await response.text();

  if (!response.ok) {
    throw new GitHubRequestError(
      `GitHub REST request failed for ${path}`,
      response.status,
      bodyText,
    );
  }

  return bodyText ? (JSON.parse(bodyText) as T) : (undefined as T);
}

export async function githubGraphqlRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<T> {
  const response = await fetchImpl("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": "youtube-watch-later-to-github",
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok) {
    throw new GitHubRequestError(
      "GitHub GraphQL request failed",
      response.status,
      JSON.stringify(payload),
    );
  }

  if (payload.errors && payload.errors.length > 0) {
    throw new GitHubRequestError(
      payload.errors.map((error) => error.message).join("; "),
      response.status,
      JSON.stringify(payload.errors),
    );
  }

  if (!payload.data) {
    throw new GitHubRequestError("GitHub GraphQL response did not include data", response.status);
  }

  return payload.data;
}
