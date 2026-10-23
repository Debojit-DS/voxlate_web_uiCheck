import { promises as fs } from "node:fs";
import path from "node:path";

type LogEntry = Record<string, unknown>;

const LOG_DIR = path.resolve(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "auth.log");

async function ensureLogFile() {
  try {
    await fs.access(LOG_DIR);
  } catch {
    await fs.mkdir(LOG_DIR, { recursive: true });
  }

  try {
    await fs.access(LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, "", { flag: "wx" });
  }
}

export async function logAuth(entry: LogEntry) {
  const timestamp = new Date().toISOString();
  const line = JSON.stringify({ timestamp, ...entry });

  try {
    await ensureLogFile();
    await fs.appendFile(LOG_FILE, `${line}\n`, "utf8");
  } catch {
    // swallow log write errors to avoid breaking request flow
  }
}
