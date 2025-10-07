## Project Overview

This project is a knowledge base focused on control theory, AI, and related mathematical and physical concepts. It is built as a static website using [Eleventy](https://www.11ty.dev/), a static site generator. The content is written in Markdown and is primarily in Chinese.

The knowledge base is structured as a network of interconnected notes, using wikilinks (`[[link]]`) to create relationships between different topics. This creates a "digital garden" where users can explore the connections between different concepts.

The site uses several Eleventy plugins and custom configurations to process the Markdown content, including:
- `markdown-it` with plugins for LaTeX, PlantUML diagrams, footnotes, and other features.
- Custom filters and transforms to handle wikilinks, tags, and callout blocks.
- `sharp` for image optimization.
- `sass` for CSS preprocessing.

## Building and Running

### Prerequisites

- [Node.js](https://nodejs.org/) (version specified in `.nvmrc` if available, otherwise a recent LTS version)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1.  Clone the repository.
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Development

To start the development server with live reloading:

```bash
npm start
```

This will start a local server, and the site will be accessible at `http://localhost:8080` by default. The command also watches for changes in the source files and automatically rebuilds the site.

### Production Build

To build the site for production:

```bash
npm run build
```

This will generate the static files in the `dist` directory. This directory can then be deployed to any static hosting service.

## Development Conventions

### Content Creation

-   Content is written in Markdown files located in `src/site/notes`.
-   Internal links between notes should be created using the wikilink format: `[[link-to-note]]`.
-   Tags can be added to notes using the `#tag` syntax.
-   The project uses a custom callout block syntax, for example:
    ```markdown
    > [!info]
    > This is an informational callout.
    >
    > [!warning]
    > This is a warning callout.
    ```
-   Mathematical formulas are rendered using LaTeX syntax, enclosed in `$` for inline math and `$$` for block math.
-   Diagrams can be created using [PlantUML](https://plantuml.com/) syntax within ` ```plantuml ` code blocks.

### Styling

-   The project uses [Sass](https://sass-lang.com/) for styling.
-   The main Sass files are located in `src/site/styles`.
-   The compiled CSS files are output to `dist/styles`.

### Project Structure

-   `src/site`: Contains the source files for the website.
    -   `_data`: Contains global data files for Eleventy.
    -   `_includes`: Contains layouts and reusable components.
    -   `notes`: Contains the Markdown files for the knowledge base.
    -   `styles`: Contains the Sass files for styling.
-   `dist`: Contains the generated static files for the website.
-   `.eleventy.js`: The main configuration file for Eleventy.
-   `package.json`: Defines the project's dependencies and scripts.
