# Third-Party Notices

This product (Renchan Boilerplate, Copyright 2022 Open Reach Tech Inc.) is
licensed under the Apache License, Version 2.0 — see [`LICENSE`](./LICENSE).

It depends on third-party software distributed under its own terms. This file
lists the components whose licenses require attribution, notice, or the
distribution of a license text. Full license texts live under
[`licenses/`](./licenses).

Every other dependency of this product is distributed under a permissive license
(MIT, ISC, Apache-2.0, BSD, BlueOak-1.0.0 and the like), which requires no
notice beyond the ones already carried inside each package.

---

## mariadb (MariaDB Connector/Node.js)

| Item | Value |
| --- | --- |
| Component | `mariadb` — MariaDB Connector/Node.js |
| Version | 3.5.3 (declared as `^3.4.5` in `package.json`) |
| Copyright | Copyright (c) 2015-2025 MariaDB Corporation Ab |
| Upstream license | GNU Lesser General Public License, version 2.1 **or later** (SPDX: `LGPL-2.1-or-later`) |
| **Version chosen for this distribution** | **GNU LGPL version 3.0** |
| License text | [`licenses/LGPL-3.0.txt`](./licenses/LGPL-3.0.txt), which incorporates by reference [`licenses/GPL-3.0.txt`](./licenses/GPL-3.0.txt) (GNU GPL v3, which LGPL-3.0 incorporates in its opening paragraph) |

The upstream package permits "version 2.1 or any later version"; under that
grant, LGPL version 3.0 is elected as the governing version for this
distribution. The copy of the license shipped inside the package itself
(`node_modules/mariadb/LICENSE`) is the LGPL-2.1 text, and remains valid as the
alternative version offered upstream.

### Modifications

None. `mariadb` is used unmodified, exactly as published on the npm registry.

### Where to obtain the source code

The complete corresponding source of the version used here is publicly
available at:

- Repository: <https://github.com/mariadb-corporation/mariadb-connector-nodejs>
  (tag `v3.5.3`)
- npm registry tarball (source form; the published package *is* the source):
  <https://registry.npmjs.org/mariadb/-/mariadb-3.5.3.tgz>
  (integrity `sha512-i053Kc0MgdUv/hu9mCyq67TYfPXFj3/MV8I7ZW5wvJNixIyXC0VztMPUjIVj/449nQo+BsxFD4Fdk/sA/uqKPQ==`)

### How to replace the library with a modified version (relinking)

`mariadb` is a pure-JavaScript library. This product does not link it statically
and does not bundle it: it is resolved from `node_modules` and loaded at run time
through the standard Node.js module resolution (`import 'mariadb'`). Replacing it
therefore requires no rebuild of this product.

1. Get the source and modify it:

   ```sh
   git clone https://github.com/mariadb-corporation/mariadb-connector-nodejs.git
   cd mariadb-connector-nodejs
   git checkout v3.5.3
   # ... apply your modifications ...
   ```

2. Build (only needed if CommonJS consumers must be refreshed; the ESM entry
   points are the source files themselves):

   ```sh
   npm install
   npm run build
   ```

3. Install your build in place of the published package, from the root of this
   product:

   ```sh
   npm install /path/to/mariadb-connector-nodejs
   ```

   Alternatively, overwrite `node_modules/mariadb` with your package directory.
   Keep the same major version (3.x) so the API stays compatible.

4. Restart the application. No recompilation or re-release of this product is
   required:

   ```sh
   npm run dev            # development
   pm2 restart pm2.config.cjs   # process manager
   ```

Nothing in this product prevents the above: the connector is reached only
through its documented public API, so any LGPL-compatible replacement providing
that API can be substituted freely.
