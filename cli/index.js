#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Configuration paths
const BASE_PROMPT_PATH = path.join(__dirname, '..', 'NextJs.startup.md');
const TARGET_DIR = path.join(__dirname, '..', 'target');

// --- HELPERS ---

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function calculateSecondaryColor(hexInput, degrees = 137.5) {
  let hex = hexInput.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  let hDegrees = h * 360;
  hDegrees = (hDegrees + degrees) % 360;
  h = hDegrees / 360;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  const rFinal = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const gFinal = Math.round(hue2rgb(p, q, h) * 255);
  const bFinal = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rFinal)}${toHex(gFinal)}${toHex(bFinal)}`;
}

// --- CONTENT ---

const stylePrompts = {
  'Minimalist': 'Design should be clean and professional. Use "Inter" font, slate/gray color palette, subtle borders, and small border-radius. Focus on high whitespace and readability.',
  'Neo-Brutalism': 'Design should use "Neo-Brutalism" trends. Use hard black borders (border-2 border-black), brutalist shadows (shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]), bold typography, and high-saturation accent colors. No gradients.',
  'Glassmorphism': 'Design should use "Glassmorphism". Dark mode background with deep gradients. UI components should use semi-transparent white backgrounds with backdrop-blur-md and thin white borders.',
  'Luxury': 'Design should be elegant. Use a Serif font for headings (e.g., Playfair Display). Palette: Black, Charcoal, Gold/Cream. Sharp corners (rounded-none), generous padding, minimalist borders.',
  'Playful': 'Design should be friendly and approachable. Use rounded-2xl or rounded-3xl for cards/buttons. Pastel color palette. Soft, diffuse shadows. Sans-serif rounded fonts.'
};

// --- CORE LOGIC ---

async function enhanceWithGemini(metaPrompt, originalFilePath) {
  // CONFIGURATION: Prioritize newest models
  const modelsToTry = [
    'gemini-3-pro-preview', // 🚀 Bleeding edge
    'gemini-2.5-pro',       // 🧠 Stable high-intelligence
    'gemini-2.5-flash',     // ⚡ Stable fast
    'gemini-1.5-pro',       // Fallback
    'gemini-1.5-flash'      // Fallback
  ];

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('\n❌ GEMINI_API_KEY is not set.');
    console.log('Please add GEMINI_API_KEY to your .env file.');
    return;
  }

  console.log('\n🤖 Enhancing metaprompt with Gemini AI...');
  
  const spinner = ['|', '/', '-', '\\'];
  let i = 0;
  let loader = null;
  
  try {
    loader = setInterval(() => {
      process.stdout.write(`\r${spinner[i++ % spinner.length]} Processing...`);
    }, 100);

    const systemInstruction = `
    You are an expert LLM Prompt Engineer and Technical Architect.
    YOUR GOAL: Rewrite the input text into a highly optimized "System Prompt" for an AI Coding Assistant.
    
    GUIDELINES:
    1. Output ONLY Markdown.
    2. Do NOT generate code for the app itself. Generate the *instructions* for the app.
    3. Enforce Next.js 15 (App Router), React 19, and Tailwind v4.
    4. Respect the user's Project Name, Description, and Style choice.
    `;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    let enhancedPrompt = null;
    let lastError = null;
    let usedModel = null;
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: {
            role: "system",
            parts: [{ text: systemInstruction }]
          }
        });

        const result = await model.generateContent(metaPrompt);
        const response = await result.response;
        enhancedPrompt = response.text();
        usedModel = modelName;
        break; 
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    if (loader) {
      clearInterval(loader);
      process.stdout.write('\r');
    }

    if (!enhancedPrompt) {
      throw new Error(`Failed to generate. Last error: ${lastError?.message}`);
    }

    console.log(`\n⚡ Success! Generated using model: ${usedModel}`);

    const enhancedFilePath = originalFilePath.replace('.md', '-enhanced.md');
    fs.writeFileSync(enhancedFilePath, enhancedPrompt.trim(), 'utf-8');

    console.log('\n' + '='.repeat(50));
    console.log('✅ ENHANCED META-PROMPT GENERATED!');
    console.log(`\n📄 File saved to: ${enhancedFilePath}\n`);

  } catch (error) {
    if (loader) {
      clearInterval(loader);
      process.stdout.write('\r');
    }
    console.error('\n❌ Error enhancing with Gemini:', error.message);
    console.log('\nHere is your basic prompt (un-enhanced):\n');
    console.log(metaPrompt);
  }
}

async function main() {
  try {
    let basePrompt = '';
    try {
      basePrompt = fs.readFileSync(BASE_PROMPT_PATH, 'utf-8');
    } catch (error) {
      console.error(`Error reading base prompt file at ${BASE_PROMPT_PATH}:`, error.message);
      process.exit(1);
    }

    console.log('Welcome to the Prompt Generator!');
    console.log('Please answer the following questions to customize your Next.js app prompt.\n');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of your project?',
        validate: (input) => input ? true : 'Project name cannot be empty.'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Provide a short description:',
        validate: (input) => input ? true : 'Description cannot be empty.'
      },
      {
        type: 'rawlist',
        name: 'style',
        message: 'Choose a design style:',
        choices: ['Minimalist', 'Neo-Brutalism', 'Glassmorphism', 'Luxury', 'Playful', 'Other']
      },
      {
        type: 'input',
        name: 'otherStyle',
        message: 'Please describe the "Other" style:',
        when: (answers) => answers.style === 'Other',
        validate: (input) => input ? true : 'Style description cannot be empty.'
      },
      {
        type: 'input',
        name: 'primaryColor',
        message: 'Enter a primary Hex color (e.g. #3B82F6) or press Enter to skip:',
        validate: (input) => {
          if (!input) return true; 
          return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(input) || 'Invalid Hex color';
        }
      }
    ]);

    const selectedStyle = answers.style === 'Other' ? answers.otherStyle : answers.style;
    const styleInstruction = stylePrompts[answers.style] || answers.otherStyle || selectedStyle;

    // Color Logic
    let colorInstructions = "Decide on a professional color palette fitting the design style.";
    if (answers.primaryColor) {
      const primary = answers.primaryColor.startsWith('#') ? answers.primaryColor : `#${answers.primaryColor}`;
      const secondary = calculateSecondaryColor(primary, 137.5);
      
      colorInstructions = `
      - **Primary Color**: ${primary}
      - **Secondary Color**: ${secondary} (Calculated via Golden Angle)
      - **Requirement**: Define these as CSS variables and map them in Tailwind v4 configuration.
      `;
      console.log(`\n🎨 Palette: ${primary} | ${secondary}`);
    }

    const metaPrompt = `
I want to build a Next.js application. 

Here is the base technical requirement:
---
${basePrompt.trim()}
---

Specific Project Details:
- **Project Name**: ${answers.projectName}
- **Description**: ${answers.description}
- **Design Style**: ${selectedStyle}
- **Style Guide**: ${styleInstruction}

## Color Palette
${colorInstructions}

INSTRUCTIONS FOR THE AI:
Please act as an expert software architect. Rewrite the above into a comprehensive System Prompt for an AI Coding Assistant.
1. Integrate project details.
2. Expand on styling with Tailwind v4 best practices.
3. Keep technical constraints (Next.js 15, TypeScript).
`;

    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const sanitizedName = sanitizeFilename(answers.projectName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${sanitizedName}-${timestamp}.md`;
    const filePath = path.join(TARGET_DIR, filename);

    fs.writeFileSync(filePath, metaPrompt.trim(), 'utf-8');
    console.log(`\n📄 Saved basic prompt to: ${filePath}\n`);

    const enhanceAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enhance',
        message: 'Would you like to enhance this metaprompt using Gemini AI?',
        default: true
      }
    ]);

    if (enhanceAnswer.enhance) {
      await enhanceWithGemini(metaPrompt, filePath);
    }

  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('\nOperation cancelled.');
      process.exit(0);
    }
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

main();