import "dotenv/config";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password.js";
import { createInterface } from "node:readline";

/**
 * CLI tool to create an administrator account from the shell.
 *
 * Usage (npm run admin:create -- [options]):
 *   --email  -e  Administrator email           (required)
 *   --name   -n  Display name                  (required)
 *   --password -p Password (>= 12 chars)       (else ADMIN_CREATE_PASSWORD or prompt)
 *   --role   -r  ADMIN | OWNER                 (default: ADMIN)
 *   --force-password-change                    user must change password on first login
 *
 * Examples:
 *   npm run admin:create -- -e staff@mithrabyte.com -n "Staff" --password "a-strong-password"
 *   ADMIN_CREATE_PASSWORD='...' npm run admin:create -- -e seller@mithrabyte.com -n "Seller" --role OWNER
 *
 * Idempotency: refuses to overwrite an account that already exists.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[i + 1];
    if (arg === "--email" || arg === "-e") opts.email = next(), i += 1;
    else if (arg === "--name" || arg === "-n") opts.name = next(), i += 1;
    else if (arg === "--password" || arg === "-p") opts.password = next(), i += 1;
    else if (arg === "--role" || arg === "-r") opts.role = next(), i += 1;
    else if (arg === "--force-password-change") opts.mustChangePassword = true;
    else if (arg === "--help" || arg === "-h") { printUsage(); process.exit(0); }
  }
  return opts;
}

function printUsage() {
  process.stdout.write(`Create an administrator account.

Usage:
  npm run admin:create -- --email <email> --name "<name>" [options]

Options:
  -e, --email <email>            Administrator email (required)
  -n, --name <name>              Display name (required)
  -p, --password <password>      Password, min 12 chars. Defaults to the
                                 ADMIN_CREATE_PASSWORD env var, then to an
                                 interactive prompt. Prefer these over an
                                 on-command-line password for security.
  -r, --role ADMIN|OWNER         Role (default: ADMIN)
      --force-password-change    Force the user to change the password at
                                 first login (sets mustChangePassword).
  -h, --help                     Show this help.

The command exits with an error if the email is already registered.
`);
}

function promptPassword() {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Password (min 12 chars): ", (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  let password = opts.password || process.env.ADMIN_CREATE_PASSWORD || "";
  if (!password && process.stdin.isTTY) {
    password = await promptPassword();
  }

  const adminCreateSchema = z.object({
    email: z.string().trim().email().max(190),
    name: z.string().trim().min(1).max(120),
    password: z.string().min(12).max(256),
    role: z.enum(["ADMIN", "OWNER"]).optional(),
  });
  const data = adminCreateSchema.parse({
    email: opts.email ?? undefined,
    name: opts.name ?? undefined,
    password: password || undefined,
    role: opts.role ?? undefined,
  });

  const email = data.email.toLowerCase().trim();
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.error(`[admin:create] Administrator "${email}" already exists. Nothing changed.`);
    process.exit(1);
  }

  const admin = await prisma.admin.create({
    data: {
      email,
      name: data.name,
      passwordHash: await hashPassword(data.password),
      role: data.role || "ADMIN",
      mustChangePassword: Boolean(opts.mustChangePassword),
    },
  });

  console.log(
    `[admin:create] Created "${admin.email}" (${admin.role}).` +
      (admin.mustChangePassword ? " Password change required on next login." : "")
  );
  if (!password && !process.env.ADMIN_CREATE_PASSWORD) {
    console.error("[admin:create] Warning: no ADMIN_CREATE_PASSWORD env var was set at runtime.");
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("[admin:create] Failed:", err.message || err);
  if (err.issues) {
    for (const issue of err.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
  }
  process.exit(1);
});