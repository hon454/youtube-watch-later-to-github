import { z } from "zod";
import { resolveProjectContext } from "../src/github/project.js";

const envSchema = z.object({
  GITHUB_OWNER: z.string().min(1),
  GITHUB_PROJECT_NUMBER: z.coerce.number().int().positive(),
  GITHUB_TOKEN: z.string().min(1).optional(),
  GH_TOKEN: z.string().min(1).optional(),
});

async function main(): Promise<void> {
  const env = envSchema.parse(process.env);
  const token = env.GITHUB_TOKEN ?? env.GH_TOKEN;

  if (!token) {
    throw new Error("Set GITHUB_TOKEN or GH_TOKEN before running setup:project");
  }

  const context = await resolveProjectContext(
    token,
    env.GITHUB_OWNER,
    env.GITHUB_PROJECT_NUMBER,
  );

  console.log(
    JSON.stringify(
      {
        projectTitle: context.projectTitle,
        projectId: context.projectId,
        statusFieldId: context.statusFieldId,
        statusOptionIds: context.statusOptionIds,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
