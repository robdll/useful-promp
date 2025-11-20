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
6. The metaprompt is also displayed in the terminal for your reference

## Project Structure

```
ai-site-cli/
├── cli/
│   ├── index.js          # Main CLI script
│   ├── package.json      # Dependencies and configuration
│   └── node_modules/     # Installed dependencies
├── target/                # Generated metaprompt files (created automatically)
├── NextJs.startup.md     # Base prompt template
└── README.md             # This file
```

## Requirements

- Node.js (v14 or higher)
- npm
