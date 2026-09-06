# Firebase Security Specification

## Data Invariants
- A Worker listing must be owned by a user (`userId`).
- A Shop listing must be owned by a user (`ownerId`).
- A Civic Report must be owned by the reporting user (`userId`).
- A Blood Donor profile must be owned by the user (`userId`).
- Users can only edit their own data.
- Admins (identified by specific emails in `src/types/index.ts`) can moderate content.

## The "Dirty Dozen" Payloads (Attacks)
1. **Identity Spoofing**: Attempt to create a worker listing with someone else's `userId`.
2. **Privilege Escalation**: Attempt to update a worker's `verified` status as a regular user.
3. **Shadow Update**: Attempt to add an `isAdmin: true` field to a user profile.
4. **PII Leak**: Attempt to read all user profiles as an unauthenticated user.
5. **Orphaned Record**: Attempt to create a civic report without a `userId`.
6. **State Shortcutting**: Attempt to move a civic report status directly to 'Resolved' without being an admin.
7. **Resource Poisoning**: Injecting a 1MB string into a `description` field.
8. **Unauthorized Deletion**: Attempting to delete someone else's shop listing.
9. **Spamming Alerts**: Unauthenticated user attempting to post a local alert.
10. **Query Scraping**: Attempting to list all civic reports without any filters.
11. **Timestamp Manipulation**: Providing a future `reportedAt` timestamp for a civic report.
12. **ID Poisoning**: Using a 2KB string as a document ID.

## Test Runner (Partial Draft)
- Verify `create` on `workers` fails if `request.auth.uid != incoming().userId`.
- Verify `update` on `workers` fails if any field other than allowed fields is modified by a non-admin.
- Verify `read` on `users` is restricted.
