'use strict'

/*
 * Cookie that carries the refresh token.
 *
 * The two audiences hold separate refresh tokens under separate names, so a viewer's cookie is
 * never even sent to the admin endpoint. The cookie is scoped to each endpoint's path, which the
 * engine already declares as `graphqlEndpoint` — so only the name lives here.
 *
 * `DOMAIN` is deliberately absent: naming a domain widens the cookie to every subdomain, and one
 * XSS on any of them would reach it.
 */
module.exports = {
  REFRESH_TOKEN_COOKIE: {
    CUSTOMER: {
      NAME: 'customer_refresh_token',
    },
    ADMIN: {
      NAME: 'admin_refresh_token',
    },
  },
}
