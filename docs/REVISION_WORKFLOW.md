# Revision Workflow

This repository uses a simple, repeatable revision structure for future pushes.

## Branches

- `main`: stable branch. Only verified changes should be pushed here.
- `feature/<short-name>`: new feature work.
- `fix/<short-name>`: bug fixes.
- `docs/<short-name>`: documentation-only updates.
- `db/<short-name>`: Supabase migration changes.

## Commit Format

Use short, action-oriented commit messages:

```text
feat: add kalkinma ajansi filters
fix: persist local profile password hash
db: add analysis activity indexes
docs: add UAT run report
test: add business rule coverage
```

Recommended types:

- `feat`
- `fix`
- `db`
- `docs`
- `test`
- `chore`

## Release Steps

1. Update code and tests.
2. Run:

```powershell
npm run build
```

3. Update `CHANGELOG.md`.
4. Update `VERSION` if the release version changes.
5. Commit changes.
6. Push to GitHub.
7. Tag important releases:

```powershell
git tag v0.1.0
git push origin v0.1.0
```

## Supabase Changes

Schema changes should be committed under `supabase/migrations`.

Before pushing DB changes:

1. Apply migration to the target Supabase project.
2. Verify RLS policies.
3. Run Supabase security/performance advisors.
4. Record important DB changes in `CHANGELOG.md`.

