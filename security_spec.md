# Security Specification - Palembang City Incident & Event Portal

## Data Invariants
1. **Public Visibility with Curation Integrity**: All citizen incident reports, official news, and air quality stations are readable by citizens.
2. **Citizen Authorship Guard**: An authenticated citizen can submit a new incident report or comment, but the `reporterUid` / `authorUid` MUST match `request.auth.uid`.
3. **Admin Curation Privilege**: Status changes (`verified`, `rejected`, `resolved`), `isOfficial`, and `curatorNotes` can only be set or modified by administrators (bootstrapped admin: `alexjun2306@gmail.com`).
4. **News Publishing Control**: Only administrators can publish or update city news articles and official advisories.
5. **Air Quality Updates**: Publicly readable; writable only by administrators or automated environmental services.
6. **Immutable Origins**: Once created, `createdAt` and `reporterUid` cannot be altered.

## The Dirty Dozen Security Attack Payloads
1. **Ghost Field Injection**: Adding `isAdmin: true` or `isOfficial: true` inside a citizen incident submission.
2. **Identity Spoofing**: Submitting a report with `reporterUid` set to a victim's UID.
3. **Status Hijacking**: A regular citizen updating their report from `pending` to `verified` or modifying `curatorNotes`.
4. **Air Quality Tampering**: A malicious user overwriting AQI sensor values with fake emergency numbers.
5. **News Defacement**: A regular authenticated user writing or deleting official news entries.
6. **Oversized String Payload**: Submitting a 2MB description to trigger Denial-of-Wallet resource exhaustion.
7. **Malicious Path Variable**: Using 500-byte path traversal or junk characters as document IDs.
8. **Impersonated Upvote Cascade**: Modifying arbitrary fields while claiming to increment upvotes.
9. **Unauthenticated Write**: An anonymous or unverified user attempting to create or delete reports.
10. **Cross-User Comment Modification**: User B attempting to edit or delete User A's witness comment.
11. **Client Delegation List Scraping**: Attempting arbitrary broad queries without collection bounds.
12. **Orphaned Relation Attack**: Attempting to attach comments to non-existent reports.
