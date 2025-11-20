# Metaprompt CLI

A CLI tool to generate metaprompts for Next.js applications. This tool takes a base prompt template and customizes it with your project-specific details.

## Installation

1. Navigate to the `cli` directory:
```bash
cd cli
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Run locally

From the `cli` directory:
```bash
node index.js
```

Or make it executable and run directly:
```bash
chmod +x index.js
./index.js
```

### Install globally (optional)

To use the `metaprompt` command from anywhere:

```bash
cd cli
npm link
```

Then you can run:
```bash
metaprompt
```

## How it works

1. The CLI reads the base prompt template from `NextJs.startup.md`
2. It asks you a series of questions:
   - Project name
   - Project description
   - Design style (Neobrutalism, Glassmorphism, Whimsical, Professional, or Other)
3. It generates a customized metaprompt that combines the base template with your answers
4. The generated metaprompt is **automatically saved** to a `.md` file in the `target/` folder
5. The filename format is: `{project-name}-{timestamp}.md` (e.g., `my-awesome-app-2024-11-20T18-30-45.md`)
6. You can optionally enhance the metaprompt using **Gemini AI** for a more comprehensive and polished version
7. If enhanced, an additional file is saved as `{project-name}-{timestamp}-enhanced.md`
8. The metaprompt(s) are displayed in the terminal for your reference

## Gemini AI Enhancement (Optional)

After generating a metaprompt, you can choose to enhance it using Google's Gemini AI. This will:
- Make the prompt more comprehensive and detailed
- Add best practices for Next.js, TypeScript, and Tailwind CSS
- Improve clarity and actionability
- Optimize it for use with AI coding assistants

### Setup

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `.env` file in the project root directory:
   ```bash
   cp .env.example .env
   ```
3. Edit the `.env` file and add your API key:
   ```
   GEMINI_API_KEY=your-actual-api-key-here
   ```
4. When running the CLI, you'll be asked if you want to enhance the prompt with Gemini

**Note:** The `.env` file is automatically ignored by git (already in `.gitignore`) to keep your API key secure.

## Project Structure

```
ai-site-cli/
├── cli/
│   ├── index.js          # Main CLI script
│   ├── package.json      # Dependencies and configuration
│   └── node_modules/     # Installed dependencies
├── target/                # Generated metaprompt files (created automatically)
├── .env                   # Your API keys (create from .env.example)
├── .env.example           # Example environment file
├── NextJs.startup.md     # Base prompt template
└── README.md             # This file
```

## Requirements

- Node.js (v14 or higher)
- npm
- Gemini API key (optional, for enhancement feature)
