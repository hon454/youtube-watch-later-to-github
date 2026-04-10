import { githubGraphqlRequest } from "./client.js";

export interface ProjectContext {
  projectId: string;
  projectTitle: string;
  statusFieldId: string;
  statusOptionIds: Record<string, string>;
}

interface ProjectNode {
  id: string;
  title: string;
  fields: {
    nodes: Array<
      | {
          __typename: "ProjectV2SingleSelectField";
          id: string;
          name: string;
          options: Array<{ id: string; name: string }>;
        }
      | {
          __typename: string;
        }
    >;
  };
}

interface LookupProjectResponse {
  organization: { projectV2: ProjectNode | null } | null;
  user: { projectV2: ProjectNode | null } | null;
}

interface AddItemResponse {
  addProjectV2ItemById: {
    item: {
      id: string;
    };
  };
}

interface LookupProjectItemsResponse {
  organization: {
    projectV2: {
      items: {
        nodes: Array<{
          id: string;
          content: {
            __typename: string;
            id?: string;
          } | null;
        }>;
      };
    } | null;
  } | null;
  user: {
    projectV2: {
      items: {
        nodes: Array<{
          id: string;
          content: {
            __typename: string;
            id?: string;
          } | null;
        }>;
      };
    } | null;
  } | null;
}

const STATUS_FIELD_NAME = "Status";

export async function resolveProjectContext(
  token: string,
  owner: string,
  projectNumber: number,
  fetchImpl: typeof fetch = fetch,
): Promise<ProjectContext> {
  const query = `
    query LookupProject($login: String!, $number: Int!) {
      organization(login: $login) {
        projectV2(number: $number) {
          id
          title
          fields(first: 20) {
            nodes {
              __typename
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
      user(login: $login) {
        projectV2(number: $number) {
          id
          title
          fields(first: 20) {
            nodes {
              __typename
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await githubGraphqlRequest<LookupProjectResponse>(
    query,
    {
      login: owner,
      number: projectNumber,
    },
    token,
    fetchImpl,
  );

  const project = response.organization?.projectV2 ?? response.user?.projectV2;

  if (!project) {
    throw new Error(`Could not find Project V2 #${projectNumber} for ${owner}`);
  }

  const statusField = project.fields.nodes.find(isStatusField);

  if (!statusField) {
    throw new Error("Project V2 does not expose a Status single-select field");
  }

  return {
    projectId: project.id,
    projectTitle: project.title,
    statusFieldId: statusField.id,
    statusOptionIds: Object.fromEntries(
      statusField.options.map((option) => [option.name, option.id]),
    ),
  };
}

function isStatusField(
  field: ProjectNode["fields"]["nodes"][number],
): field is Extract<ProjectNode["fields"]["nodes"][number], { __typename: "ProjectV2SingleSelectField" }> {
  return (
    field.__typename === "ProjectV2SingleSelectField" &&
    "name" in field &&
    field.name === STATUS_FIELD_NAME
  );
}

export async function addIssueToProject(
  token: string,
  owner: string,
  projectNumber: number,
  issueNodeId: string,
  statusName: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const context = await resolveProjectContext(token, owner, projectNumber, fetchImpl);
  const itemId = await addProjectItem(token, context.projectId, issueNodeId, fetchImpl);

  await updateProjectItemStatus(
    token,
    context.projectId,
    itemId,
    context.statusFieldId,
    context.statusOptionIds,
    statusName,
    fetchImpl,
  );
}

export async function updateProjectIssueStatusByContentId(
  token: string,
  owner: string,
  projectNumber: number,
  issueNodeId: string,
  statusName: string,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  const context = await resolveProjectContext(token, owner, projectNumber, fetchImpl);
  const itemId = await findProjectItemIdByContentId(
    token,
    owner,
    projectNumber,
    issueNodeId,
    fetchImpl,
  );

  if (!itemId) {
    return false;
  }

  await updateProjectItemStatus(
    token,
    context.projectId,
    itemId,
    context.statusFieldId,
    context.statusOptionIds,
    statusName,
    fetchImpl,
  );

  return true;
}

async function addProjectItem(
  token: string,
  projectId: string,
  issueNodeId: string,
  fetchImpl: typeof fetch,
): Promise<string> {
  const query = `
    mutation AddProjectItem($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item {
          id
        }
      }
    }
  `;

  const response = await githubGraphqlRequest<AddItemResponse>(
    query,
    {
      projectId,
      contentId: issueNodeId,
    },
    token,
    fetchImpl,
  );

  return response.addProjectV2ItemById.item.id;
}

async function findProjectItemIdByContentId(
  token: string,
  owner: string,
  projectNumber: number,
  issueNodeId: string,
  fetchImpl: typeof fetch,
): Promise<string | null> {
  const query = `
    query LookupProjectItems($login: String!, $number: Int!) {
      organization(login: $login) {
        projectV2(number: $number) {
          items(first: 100) {
            nodes {
              id
              content {
                __typename
                ... on Issue {
                  id
                }
              }
            }
          }
        }
      }
      user(login: $login) {
        projectV2(number: $number) {
          items(first: 100) {
            nodes {
              id
              content {
                __typename
                ... on Issue {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await githubGraphqlRequest<LookupProjectItemsResponse>(
    query,
    {
      login: owner,
      number: projectNumber,
    },
    token,
    fetchImpl,
  );

  const project = response.organization?.projectV2 ?? response.user?.projectV2;
  const match = project?.items.nodes.find((item) => item.content?.id === issueNodeId);

  return match?.id ?? null;
}

async function updateProjectItemStatus(
  token: string,
  projectId: string,
  itemId: string,
  statusFieldId: string,
  statusOptionIds: Record<string, string>,
  statusName: string,
  fetchImpl: typeof fetch,
): Promise<void> {
  const statusOptionId = statusOptionIds[statusName];

  if (!statusOptionId) {
    throw new Error(`Project V2 is missing the "${statusName}" status option`);
  }

  const query = `
    mutation UpdateProjectStatus(
      $projectId: ID!
      $itemId: ID!
      $fieldId: ID!
      $optionId: String!
    ) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  await githubGraphqlRequest(
    query,
    {
      projectId,
      itemId,
      fieldId: statusFieldId,
      optionId: statusOptionId,
    },
    token,
    fetchImpl,
  );
}
