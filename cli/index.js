#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        choices: ['Neobrutalism', 'Glassmorphism', 'Whimsical', 'Professional', 'Other']
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

Please act as an expert software architect and prompt engineer. 
Take the "base technical requirement" above and rewrite it into a single, comprehensive, and improved prompt that I can give to an AI coding assistant. 
The new prompt should:
1. Integrate the project name, description, and style into the requirements.
2. Expand on the design style with specific Tailwind CSS suggestions relevant to "${selectedStyle}".
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
      console.log('='.repeat(50));
      console.log('GENERATED META-PROMPT:');
      console.log('='.repeat(50) + '\n');
      console.log(metaPrompt);
    } catch (error) {
      console.error(`\n❌ Error saving file to ${filePath}:`, error.message);
      console.log('\n' + '='.repeat(50));
      console.log('GENERATED META-PROMPT (Copy and paste this to an AI):');
      console.log('='.repeat(50) + '\n');
      console.log(metaPrompt);
      process.exit(1);
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
