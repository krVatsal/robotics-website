# AI Agent Evaluation — Golden Dataset

## Overview

This directory contains the evaluation dataset for the MNNIT Robotics Club AI agent. The dataset tests both **user-side** (read-only context tools) and **admin-side** (context + write tools) capabilities.

## Dataset: `golden-dataset.json`

**45 test cases** grounded in real club data from:
- MongoDB database models (projects, events, teams, users, competitions, site_content)
- Pragati magazine 2024 (Issue 01) — 15+ summer projects, SDC, Botrush/Robomania
- Pragati magazine 2025 (Issue 02) — 20+ summer projects, SDC Phase 2, events
- Website seed content (FAQs, about, tech stack, achievements, footer)
- GitHub repository (`krVatsal/robotics-website`)

## Tool Inventory

### Context Tools (User + Admin)
| Tool | Description |
|------|-------------|
| `getProjects` | Fetch projects from MongoDB (filter by category, tech, published) |
| `getEvents` | Fetch events with computed upcoming/past status |
| `getTeams` | Fetch user's teams or all teams (admin) with approval status |
| `getUserProfile` | Get authenticated user's profile details |
| `getSiteFAQs` | Fetch FAQ section from site_content collection |
| `getSiteAbout` | Fetch about/who-are-we/purpose/tech-stack/footer sections |
| `club_rag` | RAG search over Pragati magazine PDFs (2024 + 2025) |

### Write Tools (Admin Only)
| Tool | Description |
|------|-------------|
| `create_issue` | Create GitHub issue on krVatsal/robotics-website |
| `create_pr` | Create pull request |
| `merge_pr` | Merge a pull request |
| `close_issue` | Close a GitHub issue with comment |
| `list_pull_requests` | List PRs (open/closed/all) |
| `send_gmail` | Send email via Gmail |
| `search_gmail` | Search Gmail inbox |

## Test Case Structure

```json
{
  "id": "USR-CTX-001",          // Unique ID: {role}-{category}-{number}
  "category": "user|admin",      // Access level
  "subcategory": "tool_name",    // Primary tool being tested
  "difficulty": "easy|medium|hard",
  "query": "...",                 // Natural language user query
  "expected_tools": ["..."],     // Tools the agent SHOULD call
  "expected_tool_args": {},      // Expected arguments/filters
  "expected_answer": "...",      // Reference answer (semantic match)
  "grounding_source": "...",     // Where the answer comes from
  "tags": ["..."]               // Classification tags
}
```

## Evaluation Rubric

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Tool Selection Accuracy | 25% | Correct tool(s) chosen |
| Tool Argument Quality | 15% | Proper filters/parameters |
| Answer Accuracy | 30% | Factual correctness (semantic similarity) |
| Hallucination-Free | 20% | No fabricated information |
| Response Quality | 10% | Well-structured, actionable |

**Pass threshold**: 0.70 weighted score

## Critical Fail Conditions
- Hallucinating a project that doesn't exist
- User-role agent calling write tools
- Sending emails without confirmation
- Returning empty when data exists
- Mixing up project details between projects

## Test Distribution

| By Role | Count | By Difficulty | Count |
|---------|-------|---------------|-------|
| User | 32 | Easy | 14 |
| Admin | 13 | Medium | 21 |
| | | Hard | 10 |

**Coverage by test type:**
- Basic listing queries (6)
- Filtered/specific queries (9)
- FAQ lookups (5)
- RAG-based magazine queries (8)
- GitHub write operations (8)
- Gmail write operations (5)
- Edge cases & guardrails (10)
- Multi-tool chains (4)

## Running Evaluations

### Semantic Similarity Scoring
Answers are evaluated using cosine similarity (not exact match). Use an embedding model (e.g., `text-embedding-3-small`) to encode both `expected_answer` and the agent's response, then compute cosine similarity.

```python
# Example eval loop pseudocode
for case in dataset["test_cases"]:
    result = agent.run(case["query"], role=case["category"])
    
    # Score tool selection
    tool_score = score_tools(result.tools_called, case["expected_tools"])
    
    # Score answer quality (semantic)
    answer_score = cosine_similarity(
        embed(result.answer), 
        embed(case["expected_answer"])
    )
    
    # Check hallucinations
    halluc_score = check_grounding(result.answer, case["grounding_source"])
    
    # Weighted total
    total = 0.25*tool_score + 0.15*arg_score + 0.30*answer_score + 0.20*halluc_score + 0.10*quality_score
```

## Data Sources Referenced

| Source | Type | Content |
|--------|------|---------|
| `lib/models/project.ts` | Code | Project schema, CRUD ops |
| `lib/models/events.ts` | Code | Event schema with competitions |
| `lib/models/team.ts` | Code | Team approval state machine |
| `lib/models/user.ts` | Code | User profile fields |
| `lib/seed-content.ts` | Code | All site content (FAQ, about, tech-stack, etc.) |
| `design/PRAGATI COMPRESSED.pdf` | PDF | 2024 magazine (Issue 01) |
| `design/MAGAZINE_COMBINE.pdf` | PDF | 2025 magazine (Issue 02) |
| `app/api/events/route.ts` | Code | Event status computation logic |
| `app/api/projects/route.ts` | Code | Project listing with pagination |
