export {}

declare global {
  namespace graphql {
    // NOTE: Define resolver input/output interfaces here.

    interface RenewAccessTokenResult {
      accessToken: string
    }

    interface SignOutResult {
      isSignedOut: boolean
    }
  }
}
