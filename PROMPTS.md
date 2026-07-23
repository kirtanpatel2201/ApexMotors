# AI Tooling Chat History & Prompts

This file serves as a transparent record of the prompts used during the development of the Apex Motors Car Dealership System, in accordance with the Kata's AI Usage Policy.

## Brainstorming & Boilerplate
**Prompt:** "I am building a Node.js Express backend with Prisma and PostgreSQL. Please generate the initial boilerplate `app.ts` and `server.ts` files with standard middleware (CORS, JSON parsing)."
**Result:** Generated the initial foundation for the Express server.

## Authentication Logic
**Prompt:** "Please provide a standard regex for validating email addresses, and generate the boilerplate for a Jest test file to test an authentication route."
**Result:** Implemented robust regex validation and scaffolded the initial TDD structure.

## UI Design
**Prompt:** "What are the optimal TailwindCSS grid classes to display a responsive card layout that shows 1 column on mobile, 2 on tablets, and 4 on large desktops?"
**Result:** Applied `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` to the main inventory dashboard.

## Security & Database Transactions
**Prompt:** "I have a purchase endpoint where users decrement stock. If multiple users hit this endpoint concurrently when there is only 1 stock left, it goes negative. How do I prevent this race condition using Prisma?"
**Result:** Suggested using an interactive Prisma transaction `prisma.$transaction(async (tx) => {...})` with an absolute condition check to ensure atomic rollbacks.

## Edge Case Testing
**Prompt:** "What are some extreme edge cases I should test for in an e-commerce inventory API to ensure it is highly secure?"
**Result:** Suggested negative value injection, missing JWTs, RBAC bypass attempts, and concurrency stress testing.
