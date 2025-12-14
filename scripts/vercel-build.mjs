import { fileURLToPath } from "url";
import { dirname } from "path";
import { promises as fs } from "fs";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Starting Vercel build...");

// 1. Build the widget
try {
  console.log("Building widget...");
  execSync("npm run build:widget", { stdio: "inherit" });

  // 2. Copy widget-demo.html to dist-widget/index.html
  console.log("Copying files...");
  await fs.copyFile("widget-demo.html", "dist-widget/index.html");

  // 3. Create dist-widget directory if it doesn't exist
  try {
    await fs.mkdir("dist-widget", { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  // 4. Copy public directory if it exists
  try {
    await fs.access("public");
    console.log("Copying public directory...");
    await copyDir("public", "dist-widget/public");
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  console.log("Build completed successfully!");
  process.exit(0);
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}

// Helper function to copy directories recursively
async function copyDir(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = `${src}/${entry.name}`;
    const destPath = `${dest}/${entry.name}`;

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}
