# Contributing to Modman

Thank you for your interest in contributing to Modman! This project is designed to be a high-performance, interactive playground for the Mojo programming language.

## 📚 Contributing to the Curriculum

The curriculum is the heart of Modman. It consists of Markdown files located in the `curriculum/` directory.

### Adding a New Module

1.  **Create a File:** Create a new `.md` file in `curriculum/`.
2.  **Add Frontmatter:** Every file must start with a YAML frontmatter block:
    ```yaml
    ---
    id: 'unique-id'
    category: 'FOUNDATION' # Or 'PROJECT'
    title: '09. Your Title'
    subtitle: 'Catchy Subtitle'
    manual_link: 'https://docs.modular.com/mojo/manual/...'
    ---
    ```
3.  **Write Content:** Use Markdown for the lesson content.
4.  **Add Code Block:** Include exactly one `mojo` code block. This is the code that will appear in the editor:
    ```mojo
    def main():
        print("Your Mojo code here")
    ```

### Guidelines for Lessons
- **Standard Syntax:** Use modern Mojo standards (e.g., use `def` for functions).
- **Tone:** Keep it educational, technical, and concise.
- **Python Interop:** If using Python libraries, use `Python.evaluate()` for nested structures to ensure compatibility with Cloud Run.

---

## 💻 Contributing to the Codebase

### Development Environment

We use a `Makefile` to simplify common tasks.

1.  **Install Dependencies:**
    ```bash
    make install-deps
    ```
2.  **Run Locally (Hot Reload):**
    ```bash
    make dev
    ```
    This starts the Go backend and Vite frontend simultaneously.

### Project Structure

-   **`/frontend`**: React + TypeScript + Tailwind. The UI is designed to be terminal-inspired and highly responsive.
-   **`/backend`**: Go (Gin) + SQLite (GORM). Handles code execution, snippet sharing, and analytics.
-   **`/docker`**: Contains the `Dockerfile.mojo` used for the execution runner.

### Backend Development
- We use **SQLite** with **WAL mode** enabled for concurrency.
- For production-ready data, we support **Turso (LibSQL)**.
- Code execution is optimized via a persistent Mojo cache mounted into the containers.

### Frontend Development
- We prefer **Vanilla CSS** and **Tailwind** for styling.
- **Monaco Editor** is used for the code editing experience.
- Progress is persisted locally via `localStorage`.

---

## 🚀 Deployment & CI/CD

If you are contributing changes to the infrastructure:
-   Check the `Dockerfile.prod` which creates a unified high-performance Mojo + Go image.
-   Updates to the deployment workflow should be reflected in the `Makefile` and `docker-compose.yml`.

## 🤝 Pull Request Process

1.  Create a new branch for your feature or fix.
2.  Ensure your code follows the existing style and architecture.
3.  Test your changes locally using `make dev`.
4.  If adding a feature, please include a brief description of how to verify it.

**Happy Coding in Mojo! 🔥**
