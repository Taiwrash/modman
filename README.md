# Mojo Playground

A web-based playground for the Mojo programming language, built with Go, React, and Docker.

## Features
- **Monaco Editor**: High-quality code editing with syntax highlighting.
- **Sandboxed Execution**: Code runs inside isolated Docker containers with resource limits.
- **Snippet Sharing**: Share your code snippets via unique URLs.

## Prerequisites
- [Docker](https://www.docker.com/)
- [Go 1.22+](https://go.dev/)
- [Node.js 18+](https://nodejs.org/)
- [Modular Auth Key](https://developer.modular.com/console) (Required for the Mojo SDK)

## Setup

### 1. Build the Mojo Sandbox
The sandbox uses the public Mojo nightly builds via `uv`. No API key is required for this step!
```bash
docker build -t mojo-runner -f docker/Dockerfile.mojo .
```

### 2. Start the Backend
```bash
cd backend
go run main.go
```
The API will start on `http://localhost:8080`.

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The playground will be available at `http://localhost:5173`.

## modman CLI

The `modman` CLI allows you to interact with the playground from your terminal.

### Installation
```bash
cd cli
go build -o modman
mv modman /usr/local/bin/ # optional
```

### Usage
- **Run a local file remotely**: `modman run hello.mojo`
- **Share a local file**: `modman share hello.mojo`
- **Ask AI to fix a file**: `modman fix hello.mojo "compilation error message"`

## Project Structure
- `backend/`: Go (Gin) API for execution and storage.
- `frontend/`: React + Tailwind CSS + Monaco Editor.
- `docker/`: Dockerfile for the Mojo execution environment.

## Contributing

We welcome contributions to the curriculum! 

### Adding a New Lesson
1. Navigate to the `/curriculum` directory in the project root.
2. Duplicate `starter-template.md`.
3. Fill in the metadata (YAML frontmatter) and the content.
4. Add your Mojo code within the ` ```mojo ` block.
5. Submit a Pull Request!

Lessons are automatically loaded by the frontend. Ensure your code follows the latest **Mojo 1.0 (2026)** syntax:
- Use `def` for all functions.
- Use `var` for all variable declarations (`let` is removed).
- Add `raises` to functions that can throw errors.

## License
MIT
