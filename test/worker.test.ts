import { describe, expect, it } from "vitest";
import { handleRequest } from "../src/index.js";

const env = {
  TELEGRAM_BOT_TOKEN: "telegram-token",
  TELEGRAM_WEBHOOK_SECRET: "secret",
  TELEGRAM_ALLOWED_CHAT_ID: "123",
  GITHUB_TOKEN: "github-token",
  GITHUB_OWNER: "owner",
  GITHUB_REPO: "repo",
  GITHUB_PROJECT_NUMBER: "1",
};

describe("worker integration flow", () => {
  it("acknowledges the webhook immediately and completes async work", async () => {
    const waitUntilPromises: Promise<unknown>[] = [];
    const sentMessages: string[] = [];

    const response = await handleRequest(
      new Request("https://worker.example/telegram/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-Telegram-Bot-Api-Secret-Token": "secret",
        },
        body: JSON.stringify({
          message: {
            message_id: 1,
            chat: { id: 123 },
            text: "https://youtu.be/dQw4w9WgXcQ",
          },
        }),
      }),
      env,
      {
        waitUntil(promise: Promise<unknown>) {
          waitUntilPromises.push(promise);
        },
        passThroughOnException() {},
      } as unknown as ExecutionContext,
      {
        fetch: async (input, init) => {
          const url = input.toString();

          if (url.startsWith("https://www.youtube.com/oembed")) {
            return new Response(
              JSON.stringify({
                title: "Video title",
                author_name: "Channel name",
                thumbnail_url: "https://img.youtube.com/example.jpg",
              }),
              { status: 200 },
            );
          }

          if (url.includes("/search/issues")) {
            return new Response(JSON.stringify({ items: [] }), { status: 200 });
          }

          if (url.endsWith("/labels/watch-later")) {
            return new Response(JSON.stringify({ name: "watch-later" }), { status: 200 });
          }

          if (url.endsWith("/issues")) {
            return new Response(
              JSON.stringify({
                number: 15,
                title: "Video title",
                html_url: "https://github.com/owner/repo/issues/15",
                node_id: "ISSUE_NODE",
                state: "open",
              }),
              { status: 201 },
            );
          }

          if (url.endsWith("/graphql")) {
            const body = JSON.parse(String(init?.body ?? "{}")) as { query: string };

            if (body.query.includes("query LookupProject")) {
              return new Response(
                JSON.stringify({
                  data: {
                    organization: {
                      projectV2: {
                        id: "PROJECT_1",
                        title: "Watch later",
                        fields: {
                          nodes: [
                            {
                              __typename: "ProjectV2SingleSelectField",
                              id: "FIELD_1",
                              name: "Status",
                              options: [
                                { id: "OPTION_TODO", name: "To Watch" },
                                { id: "OPTION_DONE", name: "Done" },
                              ],
                            },
                          ],
                        },
                      },
                    },
                    user: null,
                  },
                }),
                { status: 200 },
              );
            }

            if (body.query.includes("mutation AddProjectItem")) {
              return new Response(
                JSON.stringify({
                  data: {
                    addProjectV2ItemById: {
                      item: {
                        id: "ITEM_1",
                      },
                    },
                  },
                }),
                { status: 200 },
              );
            }

            return new Response(
              JSON.stringify({
                data: {
                  updateProjectV2ItemFieldValue: {
                    projectV2Item: {
                      id: "ITEM_1",
                    },
                  },
                },
              }),
              { status: 200 },
            );
          }

          if (url.includes("/sendMessage")) {
            const body = JSON.parse(String(init?.body ?? "{}")) as { text: string };
            sentMessages.push(body.text);
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
          }

          throw new Error(`Unhandled request: ${url}`);
        },
        now: () => new Date("2026-04-10T00:00:00.000Z"),
        log: console,
      },
    );

    expect(response.status).toBe(200);
    expect(waitUntilPromises).toHaveLength(1);

    await Promise.all(waitUntilPromises);

    expect(sentMessages).toEqual(["✅ 등록 완료: Video title -> Issue #15"]);
  });
});
