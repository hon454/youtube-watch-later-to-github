import type { GitHubRepoConfig } from "../config.js";
import { GitHubRequestError, githubRestRequest } from "./client.js";

export interface DuplicateIssue {
  number: number;
  title: string;
  htmlUrl: string;
  state: "open" | "closed";
}

export interface CreatedIssue extends DuplicateIssue {
  nodeId: string;
}

export interface ReminderIssue {
  number: number;
  title: string;
  htmlUrl: string;
  createdAt: string;
}

interface GitHubSearchResponse {
  items: Array<{
    number: number;
    title: string;
    html_url: string;
    state: "open" | "closed";
  }>;
}

interface GitHubIssueResponse {
  number: number;
  title: string;
  html_url: string;
  node_id: string;
  state: "open" | "closed";
  created_at?: string;
  pull_request?: Record<string, unknown>;
}

const WATCH_LATER_LABEL = "watch-later";
const WATCH_LATER_LABEL_COLOR = "0e8a16";
const WATCH_LATER_LABEL_DESCRIPTION = "YouTube videos saved for later watching";

export async function findDuplicateIssue(
  repoConfig: GitHubRepoConfig,
  videoId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DuplicateIssue | null> {
  const query = new URLSearchParams({
    q: `repo:${repoConfig.owner}/${repoConfig.repo} is:issue label:${WATCH_LATER_LABEL} in:body "youtube-watch-later-video-id:${videoId}"`,
    per_page: "10",
  });

  const response = await githubRestRequest<GitHubSearchResponse>(
    `/search/issues?${query.toString()}`,
    repoConfig.token,
    {},
    fetchImpl,
  );

  const bestMatch = [...response.items].sort((left, right) => {
    if (left.state === right.state) {
      return left.number - right.number;
    }

    return left.state === "open" ? -1 : 1;
  })[0];

  return bestMatch
    ? {
        number: bestMatch.number,
        title: bestMatch.title,
        htmlUrl: bestMatch.html_url,
        state: bestMatch.state,
      }
    : null;
}

export async function createIssue(
  repoConfig: GitHubRepoConfig,
  title: string,
  body: string,
  fetchImpl: typeof fetch = fetch,
): Promise<CreatedIssue> {
  await ensureWatchLaterLabel(repoConfig, fetchImpl);

  const response = await githubRestRequest<GitHubIssueResponse>(
    `/repos/${repoConfig.owner}/${repoConfig.repo}/issues`,
    repoConfig.token,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        labels: [WATCH_LATER_LABEL],
      }),
    },
    fetchImpl,
  );

  return {
    number: response.number,
    title: response.title,
    htmlUrl: response.html_url,
    nodeId: response.node_id,
    state: response.state,
  };
}

export async function listOpenWatchLaterIssues(
  repoConfig: GitHubRepoConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<ReminderIssue[]> {
  const query = new URLSearchParams({
    state: "open",
    labels: WATCH_LATER_LABEL,
    per_page: "100",
    sort: "created",
    direction: "desc",
  });

  const issues = await githubRestRequest<GitHubIssueResponse[]>(
    `/repos/${repoConfig.owner}/${repoConfig.repo}/issues?${query.toString()}`,
    repoConfig.token,
    {},
    fetchImpl,
  );

  return issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      title: issue.title,
      htmlUrl: issue.html_url,
      createdAt: issue.created_at ?? new Date(0).toISOString(),
    }));
}

async function ensureWatchLaterLabel(
  repoConfig: GitHubRepoConfig,
  fetchImpl: typeof fetch,
): Promise<void> {
  try {
    await githubRestRequest(
      `/repos/${repoConfig.owner}/${repoConfig.repo}/labels/${encodeURIComponent(WATCH_LATER_LABEL)}`,
      repoConfig.token,
      {},
      fetchImpl,
    );
  } catch (error) {
    if (!(error instanceof GitHubRequestError) || error.status !== 404) {
      throw error;
    }

    await githubRestRequest(
      `/repos/${repoConfig.owner}/${repoConfig.repo}/labels`,
      repoConfig.token,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: WATCH_LATER_LABEL,
          color: WATCH_LATER_LABEL_COLOR,
          description: WATCH_LATER_LABEL_DESCRIPTION,
        }),
      },
      fetchImpl,
    );
  }
}
