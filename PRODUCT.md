# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A closed group of friends, about 20–30 young men. They are the audience for every app. One shared account system serves the whole group.

## Product Purpose

Brigada is a private platform for that friend group: one account, many small apps, and one set of design rules. Read is the only app shipped today. More than ten apps are intended. Their names and jobs are undecided.

Success means a new app feels like the same place, and only people in the group can get in.

## Positioning

Brigada is not a public product and not a single-purpose app. It is one account and one design system for a specific group, with room for many apps. A neighboring product that is public, or that is only a reading club, is not this.

## Operating Context

People sign in with Discord and get a Brigada username. The group has no public audience.

Discord may carry talk or pings for a given app. That is a per-app choice, not a platform rule.

Read is the current example of an app, not the shape of the platform. In Read, Discord holds the ballot and pings, and the web holds the board, the archive, and identity.

## Capabilities and Constraints

Shipped surfaces: sign-in (`apps/auth`), admin (`apps/admin`), the public stub (`apps/www`), Read (`apps/read`), and the API (`apps/server`). Shared UI lives in `packages/ui`. Shared auth lives in `packages/auth`.

Every app uses Discord sign-in and a Brigada username. An app may require its own membership grant. Read already does (`read_member`). Being on Brigada does not open every app.

The roster of future apps is open. Do not invent apps, audiences, or public pages.

Read’s club rules (one book at a time, private progress notes, no web voting, and the rest of `READ_ROADMAP.md`) apply to Read only. They are not platform law.

## Brand Commitments

The name is Brigada.

Every app uses the same design principles. The shared UI kit is shadcn, via `@brigada/ui`. The bar is clean and minimal. UX matters more than UI. These constraints are binding. They are not a palette, a type system, or a page concept.

## Evidence on Hand

The running code is the evidence: auth, admin, Read, a one-line www home, and the shared UI package.

`READ_ROADMAP.md` is the plan for Read. It is not a platform spec.

No testimonials, press, case studies, or brand assets are on file. Do not fabricate them.

## Product Principles

1. One closed group. Brigada is not for a public audience.
2. Many small apps under one account, not one app that does everything.
3. The same design rules on every app. UX outranks visual novelty.
4. An app may keep its own membership. A Brigada account is not a key to every app.
5. Discord is how people sign in. Using it for talk or pings is decided per app.
