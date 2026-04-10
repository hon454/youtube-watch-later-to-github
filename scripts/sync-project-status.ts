import { z } from "zod";
import { updateProjectIssueStatusByContentId } from "../src/github/project.js";

const envSchema = z.object({
  GITHUB_OWNER: z.string().min(1),
  GITHUB_PROJECT_NUMBER: z.coerce.number().int().positive(),
  ISSUE_NODE_ID: z.string().min(1),
  ISSUE_ACTION: z.enum(["closed", "reopened"]),
  GITHUB_TOKEN: z.string().min(1).optional(),
  GH_TOKEN: z.string().min(1).optional(),
});

function getStatusFromAction(action: "closed" | "reopened"): "Done" | "To Watch" {
  return action === "closed" ? "Done" : "To Watch";
}

async function main(): Promise<void> {
  const env = envSchema.parse(process.env);
  const githubToken = env.GITHUB_TOKEN ?? env.GH_TOKEN;

  if (!githubToken) {
    throw new Error("Set GITHUB_TOKEN or GH_TOKEN before running sync:project");
  }

  const updated = await updateProjectIssueStatusByContentId(
    githubToken,
    env.GITHUB_OWNER,
    env.GITHUB_PROJECT_NUMBER,
    env.ISSUE_NODE_ID,
    getStatusFromAction(env.ISSUE_ACTION),
  );

  console.log(
    updated
      ? "Project item status updated successfully."
      : "No matching Project V2 item was found for the issue.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
