import { describe, expect, it } from "vitest";
import { addIssueToProject, updateProjectIssueStatusByContentId } from "../src/github/project.js";

describe("Project V2 helpers", () => {
  it("adds a new issue to the project and sets To Watch", async () => {
    const calls: string[] = [];

    await addIssueToProject(
      "token",
      "owner",
      1,
      "ISSUE_node",
      "To Watch",
      async (_input, init) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as { query: string };
        calls.push(body.query);

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
      },
    );

    expect(calls).toHaveLength(3);
  });

  it("updates an existing project item when the issue is closed", async () => {
    const updated = await updateProjectIssueStatusByContentId(
      "token",
      "owner",
      1,
      "ISSUE_node",
      "Done",
      async (_input, init) => {
        const body = JSON.parse(String(init?.body ?? "{}")) as { query: string };

        if (body.query.includes("query LookupProjectItems")) {
          return new Response(
            JSON.stringify({
              data: {
                organization: {
                  projectV2: {
                    items: {
                      nodes: [
                        {
                          id: "ITEM_1",
                          content: {
                            __typename: "Issue",
                            id: "ISSUE_node",
                          },
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
      },
    );

    expect(updated).toBe(true);
  });
});
