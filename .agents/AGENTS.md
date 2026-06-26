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
- Focus on Bug Reproduction: Develop only the specific test case required to isolate and reproduce the reported issue or expected behavior.
- Run, Do Not Repair: Execute the newly written test to visually confirm and document the failure in the test logs (Red Phase).
- Strict Prohibition on Production Changes: Do not, under any circumstances, modify the production source code to fix the bug at this stage. The sole objective is to clearly identify the error, not to solve it.
- Halt and Report: Present the results of the test run (including the specific error message or stack trace) and stop there. Wait for explicit confirmation from the user before attempting any fixes.