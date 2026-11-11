# CLAUDE.md

## Names that must not appear

A repository cloned from this boilerplate may be public, and a private one can be
opened up later without anybody rewriting what is already in it. So the rule holds
from the first commit whatever the current visibility is: nothing you write may
name a private party — not code, comments, JSDoc, tests, fixtures, documentation,
commit messages, branch names, issue descriptions, pull request descriptions, or
review comments.

Never write:

- the company name, its trade name, or its abbreviations, in prose or in examples
- client, customer, employer, or internal project, product, or codenames
- personal names, usernames, or email addresses
- credentials, tokens, internal URLs, hostnames, or internal ticket identifiers

Describe the change itself, never the project or the person it came from. When an
example needs a name, invent a neutral one: `example`, `acme`, `sample-app`,
`user@example.com`.

Published identity is exempt and must not be scrubbed: the copyright holder in
`LICENSE`, the package scope and package names, the `repository` and `homepage`
fields of `package.json`, and the README badges and install commands.
