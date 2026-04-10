import type { ReminderIssue } from "./github/issues.js";

export interface IssueBodyInput {
  canonicalUrl: string;
  rawUrl: string;
  videoId: string;
  title: string;
  channelName?: string;
  thumbnailUrl?: string;
  collectedAt: string;
  telegramMessage: string;
}

export function formatIssueBody(input: IssueBodyInput): string {
  const parts = [
    `<!-- youtube-watch-later-video-id:${input.videoId} -->`,
    `# ${input.title}`,
    "",
    "## Video",
    `- Canonical URL: ${input.canonicalUrl}`,
    `- Original URL: ${input.rawUrl}`,
    `- Video ID: \`${input.videoId}\``,
    `- Channel: ${input.channelName ?? "Unknown"}`,
    `- Collected at: ${input.collectedAt}`,
    "",
  ];

  if (input.thumbnailUrl) {
    parts.push("## Thumbnail", `![YouTube thumbnail](${input.thumbnailUrl})`, "");
  }

  parts.push(
    "## Original Telegram message",
    "```text",
    sanitizeCodeFence(input.telegramMessage || "(link only)"),
    "```",
  );

  return parts.join("\n");
}

export function formatSuccessMessage(title: string, issueNumber: number): string {
  return `✅ 등록 완료: ${title} -> Issue #${issueNumber}`;
}

export function formatUrlOnlySuccessMessage(issueNumber: number): string {
  return `📝 메타데이터 없이 URL만 등록: Issue #${issueNumber}`;
}

export function formatDuplicateMessage(params: {
  issueNumber: number;
  state: "open" | "closed";
}): string {
  const closedNote =
    params.state === "closed"
      ? "\n닫힌 이슈입니다. GitHub에서 다시 열어 재사용할 수 있어요."
      : "";

  return `⚠️ 이미 등록됨: Issue #${params.issueNumber}${closedNote}`;
}

export function formatGitHubErrorMessage(): string {
  return "❌ 일시적 오류 - 나중에 다시 보내주세요";
}

export function formatUnsupportedUrlMessage(): string {
  return "🔗 YouTube 링크만 지원합니다";
}

export function formatReminderMessages(
  issues: ReminderIssue[],
  repoFullName: string,
  repoUrl: string,
  maxLength = 4096,
): string[] {
  const searchUrl = `${repoUrl}/issues?q=${encodeURIComponent("is:issue is:open label:watch-later")}`;

  if (issues.length === 0) {
    return [`📭 오늘은 열려 있는 watch-later 이슈가 없습니다.\nRepo: ${repoFullName}`];
  }

  const detailedBlocks = issues.slice(0, 5).map((issue, index) => {
    const createdAt = issue.createdAt.slice(0, 10);

    return [
      `${index + 1}. ${truncate(issue.title, 180)}`,
      `Issue #${issue.number} · ${createdAt}`,
      issue.htmlUrl,
    ].join("\n");
  });

  const summaryBlock =
    issues.length > 5
      ? `외 ${issues.length - 5}개 더 있습니다.\n${searchUrl}`
      : `전체 목록: ${searchUrl}`;

  const blocks = [
    `📺 Watch later reminder\nRepo: ${repoFullName}\nOpen items: ${issues.length}`,
    ...detailedBlocks,
    summaryBlock,
  ];

  return chunkBlocks(blocks, maxLength);
}

function chunkBlocks(blocks: string[], maxLength: number): string[] {
  const messages: string[] = [];
  let current = "";

  for (const block of blocks) {
    const candidate = current ? `${current}\n\n${block}` : block;

    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) {
      messages.push(current);
      current = "";
    }

    if (block.length <= maxLength) {
      current = block;
      continue;
    }

    for (const lineChunk of chunkLongText(block, maxLength)) {
      messages.push(lineChunk);
    }
  }

  if (current) {
    messages.push(current);
  }

  return messages;
}

function chunkLongText(text: string, maxLength: number): string[] {
  const lines = text.split("\n");
  const chunks: string[] = [];
  let current = "";

  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line;

    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (line.length <= maxLength) {
      current = line;
      continue;
    }

    let remaining = line;
    while (remaining.length > maxLength) {
      chunks.push(remaining.slice(0, maxLength));
      remaining = remaining.slice(maxLength);
    }
    current = remaining;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function sanitizeCodeFence(text: string): string {
  return text.replace(/```/g, "'''").trim();
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}
