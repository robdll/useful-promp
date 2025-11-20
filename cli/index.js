#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root (one directory up from cli/)
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Path to the base prompt file
const BASE_PROMPT_PATH = path.join(__dirname, '..', 'NextJs.startup.md');
// Path to the target directory
const TARGET_DIR = path.join(__dirname, '..', 'target');

// Helper function to sanitize project name for filename
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Style prompts with detailed implementation guides
const stylePrompts = {
  'Minimalist': 'Design should be clean and professional. Use "Inter" font, slate/gray color palette, subtle borders, and small border-radius. Focus on high whitespace and readability.',
  'Neo-Brutalism': 'Design should use "Neo-Brutalism" trends. Use hard black borders (border-2 border-black), brutalist shadows (shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]), bold typography, and high-saturation accent colors. No gradients.',
  'Glassmorphism': 'Design should use "Glassmorphism". Dark mode background with deep gradients. UI components should use semi-transparent white backgrounds with backdrop-blur-md and thin white borders.',
  'Luxury': 'Design should be elegant. Use a Serif font for headings (e.g., Playfair Display). Palette: Black, Charcoal, Gold/Cream. Sharp corners (rounded-none), generous padding, minimalist borders.',
  'Playful': 'Design should be friendly and approachable. Use rounded-2xl or rounded-3xl for cards/buttons. Pastel color palette. Soft, diffuse shadows. Sans-serif rounded fonts.'
};

// Function to enhance metaprompt with Gemini
async function enhanceWithGemini(metaPrompt, originalFilePath) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('\n❌ GEMINI_API_KEY is not set.');
    console.log('\nTo use Gemini enhancement, please set your API key:');
    console.log('\nOption 1: Create a .env file in the project root:');
    console.log('  1. Copy .env.example to .env: cp .env.example .env');
    console.log('  2. Edit .env and add your API key');
    console.log('\nOption 2: Set as environment variable:');
    console.log('  export GEMINI_API_KEY="your-api-key-here"');
    console.log('\nYou can get your API key from: https://makersuite.google.com/app/apikey');
    console.log('\n' + '='.repeat(50));
    console.log('GENERATED META-PROMPT:');
    console.log('='.repeat(50) + '\n');
    console.log(metaPrompt);
    return;
  }

  console.log('\n🤖 Enhancing metaprompt with Gemini AI...');
  
  // Simple spinner animation
  const spinner = ['|', '/', '-', '\\'];
  let i = 0;
  let loader = null;
  
  try {
    loader = setInterval(() => {
      process.stdout.write(`\r${spinner[i++ % spinner.length]} Processing...`);
    }, 100);

    // We use a specific system instruction to ensure Gemini acts as a Prompt Engineer
    // and not the developer writing the code.
    const systemInstruction = `
    You are an expert LLM Prompt Engineer and Technical Architect.
    
    YOUR GOAL:
    Rewrite the input text into a highly optimized "System Prompt" for an AI Coding Assistant.
    
    GUIDELINES:
    1. The output must be a Markdown file.
    2. Do NOT generate the actual Next.js application code. Generate the *instructions* for creating it.
    3. Incorporate modern Best Practices (Next.js 15, React 19, Tailwind v4).
    4. Structure the prompt with clear sections: "Project Context", "Tech Stack", "File Structure", "Detailed Requirements", "Coding Standards".
    5. Maintain the specific user requirements (Project Name, Description, Style) provided in the input.
    
    RETURN ONLY THE MARKDOWN CONTENT. NO CONVERSATIONAL FILLER.
    `;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Configuration to reduce randomness and avoid safety blocks
    const generationConfig = {
      temperature: 0.7, // Balance between creativity and structure
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
    };

    // Safety settings to prevent false positives on technical content
    const safetySettings = [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ];

    // Prioritize 1.5 models (Flash is faster/cheaper, Pro is smarter)
    const modelsToTry = ['gemini-1.5-pro', 'gemini-1.5-flash'];
    
    let enhancedPrompt = null;
    let lastError = null;
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: {
            role: "system",
            parts: [{ text: systemInstruction }]
          }
        });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: metaPrompt }] }],
          generationConfig,
          safetySettings
        });

        const response = await result.response;
        enhancedPrompt = response.text();
        break; 
      } catch (error) {
        lastError = error;
        // Only continue if it's a 404 (model not found) or 503 (overloaded)
        if (error.message && (error.message.includes('404') || error.message.includes('503'))) {
          continue;
        }
        throw error;
      }
    }
    
    if (loader) {
      clearInterval(loader);
      process.stdout.write('\r'); // Clear spinner line
    }

    if (!enhancedPrompt) {
      throw new Error(`Failed to generate with models: ${modelsToTry.join(', ')}. Error: ${lastError?.message}`);
    }

    // Save enhanced version
    const enhancedFilePath = originalFilePath.replace('.md', '-enhanced.md');
    fs.writeFileSync(enhancedFilePath, enhancedPrompt.trim(), 'utf-8');

    console.log('\n' + '='.repeat(50));
    console.log('✅ ENHANCED META-PROMPT GENERATED!');
    console.log('='.repeat(50));
    console.log(`\n📄 Enhanced file saved to: ${enhancedFilePath}\n`);

  } catch (error) {
    if (loader) {
      clearInterval(loader);
      process.stdout.write('\r');
    }
    console.error('\n❌ Error enhancing with Gemini:', error.message);
    console.log('\n' + '='.repeat(50));
    console.log('GENERATED META-PROMPT (original):');
    console.log('='.repeat(50) + '\n');
    console.log(metaPrompt);
  }
}

async function main() {
  try {
    // Read the base prompt
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
        message: 'Provide a short description (goal, target audience, product/service):',
        validate: (input) => input ? true : 'Description cannot be empty.'
      },
      {
        type: 'list',
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
      }
    ]);

    const selectedStyle = answers.style === 'Other' ? answers.otherStyle : answers.style;
    const styleInstruction = stylePrompts[answers.style] || answers.otherStyle || selectedStyle;

    const metaPrompt = `
I want to build a Next.js application. 

Here is the base technical requirement:
---
${basePrompt.trim()}
---

Here are the specific details for my project that need to be incorporated and override any generic placeholders:

- **Project Name**: ${answers.projectName}
- **Description**: ${answers.description}
- **Design Style**: ${selectedStyle}
- **Style Implementation Guide**: ${styleInstruction}

Please act as an expert software architect and prompt engineer. 
Take the "base technical requirement" above and rewrite it into a single, comprehensive, and improved prompt that I can give to an AI coding assistant. 
The new prompt should:
1. Integrate the project name, description, and style into the requirements.
2. Apply the "Style Implementation Guide" above with specific Tailwind CSS classes and design patterns.
3. Keep all the technical constraints (Next.js, App Router, TypeScript, Tailwind 4+, Turbopack, component organization, etc.).
4. Improve the clarity and robustness of the instructions.
`;

    // Ensure target directory exists
    if (!fs.existsSync(TARGET_DIR)) {
      fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    // Generate filename from project name
    const sanitizedName = sanitizeFilename(answers.projectName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `${sanitizedName}-${timestamp}.md`;
    const filePath = path.join(TARGET_DIR, filename);

    // Write the metaprompt to file
    try {
      fs.writeFileSync(filePath, metaPrompt.trim(), 'utf-8');
      console.log('\n' + '='.repeat(50));
      console.log('✅ META-PROMPT GENERATED AND SAVED!');
      console.log('='.repeat(50));
      console.log(`\n📄 File saved to: ${filePath}\n`);
    } catch (error) {
      console.error(`\n❌ Error saving file to ${filePath}:`, error.message);
      console.log('\n' + '='.repeat(50));
      console.log('GENERATED META-PROMPT (Copy and paste this to an AI):');
      console.log('='.repeat(50) + '\n');
      console.log(metaPrompt);
      process.exit(1);
    }

    // Ask if user wants to enhance with Gemini
    const enhanceAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enhance',
        message: 'Would you like to enhance this metaprompt using Gemini AI?',
        default: false
      }
    ]);

    if (enhanceAnswer.enhance) {
      await enhanceWithGemini(metaPrompt, filePath);
    } else {
      console.log('\n' + '='.repeat(50));
      console.log('GENERATED META-PROMPT:');
      console.log('='.repeat(50) + '\n');
      console.log(metaPrompt);
    }

  } catch (error) {
    // Handle user cancellation gracefully
    if (error.name === 'ExitPromptError' || error.message?.includes('User force closed')) {
      console.log('\n\nOperation cancelled.');
      process.exit(0);
    }
    console.error('An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
