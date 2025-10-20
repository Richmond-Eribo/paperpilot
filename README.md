# PaperPilot

An AI-assisted research workflow for searching arXiv, selecting papers, and
previewing/synthesizing findings. Built with Next.js App Router, React, Nuqs for
URL state, and a modern component system.

## What it does

- Search arXiv and see rich paper cards with authors, categories, and links
- Select multiple papers and keep selection in the URL (shareable)
- Preview selected PDFs side-by-side with an AI Notes panel
- “Synthesize” mode (URL param `mode=synth`) for cross-paper insights

## Why it’s useful for the AWS AI Agent Hackathon

- Demonstrates an end-to-end research agent UX: discovery → curation → analysis
- Clear integration points for AWS services:
  - Amazon Bedrock: model inference (Claude, Llama, etc.) for
    summarization/synthesis
  - Amazon S3: store uploaded PDFs or cached extractions
  - Amazon API Gateway + Lambda: lightweight inference proxy and orchestration
  - Amazon OpenSearch Serverless: semantic search or vector store for paper
    embeddings
  - Amazon Cognito: auth if you add user accounts and saved workspaces

This repo ships a polished front-end with URL-synced state via Nuqs. Hook in
your AWS services to power the AI side.

## Tech stack

- Next.js 15 (App Router), React 19
- Nuqs (URL query state)
- TanStack React Query
- Tailwind CSS + Radix UI primitives
- react-resizable-panels

## Project structure

- `app/` — routing, pages, layout, loading
- `components/` — UI and feature components
- `lib/` — utilities
- `public/` — static assets

## Local development

- Requirements: Node 18+, pnpm
- Install deps: `pnpm install`
- Run dev server: `pnpm dev` (http://localhost:3000)

## Key flows

- Selection persists in the URL using two params:
  - `sel`: array of selected paper IDs
  - `meta`: URL-encoded JSON map of paper metadata keyed by ID
- Preview page (`/preview`):
  - Reads `sel` and `meta` via Nuqs
  - Renders PDFs via `pdfLink` and shows an AI panel
  - If `mode=synth`, the right panel copy changes to “Synthesis”

## Where to connect AWS

- Create an API route (e.g., `app/api/summarize/route.ts`) that calls Bedrock
- Add a form/action in the Preview page’s right panel to POST selected `meta`
- Optionally store extracted text in S3 and index metadata in OpenSearch
- If doing agentic retrieval, add embeddings + vector search with Bedrock Titan
  or OpenSearch k-NN

## Environment variables (example)

- `BEDROCK_REGION` — AWS region for Bedrock
- `BEDROCK_MODEL` — base model ID (e.g.,
  `anthropic.claude-3-5-sonnet-20240620-v1:0`)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — if not using a role

Add a `.env.local` with these to enable server routes that call AWS.

## Deployment

- Easiest path: Vercel (Next.js native)
- AWS path: Amplify Hosting or custom on ECS/Fargate + ALB
- Ensure environment variables are configured in your host

## Submission checklist (Hackathon)

- [ ] Public repo with README and setup steps
- [ ] Deployed preview URL (Vercel or Amplify)
- [ ] Short demo video (2–4 min) showing search → select → preview → synth
- [ ] Note AWS services used and architecture diagram
- [ ] Instructions to reproduce (env vars, how to run)

## Troubleshooting

- If Nuqs URL state doesn’t change, ensure `NuqsAdapter` wraps the app in
  `app/layout.tsx`
- If PDFs don’t render, verify `pdfLink` is accessible (CORS may block some
  hosts)
- If the UI looks off, confirm Tailwind is working and global styles are
  included

---

Made with ❤️ for the AWS AI Agent Global Hackathon.
