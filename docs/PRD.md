# PRD — Lead Prioritizer for Real-Estate Sales

## Problem
A real-estate sales team receives hundreds of inbound leads per day. A salesperson needs to quickly see which leads matter, what the customer actually wants, and what to do next.

## User
Salesperson (often non-technical, on a live call). Needs to scan AI output in seconds and trust it enough to act.

## Core Requirements (from brief — all required)
1. **Lead intake** — Form: Name, Location, Property requirement, Budget, Buying timeline, Customer message (free-text inquiry / chat transcript).
2. **AI analysis** — Per lead: Lead summary, Customer intent, Key requirements (3-5), Objections/concerns (1-4), Recommended next action, Suggested response. Plus Score 0-100, Tier HOT/WARM/COLD, Urgency high/medium/low + reasoning.
3. **Conversational interface** — Follow-ups grounded in that lead's context (e.g. "what should I emphasize on the call?", "make my reply more assertive"). Not a generic chatbot.
4. **Lead list & prioritization** — Multiple saved leads (in-memory, brief-compliant), each with AI analysis, ranked/grouped by score + tier + urgency.
5. **Clear display** — Score bar, color pills, chips, copy buttons. Scannable in seconds.

## Own Feature (locked): Action Kit
One click per lead generates:
- **Call talk-track** — 30-sec opener, 3 bullet emphasis points from requirements, 1 objection-handling line.
- **WhatsApp message** — <500 chars, personalized with name, references requirement/budget/timeline, ends with concrete next step. Copy button.
- **Follow-up task** — Title + due date derived from timeline + tier (e.g. HOT + "this week" = tomorrow 10am, WARM + "1 month" = +3 days).

Why this: covers before (prioritize), during (talk-track), after (WhatsApp + reminder) the call. One extra endpoint, high demo value, easy to defend in interview.

## Stretch (only if time on 30th AM)
1. Daily Priority Briefing (top 3 + why)
2. Objection Battlecards
3. Duplicate / low-quality detector

Do NOT start stretch until core + Action Kit are live on Vercel + Render.

## Non-goals
Auth/multi-user, real CRM sync, payments, analytics dashboard.

## Acceptance Criteria
- Intake → analysis visible in <15s on live URL
- List default-sorts by score desc, filter by tier works
- Chat answer references lead facts (location/budget/timeline)
- Action Kit generates all 3 parts, WhatsApp copies to clipboard
- No login, works incognito
