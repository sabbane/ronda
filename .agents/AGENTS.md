# Git and Deployment Rules
- NEVER execute `git commit` or `git push` autonomously.
- You are strictly FORBIDDEN from staging changes or pushing to remote repositories unless explicitly commanded by the user in the chat.
- Always ask for permission before modifying the git index.

# Development Rules
- When editing code, assume the user is using VS Code.
- Use semantically correct brace and bracket placement (like VS Code does naturally).
- Do NOT "compact" code by removing newlines between logical blocks unless the user explicitly asks for minification.

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
- Always summarize the results of any local or E2E test executions in a clean, structured Markdown table.
- The table must contain the following columns:
  * **Test File / Test Name**: The name or path of the test suite.
  * **Status**: E.g., `✅ Passed`, `❌ Failed`, or `⚠️ Skipped`.
  * **Duration**: The time taken to execute the test.
  * **Details / Notes**: Any relevant failure details, logs, or diagnostic notes.
- Do not just output raw terminal logs when presenting test results; always format the final summary as a table.
