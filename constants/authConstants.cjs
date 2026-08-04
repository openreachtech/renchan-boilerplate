'use strict'

/*
 * Cookie that carries the refresh token.
 *
 * The two audiences hold separate refresh tokens under separate names and separate paths, so a
 * viewer's cookie is never even sent to the admin endpoint. The path is the endpoint the cookie
 * belongs to, which keeps it off every other route of the origin.
 *
 * `DOMAIN` is deliberately absent: naming a domain widens the cookie to every subdomain, and one
 * XSS on any of them would reach it.
 */
module.exports = {
  REFRESH_TOKEN_COOKIE: {
    CUSTOMER: {
      NAME: 'customer_refresh_token',
      PATH: '/graphql-customer',
    },
    ADMIN: {
      NAME: 'admin_refresh_token',
      PATH: '/graphql-admin',
    },
  },
}
