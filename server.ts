import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import AdmZip from "adm-zip";
import { execSync } from "child_process";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with a high limit for base64 images
app.use(express.json({ limit: "20mb" }));

// Lazy initializer for Google GenAI client to avoid crash if API Key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/**
 * Scan Product using Gemini Vision
 * Analyzes an uploaded/captured base64 image (can be barcode or product label).
 */
app.post("/api/scan-product", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", targetCountry = "Japan", homeCurrency = "USD" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing required field: imageBase64" });
    }

    const ai = getAiClient();

    // Prepare content parts
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    };

    const textPart = {
      text: `Analyze this traveler-scanned product image. 
Identify the product name, brand, any visible barcodes (even if they are blurry or angled), and estimate its retail price in the local currency of ${targetCountry}. 
Also provide a concise description of what the product is (translated to English if the label is foreign), listing any important ingredients/warnings, and giving helpful cultural advice or savings tips for travelers buying this in ${targetCountry}.

You MUST return a JSON object with the following fields:
{
  "productName": "string (the brand/product name, clear and readable)",
  "brand": "string (brand name)",
  "barcode": "string (the numeric barcode sequence found on the label/barcode section, or null if absolutely not visible)",
  "estimatedLocalPrice": "number (a realistic average price for this item in ${targetCountry}'s local currency, e.g. 150 for 150 JPY, or 2.50 for 2.50 EUR)",
  "currency": "string (the official 3-letter currency code of ${targetCountry}, e.g. JPY, EUR, THB, USD)",
  "category": "string (must be one of: Food, Beverage, Essentials, Electronics, or Other)",
  "description": "string (a concise, helpful traveler guide: explain what the product is, translate foreign ingredients/allergies, and provide useful tips for visiting supermarkets)",
  "isTrusted": "boolean (whether this product matches common safe retail brands)",
  "confidenceScore": "number (0-100 scan confidence rating)"
}`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);

  } catch (error: any) {
    console.error("Error scanning product:", error);
    res.status(500).json({ 
      error: "Failed to scan product", 
      details: error.message || error 
    });
  }
});

/**
 * Translate instant Text or Sign from image
 */
app.post("/api/translate", async (req, res) => {
  try {
    const { text, imageBase64, mimeType = "image/jpeg", targetLanguage = "English" } = req.body;

    const ai = getAiClient();

    let parts: any[] = [];

    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      });
    }

    const promptText = text 
      ? `Translate the following text into ${targetLanguage} and provide interesting cultural notes or usage guidelines if applicable: "${text}"`
      : `Scan this travel image (e.g. food packaging, restaurant menu, subway warning sign, or directory). Translate all visible foreign texts into ${targetLanguage} precisely. Organize the translations logically, showing original text if helpful, and add useful local context.`;

    parts.push({ text: promptText });

    const instruction = `Translate travel items clearly. 
You MUST return a JSON object with this exact structure:
{
  "originalText": "string (the captured original text, or a brief summary of the original visual content)",
  "translatedText": "string (the clean, beautifully structured translation into ${targetLanguage})",
  "detectedLanguage": "string (the language detected, e.g., Japanese, Italian, Thai)",
  "contextNotes": "string (any helpful advice, cultural context, dietary or safety warnings for travelers)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction: instruction,
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);

  } catch (error: any) {
    console.error("Error translating:", error);
    res.status(500).json({ 
      error: "Translation failed", 
      details: error.message || error 
    });
  }
});

/**
 * Dynamic Project ZIP Downloader for UI-restricted environments
 * Packages all source files, configurations, and Android native files,
 * while excluding heavy build artifacts like node_modules and .gradle build outputs.
 */
app.get("/api/download-project-zip", (req, res) => {
  try {
    const zip = new AdmZip();
    const rootDir = process.cwd();

    function addFilesToZip(currentDir: string, zipPathPrefix = "") {
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        // Exclude heavy dependencies and build-generated directories
        if (
          entry === "node_modules" ||
          entry === "dist" ||
          entry === ".git" ||
          entry === ".github" ||
          entry === "server.js" ||
          entry === ".gradle" ||
          entry === "build" ||
          entry === "release" ||
          entry === "bin" ||
          entry === "obj"
        ) {
          continue;
        }
        
        const fullPath = path.join(currentDir, entry);
        const zipPath = zipPathPrefix ? `${zipPathPrefix}/${entry}` : entry;
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          addFilesToZip(fullPath, zipPath);
        } else {
          // Skip zip files to prevent circular nesting
          if (entry.endsWith(".zip")) continue;
          zip.addFile(zipPath, fs.readFileSync(fullPath));
        }
      }
    }

    addFilesToZip(rootDir);
    const buffer = zip.toBuffer();

    res.set("Content-Type", "application/zip");
    res.set("Content-Disposition", "attachment; filename=nomi-project.zip");
    res.send(buffer);
  } catch (error: any) {
    console.error("Error creating project zip:", error);
    res.status(500).json({ error: "Failed to generate project ZIP", details: error.message });
  }
});

/**
 * Direct GitHub Push Sync for UI-restricted / Mobile-only developers.
 * Receives the target GitHub Repository URL and a Personal Access Token (PAT),
 * registers a temporary authenticated remote origin, stages, commits,
 * and pushes the codebase directly to GitHub.
 */
app.post("/api/github-push", (req, res) => {
  const logs: string[] = [];
  let maskedToken = "";
  let base64Token = "";
  
  try {
    const { repoUrl, token } = req.body;

    if (!repoUrl || !token) {
      return res.status(400).json({ error: "Both repoUrl and token are required" });
    }

    // Sanitize repoUrl: strip whitespace and any invalid URL/unicode characters (like copy-paste artifacts)
    let cleanUrl = repoUrl.trim().replace(/[^\w\-./:]/g, "");
    if (cleanUrl.endsWith(".git")) {
      cleanUrl = cleanUrl.slice(0, -4);
    }

    let cleanRepoUrl = cleanUrl;
    if (!cleanRepoUrl.startsWith("https://") && !cleanRepoUrl.startsWith("http://")) {
      cleanRepoUrl = "https://" + cleanRepoUrl;
    }
    const publicRepoUrl = cleanRepoUrl + ".git";

    // Sanitize token: strip spaces and any non-token characters
    const cleanToken = token.trim().replace(/[^\w_]/g, "");
    maskedToken = cleanToken; // save reference for masking in logs
    
    // Construct the authenticated URL with the PAT embedded as the password using x-access-token
    let authRepoUrl = "";
    if (cleanRepoUrl.startsWith("https://github.com/")) {
      authRepoUrl = cleanRepoUrl.replace("https://github.com/", `https://x-access-token:${cleanToken}@github.com/`);
    } else if (cleanRepoUrl.startsWith("http://github.com/")) {
      authRepoUrl = cleanRepoUrl.replace("http://github.com/", `https://x-access-token:${cleanToken}@github.com/`);
    } else {
      authRepoUrl = `https://x-access-token:${cleanToken}@github.com/${cleanRepoUrl.replace(/^https?:\/\//, "")}`;
    }
    authRepoUrl += ".git";

    const runGitCommand = (cmd: string) => {
      // Create a display-safe version of the command where token is masked
      let displayCmd = cmd;
      if (cleanToken && displayCmd.includes(cleanToken)) {
        displayCmd = displayCmd.replace(new RegExp(cleanToken, "g"), "****");
      }
      logs.push(`$ ${displayCmd}`);

      try {
        const out = execSync(cmd, { 
          stdio: "pipe",
          env: {
            ...process.env,
            GIT_TERMINAL_PROMPT: "0" // Prevent git from prompting for password interactively
          }
        }).toString();
        if (out) logs.push(out);
      } catch (err: any) {
        const stderr = err.stderr ? err.stderr.toString() : "";
        const stdout = err.stdout ? err.stdout.toString() : "";
        
        let cleanStderr = stderr;
        let cleanStdout = stdout;
        let cleanErrMsg = err.message;

        if (cleanToken) {
          const tokenRegex = new RegExp(cleanToken, "g");
          cleanStderr = cleanStderr.replace(tokenRegex, "****");
          cleanStdout = cleanStdout.replace(tokenRegex, "****");
          cleanErrMsg = cleanErrMsg.replace(tokenRegex, "****");
        }

        logs.push(`Error running command: ${displayCmd}`);
        if (cleanStdout) logs.push(`stdout: ${cleanStdout}`);
        if (cleanStderr) logs.push(`stderr: ${cleanStderr}`);

        const throwErr = new Error(`Git command failed: ${displayCmd}. Stderr: ${cleanStderr || cleanErrMsg}`);
        (throwErr as any).logs = logs;
        throw throwErr;
      }
    };

    logs.push("Starting GitHub cloud upload workflow...");

    // 1. Initialize Git repository if not present
    if (!fs.existsSync(path.join(process.cwd(), ".git"))) {
      runGitCommand("git init");
    }

    // 2. Configure local identity
    runGitCommand('git config user.name "Nomi Mobile Builder"');
    runGitCommand('git config user.email "bbbj929@gmail.com"');

    // 3. Stage all files
    runGitCommand("git add .");

    // 4. Create Commit
    try {
      runGitCommand('git commit -m "Deploy Nomi v1.0 source to GitHub (Cloud Push)"');
    } catch (e: any) {
      logs.push("Note: Codebase has no changes to commit.");
    }

    // 5. Ensure branch name is main
    runGitCommand("git branch -M main");

    // 6. Check if remote origin already exists
    let originExists = false;
    try {
      const remotes = execSync("git remote", { stdio: "pipe" }).toString();
      if (remotes.includes("origin")) {
        originExists = true;
      }
    } catch (e) {
      // Ignored
    }

    const safeAuthUrl = authRepoUrl.replace(/'/g, "'\\''");
    const safePublicUrl = publicRepoUrl.replace(/'/g, "'\\''");

    if (originExists) {
      logs.push("Updating origin remote URL with secure credentials...");
      runGitCommand(`git remote set-url origin '${safeAuthUrl}'`);
    } else {
      logs.push("Adding origin remote URL with secure credentials...");
      runGitCommand(`git remote add origin '${safeAuthUrl}'`);
    }

    // 7. Force push to remote main branch with proper syntax
    logs.push("Pushing complete assets securely to GitHub main branch...");
    runGitCommand("git push -u origin main --force");

    logs.push("Successfully pushed entire source code to your GitHub repository! 🎉");

    // 8. Clean up local remote config back to public URL so the PAT is never stored persistently
    try {
      execSync(`git remote set-url origin '${safePublicUrl}'`, { stdio: "ignore" });
      logs.push("Securely cleared git credentials from remote origin URL.");
    } catch (e) {
      // Ignored
    }

    res.json({ success: true, logs });

  } catch (error: any) {
    console.error("GitHub Push error:", error);
    
    // Clean up local config on failure as well to ensure PAT is cleared
    try {
      const { repoUrl } = req.body;
      if (repoUrl) {
        let cleanUrl = repoUrl.trim().replace(/[^\w\-./:]/g, "");
        if (cleanUrl.endsWith(".git")) cleanUrl = cleanUrl.slice(0, -4);
        if (!cleanUrl.startsWith("https://") && !cleanUrl.startsWith("http://")) {
          cleanUrl = "https://" + cleanUrl;
        }
        cleanUrl += ".git";
        execSync(`git remote set-url origin '${cleanUrl.replace(/'/g, "'\\''")}'`, { stdio: "ignore" });
      }
    } catch (e) {
      // Ignored
    }

    // Mask tokens if present in error message
    let finalDetails = error.message;
    if (maskedToken && finalDetails.includes(maskedToken)) {
      finalDetails = finalDetails.replace(new RegExp(maskedToken, "g"), "****");
    }

    res.status(500).json({ 
      error: "GitHub Push Failed", 
      details: finalDetails, 
      logs: error.logs || logs || [finalDetails] 
    });
  }
});

// -------------------------------------------------------------------------
// Vite Middleware / Production Static Asset Serving
// -------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Nomi Backend] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
