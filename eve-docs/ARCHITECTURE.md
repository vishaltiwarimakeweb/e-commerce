# Overview

- We're building tools that access the backend and fetch the real data. Vercel Eve CLI is connected to this project for efficient AI usage, sub-agents, durable workflow, retries etc. So make sure to use all that. Read latest vercel eve docs to gather the latest information, don't rely on the previously trained data. After checking the Vercel Eve latest docs, decide what code to write and what files to create in the /agent folder of the root directory that is associated with Vercel Eve. Read eve-docs/TOOLS_PLAN.md to gather information about the tools needed and after implementing those tools, write the progress and the next thing to do in eve-docs/PROGRESS.md file so that in - case the tokens are exhausted, a new AI coding assistant can continue from right there.The tool should accept a search query, optional category, minimum price, and maximum price using Zod validation, call the existing product service, and return structured product data for the AI to reason about. Follow Eve best practices and keep the implementation modular.

# Tech Stack

- **Frontend** : Next.js( App Router ), Typescript, Tailwind CSS, Lucide React, React Toastify
- **Backend** : Next.js ( API Routes ), Typescript
- **Database** : MongoDB + Mongoose

# UI Widget

- Firstly create the UI chat-widget visible on all the pages at the **bottom-left** that opens up a chat screen UI upon clicking with optimistic UI updates and a smooth auto-scroll to the last message upon opening the chat. Ignore if already implemented.

# Database Schema

- There will be 2 collections : Conversations & Messages.
- A user will be tracked via it's Session ID and that's how a user will be able to access his conversation and messages.
- Decide the appropriate schema yourself.
