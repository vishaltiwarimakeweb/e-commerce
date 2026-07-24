<!-- Persistent instructions for the AI coding tool-->

# MANDATORY RULE :

- DO NOT CHANGE THIS FILE, THIS CAN ONLY BE CHANGED BY THE ADMIN.

# Approach Rules :

- Simplicity over cleverness.
- Readability over module abstraction.
- Follow a simple approach for tasks, avoid complex business logic until necessary.
- Don't build everything at once, finish one task a time.
- **Important** : Implement 3 phases at a time.

# Engineering Rules :

- Keep creating and updating the UI whenever needed and keep it modern & eye-catching.
- Write proper but brief comments over codes to explain what the below code does.
- Never rely on the previously trained information, always fetch the latest documentation to get the up-to-date data.
- Always use Typescript to ensure correct type assignments.
- In case of vague features requirements, ask for relevant details, never assume the parameters.
- Only change the relevant file for a task, don't touch any unrelated file.
- Don't over engineer, follow the principles of KISS ( Keep It Simple Stupid ) & YAGNI ( You Ain't Gonna Need It ) for every task.
- Keep the folder structure manageable, don't create too many modules for small tasks.
- Add dummy environment variables in the .env.example file, I'll provide the actual secret variables later.
- Avoid using any type as much as possible.
- Use RAG for memory based data-retreival.

# Security Rules :

- Never change the .env.local file, always change .env.example file for the envronment variables that are needed.
- Never expose the .env secrets.
- Never commit the .env.local file.

# Authentication Rules

- Guests and logged in users both can access the AI assistant.
- But guests cannot make the LLM call the tools that require user's schema's properties such as user's id, name, email etc.
- Guests can only make the LLM call those tools which don't require any user's properties.
- Only logged-in users can make the LLM use those tools otherwise the LLM asks the user to log in to get those details.
- No user can access other user's data via any tool calls.

# Documentation Rules :

- The eve-docs folder contains the files which may be changed upon certain actions.
- After completing a task or at the end of a chat, update the PROGRESS.md file by writing what has been done and what's the next thing to do so that if the tokens are exhausted, the next agent can pick up the context and understand what work has been done and what's remaining.
- Update eve-docs/ARCHITECTURE.md if there is any change n the architecture of the application as it contains the application's features and the architecture.
- Update eve-docs/NOTES.md on wrong assumptions or there's a error or some bug is resolved in the already implemented code as it stores the mistakes made during the implementation along with a brief summary of the prompt given by the user to point out or resolve the bug or changing the already implemented feature.

# Code Review Rules :

- For every feature added, create a new git branch and commit, I'll review, generate a pull request and merge it later.
- Always perform tests and edge case testing before changing the code.
- Always explain the code in detail before implementing it.
- Follow regression tests for resolving bugs.

# Testing Rules :

- After every feature implementation, use these criterias for testing :
- ESlint errors
- Type errors
- Edge cases
- Authorization checks

# Architecture Rules :

- Always use timestamps in all the database schemas.
- Never invent backend APIs.

# Prompt Rules :

- If prompt is vague, ask required parameters instead of inventing informaton.
