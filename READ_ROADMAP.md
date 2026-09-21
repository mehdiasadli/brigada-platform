# Read roadmap

Brigada Read is a **Discord friend club** with a web companion. Discord holds talk, the ballot, and pings. The web holds the board, the archive, and identity.

`v1`–`v10` are **PR buckets**, not product versions. Each `v#` is one PR with a handful of related features. Do not ship two books at once, a public www page, Goodreads/ISBN, email/push, personal shelves, comments, or saved lines.

Admin starts every vote. Progress notes stay private.

---

## What is already shipped

Access is Discord login plus a `read_member` grant. Everyone else hits a forbidden page.

### Admin (`apps/admin`)

- Grant and revoke Read seats.
- Search Open Library, add books, edit catalog fields, set book status (`readlist` | `reading` | `completed` | `removed`).
- Create a session, build a slate (2–10 readlist books), start a Discord poll, pick a winner or roll random, cancel, complete, edit a reader’s progress.

### Member app (`apps/read`)

| Route | What it does |
| --- | --- |
| `/` | Open session: voting slate, active book, progress, review CTA, reader board. Empty state points at Discord and the last completed session. |
| `/books`, `/books/[slug]` | Catalog and book page with club reviews. |
| `/sessions`, `/sessions/[id]` | Archive: dates, winner, slate, readers, club rating. |
| `/members`, `/members/[username]` | Directory and profile (name, join date, reviews). |

Header: Books, Sessions, Members, your avatar (own profile), sign out.

### Loop in the server

Session states: `not_started` → `voting` → `active` → `completed` | `cancelled`. One open session at a time. Reading deadline is derived from page count. The hourly Read loop completes an active session when everyone is finished or the deadline passes.

Readers are a frozen roster plus `read_progress` (percentage, private notes, finished or not). There is no sit-out or DNF yet, so a skip looks like 0%.

Reviews are create-only (`POST /api/read/me/reviews`). Member APIs strip other people’s notes and emails.

### Discord

- Starting a vote posts a poll in the Read channel.
- `/set-read-progress` and `/get-progress` (guild-locked, user must be linked).
- Midterm check-in poll (does not write progress).
- Members vote in Discord. The web says “Vote in Discord.” The winner is still an admin click (or random). `votingDeadline` is stored and unused.

### How we got here

| PR | What landed |
| --- | --- |
| [#8](https://github.com/mehdiasadli/brigada/pull/8) | Schema, APIs, admin Reading Club, Discord votes/progress, first member app. |
| [#9](https://github.com/mehdiasadli/brigada/pull/9) | Catalog tools, reviews, safer admin edits, member-safe payloads. |
| [#10](https://github.com/mehdiasadli/brigada/pull/10) | Club progress board, session archive, signed-in chrome, last-session on home. |

`main` today **is v1**. The next PRs start at v2.

---

## Rules for later PRs

1. Close the weekly loop before building memory.
2. Memory is recaps, ratings, and live `/stats`. Not a comment wall. Not quotes.
3. Rankings live on `/stats`, always current. Home during an active book stays the reader board. Do not rank mid-book percentage.
4. Count finished books, reviews, sessions joined, sit-outs, and DNFs. That is participation, not a race through this week’s pages.
5. Keep Discord as the loudspeaker. A recap post or “poll closes soon” ping is fine. Do not rebuild voting or chat on the web.

---

## v1 — Current (shipped)

Not a future PR. This is the club you can run today.

1. **Admin-run cycle.** Grant members, add books, slate, Discord poll, resolve, track progress, write a review.
2. **Shared board and archive.** During a book, members see who is where. After it ends, `/sessions` keeps the winner, slate, readers, and club rating. Home is not a dead end.
3. **Identity.** Signed-in chrome, directory, profiles (reviews only).
4. **Discord companion.** Poll + progress commands + midterm. The web does not take ballots.

**Still broken in the loop:** a typo in a review is permanent, an accidental 100% needs an admin, only you can add books, sitting out looks like 0%, and a vote will sit until you resolve it.

---

## v2 — Repair the member loop

People can undo a mistake without you.

1. **Edit your own review.** `PATCH` rating and body. Prefill the dialog. Button becomes “Edit review.” No delete.
2. **Unfinish.** Quiet “Not finished” after 100%: keep last notes, clear `completedAt`, show the progress form again.
3. **Discord progress after the session ends.** Commands update the open book, or the book that just finished. They never ask for a book id. A bad percentage gets a reply from the bot.
4. **Same rules on the book page.** Unfinish and edit review work from `/books/[slug]`, not only home.

---

## v3 — Members grow the list

You still build the slate and start the vote. Members stop waiting on you to type a title.

1. **Nominate.** Member picks a title via the existing Open Library search. It lands as `readlist`. Members cannot edit catalog metadata.
2. **Why I nominated.** Short reason on the candidate. Shown on the slate while voting.
3. **Admin reject.** Remove or park a nomination without deleting history. Cover fetch stays on the Open Library path you already have.
4. **Nominate from the catalog.** If the book is already in the list, “nominate for a future slate” is one action, not a duplicate row.

---

## v4 — A vote that ends, a roster that tells the truth

The waiting room and the board stop lying.

1. **Voting countdown.** Deadline on home. Deep link to the Discord poll when `discordPollMessageId` is set. Archive shows the winner and the also-rans.
2. **Auto-resolve.** When `votingDeadline` passes, tally Discord poll counts; ties fall back to random among leaders; post the result in the channel. You can still resolve early.
3. **Sit-out and DNF.** Reader state `reading` | `sat_out` | `dnf`. Sat-out leaves the progress board. DNF stays visible with a label, not a fake 0%. Admin can override.
4. **Cover and slug.** Admin can fix `coverId`. Renaming a title does not 404 old links (keep the slug, or redirect).

---

## v5 — Live member stats

First memory PR. A `/stats` page, always current. Not on home next to the board.

1. **Member rankings.** Books finished, reviews written, sessions joined.
2. **Participation, not pace.** Sit-outs and DNFs count as activity. Mid-book percentage does not.
3. **Year filter.** Default this year; all-time as a second view.
4. **Nav.** Stats in the header. Empty state until one session has completed.

---

## v6 — Book and session stats

Same `/stats` page, other axes.

1. **Books.** Club rating, times finished, times on a slate, times won.
2. **Sessions.** Completion rate, average rating, how many sat out or DNF’d.
3. **Links.** Book page and session archive show the same numbers (do not invent a second payload shape).
4. **Also-rans.** How often a title lost a vote, on the book page.

---

## v7 — Profiles that look like readers

The directory stops being “name + reviews.”

1. **Profile stats.** Books finished, average rating given, sit-out / DNF counts, current book and percentage if any.
2. **Directory line.** “Reading X”, “Finished X”, “Sat out of X”, or join date.
3. **Jump to `/stats`.** The profile links to that member’s row.
4. **Still private.** No notes, no email, no comment wall.

---

## v8 — Year recap

Last memory piece. Needs a few completed sessions or it is an empty page. Ship the route anyway; show a honest empty state.

1. **`/recap/[year]`.** Books read, who finished how many, favorite book (club rating), busiest session.
2. **Recap rankings.** Allowed here: most finished, most reviews, highest average given. This is a yearbook, still not a widget on home during a book.
3. **Timeline.** Each completed session as a row: cover, dates, club rating, link to archive.
4. **Home link.** When there is no open session, point at this year’s recap as well as last session.

---

## v9 — Discord as the loudspeaker

No new web product. Make the channel say the useful thing at the useful time.

1. **End-of-book recap post.** Winner, dates, club rating, who finished / sat out / DNF. Link to the session page.
2. **Poll closes soon.** Roughly two hours before `votingDeadline`, one message in the channel with the poll link.
3. **Midterm points at the board.** The existing midterm poll includes the web URL so people update percentage there.
4. **Year recap ping.** Once, when you (admin) publish or when the year flips and there is data. Not email.

---

## v10 — The quiet week

Between books the club should still have somewhere to look.

1. **Next-slate preview on home.** Readlist + nomination reasons, clearly “not voting yet.” You still start the poll.
2. **Catalog first paint.** RSC the first books page; keep “Load more” on the client.
3. **One member-path e2e.** Grant, add book, session, vote resolve, progress, review, archive. Enough to stop shipping a silent 404.
4. **Admin override in one sheet.** Sit-out, DNF, progress, and complete already exist in pieces; one session sheet should do all of them without hunting.

---

## Out of scope (even after v10)

| Idea | Why not |
| --- | --- |
| Personal to-read shelves | The club list is the product. |
| Public Read on www | Invite-only via Discord + grant. |
| Goodreads / ISBN / genres | Catalog is small and Open Library is enough. |
| Email or push | Discord already pings. |
| Two books at once | One book is the rule. |
| Saved lines / quotes | Talk stays in Discord. |
| Comments | Same. Reviews are the written artifact. |
| Web voting | Discord polls unless they start failing the club. |
| Mid-book percentage on `/stats` or home | Turns this week into a race. |

Leaderboards **are** in scope, on `/stats` and in the year recap, using finished work and participation.

---

## Suggested PR order

Do v2 before anything else if a book is in flight (people will hit review typos and accidental 100%). Do not start v5 until the club has sat-out/DNF and a vote that can end itself, or the stats will lie.

`PLANS.md` is local scratch. This file is the plan to follow.
