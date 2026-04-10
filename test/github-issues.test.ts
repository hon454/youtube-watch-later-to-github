import { describe, expect, it } from "vitest";
import { createIssue, findDuplicateIssue } from "../src/github/issues.js";

const repoConfig = {
  token: "token",
  owner: "owner",
  repo: "repo",
};

describe("findDuplicateIssue", () => {
  it("returns the open match first", async () => {
    const duplicate = await findDuplicateIssue(
      repoConfig,
      "dQw4w9WgXcQ",
      async () =>
        new Response(
          JSON.stringify({
            items: [
              {
                number: 9,
                title: "Closed match",
                html_url: "https://github.com/owner/repo/issues/9",
                state: "closed",
              },
              {
                number: 3,
                title: "Open match",
                html_url: "https://github.com/owner/repo/issues/3",
                state: "open",
              },
            ],
          }),
          { status: 200 },
        ),
    );

    expect(duplicate).toEqual({
      number: 3,
      title: "Open match",
      htmlUrl: "https://github.com/owner/repo/issues/3",
      state: "open",
    });
  });
});

describe("createIssue", () => {
  it("creates the label when missing and posts the issue", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];

    const issue = await createIssue(
      repoConfig,
      "My title",
      "Issue body",
      async (input, init) => {
        const url = input.toString();
        calls.push({ url, init });

        if (url.endsWith("/labels/watch-later")) {
          return new Response("missing", { status: 404 });
        }

        if (url.endsWith("/labels")) {
          return new Response(JSON.stringify({ name: "watch-later" }), { status: 201 });
        }

        return new Response(
          JSON.stringify({
            number: 12,
            title: "My title",
            html_url: "https://github.com/owner/repo/issues/12",
            node_id: "ISSUE_node",
            state: "open",
          }),
          { status: 201 },
        );
      },
    );

    expect(issue.number).toBe(12);
    expect(calls).toHaveLength(3);
  });
});
