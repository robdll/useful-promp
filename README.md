# Metaprompt CLI

A CLI tool to generate metaprompts for Next.js applications. This tool takes a base prompt template and customizes it with your project-specific details, design styles, and color palettes.

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
   - **Project name** - The name of your Next.js application
   - **Project description** - Goal, target audience, product/service
   - **Design style** - Choose from predefined styles or create a custom one
   - **Primary color** (optional) - Hex color code for your brand palette
3. It generates a customized metaprompt that combines:
   - The base template
   - Your project details
   - Style-specific Tailwind CSS implementation guides
   - Color palette with automatic secondary color calculation (using Golden Angle)
4. The generated metaprompt is **automatically saved** to a `.md` file in the `target/` folder
5. The filename format is: `{project-name}-{timestamp}.md` (e.g., `my-awesome-app-2024-11-20T18-30-45.md`)
6. You can optionally enhance the metaprompt using **Gemini AI** for a more comprehensive and polished version
7. If enhanced, an additional file is saved as `{project-name}-{timestamp}-enhanced.md`

## Design Styles

The CLI includes predefined design styles with detailed Tailwind CSS implementation guides:

- **Minimalist** - Clean and professional design with Inter font, slate/gray palette, subtle borders, and high whitespace
- **Neo-Brutalism** - Bold design with hard black borders, brutalist shadows, bold typography, and high-saturation accent colors
- **Glassmorphism** - Modern glass effect with dark mode backgrounds, semi-transparent components, and backdrop blur
- **Luxury** - Elegant design with serif fonts (e.g., Playfair Display), black/charcoal/gold palette, sharp corners
- **Playful** - Friendly and approachable with rounded corners, pastel colors, and soft shadows

You can also choose "Other" to provide your own custom style description.

## Color Palette Feature

When you provide a primary color (hex code), the CLI automatically:

- Calculates a complementary secondary color using the **Golden Angle** (137.5° rotation)
- Includes both colors in the metaprompt with Tailwind v4 CSS variable implementation instructions
- Displays a preview: `🎨 Palette: #3B82F6 | #F63B82`

If you skip the color input, the AI will choose appropriate colors based on your selected design style.

**Example:**
- Input: `#3B82F6` (blue)
- Output: Primary `#3B82F6` | Secondary `#F63B82` (calculated via Golden Angle)

## Gemini AI Enhancement (Optional)

After generating a metaprompt, you can choose to enhance it using Google's Gemini AI. The enhancement will:

- Make the prompt more comprehensive and detailed
- Add best practices for Next.js 15, React 19, and Tailwind v4
- Improve clarity and actionability
- Structure it as an optimized System Prompt for AI coding assistants
- Optimize it for use with AI coding assistants

The CLI automatically tries the latest Gemini models in order:
1. `gemini-3-pro-preview` (bleeding edge)
2. `gemini-2.5-pro` (stable high-intelligence)
3. `gemini-2.5-flash` (stable fast)
4. `gemini-1.5-pro` (fallback)
5. `gemini-1.5-flash` (fallback)

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
4. When running the CLI, you'll be asked if you want to enhance the prompt with Gemini (default: yes)

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

## Features

- ✅ **Customizable Design Styles** - Predefined styles with Tailwind CSS implementation guides
- ✅ **Color Palette Generation** - Automatic secondary color calculation using Golden Angle
- ✅ **Gemini AI Enhancement** - Optional AI-powered prompt optimization
- ✅ **Modern Tech Stack** - Optimized for Next.js 15, React 19, TypeScript, Tailwind v4
- ✅ **Auto-save** - All prompts automatically saved to `target/` folder
- ✅ **Markdown Output** - Ready-to-use prompts in Markdown format

## Requirements

- Node.js (v14 or higher)
- npm
- Gemini API key (optional, for enhancement feature)

## Example Workflow

1. Run `node index.js` (or `metaprompt` if installed globally)
2. Enter your project name: `My Awesome App`
3. Enter description: `A landing page for a SaaS product targeting small businesses`
4. Choose style: `Glassmorphism`
5. Enter primary color: `#3B82F6` (or press Enter to skip)
6. Review the generated basic prompt
7. Choose to enhance with Gemini (default: yes)
8. Get your optimized metaprompt ready to use with AI coding assistants!

## License

ISC
