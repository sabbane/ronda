# Git and Deployment Rules
- **Trunk-Based Development**: The `main` branch is the only long-lived branch. All development must occur on short-lived feature/topic branches created directly from `main`. The user handles merging MRs into `main`.
- **Autonomous Commits**: Proactively commit meaningful, completed logical work packages autonomously on feature branches. Do not ask for user permission to stage, commit, or create branches. Keep secrets in `.env` files (which must be gitignored).
- **Branch Creation & Naming**:
  - Always verify you are on a feature branch before committing. If on `main`, autonomously create and switch to a new feature branch: `git checkout -b <category>/<short-description>`.
  - Format branch names as `<category>/<short-description>`. The category must match the dominant change type, and the short description must use kebab-case in English (e.g., `feat/new-challenges`, `fix/schedule-update`, `chore/compose-cleanup`).
- **Conventional Commits**: Classify commits and branches using Conventional Commits:
  - `feat`: New functionality (new stack, service, feature)
  - `fix`: Bug fix
  - `refactor`: Structural rewrite without behavioral changes
  - `perf`: Performance improvement (runtime, build time)
  - `test`: Tests and test infrastructure
  - `docs`: Documentation (plans, comments, CLAUDE.md)
  - `build`: Build system and images (Dockerfiles, wrapper scripts, update scripts)
  - `ci`: CI pipeline automation
  - `style`: Formatting changes that do not affect semantics
  - `chore`: Maintenance and other miscellaneous tasks
- **Commit Messages**: Format messages as `<category>: <description>` (e.g., `docs: update documentation`). Commit messages should be written in English, in repository style, representing a logical unit of work.
- **Automatic Push & Merge Requests**:
  - Automatically push feature branches to the remote repository.
  - Once a task/feature is complete, autonomously open a GitLab Merge Request via GitLab push options:
    `git push -o merge_request.create -o merge_request.title="<category>: <description>" -o merge_request.description="<description>"`

# Version Release Rules
Whenever the user requests to create or bump a version (e.g., "Erstelle die Version 1.0.0-rc10", "release 1.0.0-rc10", or similar phrasing), you MUST strictly adhere to the following workflow:
1. **Dedicated Release Branch**: Create and switch to a separate branch named `release/<version>` directly from `main` (e.g., `git checkout -b release/1.0.0-rc10`).
2. **Bump Version**: Update the version in `package.json` and `package-lock.json` using `npm version <version> --no-git-tag-version`.
3. **Commit & Push**: Stage, commit with message `chore: bump version to <version>`, and push the branch to remote while creating a Merge Request:
   `git push -u origin release/<version> -o merge_request.create -o merge_request.title="chore: bump version to <version>" -o merge_request.description="Version release <version>"`
4. **Switch Back to Main**: Switch back to the `main` branch: `git checkout main`.



# Development Rules
- When editing code, assume the user is using VS Code.
- Use semantically correct brace and bracket placement (like VS Code does naturally).
- Do NOT "compact" code by removing newlines between logical blocks unless the user explicitly asks for minification.
- When the user requests to start the app ("starte die App" or similar), you must start both the frontend server (`npm run dev`) and the backend server (`npm run start:backend`).

 ## Test-Driven Bug Isolation Workflow
 Whenever the user issues the command "write a test" (or any similar phrasing), you must strictly adhere to the following rules:
- Focus on Bug Reproduction: Develop only the specific test case required to isolate and reproduce the reported issue. The test must assert the **desired, correct behavior** (not the buggy status quo), so that running it on the unmodified codebase naturally triggers an assertion failure.
- Run, Do Not Repair: Execute the newly written test to visually confirm and document the resulting failure in the test logs (Red Phase).

# Test Execution Rules
- NEVER run all local tests, the full test suite, or the `npm run test:local:isolated` command autonomously.
- You are strictly FORBIDDEN from executing the complete E2E test suite unless explicitly requested by the user in the chat.
- When validating bug fixes, only write/run the specific test file that targets the regression.

# React Component and Function Length Rules
- Keep React components and JavaScript functions modular. No single function or component body (e.g. `Splashscreen` or `Board`) should exceed **160 lines** of code.
- If a function starts approaching 150 lines, proactively extract sub-components, helper methods, or custom hooks (e.g., moving styles, preloading logic, or visual subsets into separate files or child components).
- Do not let layout structures and configurations clutter the main render function. Move static assets, mapping tables, or styling arrays outside of the component body or into dedicated utility modules.

# Test Execution Environment Prep Rules
- BEFORE running any local E2E tests, the agent MUST verify that the frontend and backend servers are running in test mode.
- If the servers are currently running in normal mode (or are not running at all), stop them and start them in test mode:
  * Backend: `npm run start:backend:test`
  * Frontend: `npm run dev:test`
- Only run the E2E tests (such as `npm run test:local:isolated`) once both servers are confirmed to be up and running in test mode.
- After completing test validation, if requested by the user, remember to return the servers back to normal mode.

# Test Reporting Rules
- Always summarize the results of any local or E2E test executions in a clean, structured Markdown table directly within the chat response to the user.
- Under no circumstances should this table be omitted or delegated only to files/walkthroughs; it must be visible in the final message.
- The table must contain the following columns:
  * **Test File / Test Name**: The name or path of the test suite.
  * **Status**: E.g., `✅ Passed`, `❌ Failed`, or `⚠️ Skipped`.
  * **Duration**: The time taken to execute the test.
  * **Details / Notes**: Any relevant failure details, logs, or diagnostic notes.
- Do not just output raw terminal logs when presenting test results; always format the final summary as a table.