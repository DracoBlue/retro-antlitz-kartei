# Changesets

This folder is managed by [changesets](https://github.com/changesets/changesets).
Each change that should appear in a release gets a markdown file here.

Add one with:

```bash
pnpm changeset
```

Pick the affected packages and the bump type (patch / minor / major) and write a
short summary — it becomes the changelog entry. On `main`, CI opens a **Version
Packages** PR that applies the bumps; merging it publishes to npm.

For continuous **alpha** prereleases instead, enter pre mode first:

```bash
pnpm changeset pre enter alpha   # versions become x.y.z-alpha.N
pnpm changeset pre exit          # back to normal releases
```
