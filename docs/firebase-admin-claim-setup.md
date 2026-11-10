# Firebase admin claim setup

The app now protects administrative UI and Firestore rules with `request.auth.token.admin == true`.
Set this claim only from a trusted Firebase Admin SDK environment—never from the browser, a Firestore document, or local storage.

1. Find the Firebase Authentication UID of the municipal administrator.
2. In a secure server or one-off Admin SDK script, run:

```ts
await admin.auth().setCustomUserClaims('ADMIN_UID', { admin: true });
```

3. Ask that administrator to sign out and sign in again (or force-refresh their ID token).
4. Deploy the reviewed rules from `firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

The rules intentionally do not permit a profile's `role` field to create admin access. Existing profile documents that contain old `email`, `role`, or auth metadata should be migrated through a trusted backend before relying on the tightened policy.
