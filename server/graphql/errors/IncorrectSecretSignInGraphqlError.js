import {
  BaseGraphqlError,
} from '@openreachtech/renchan'

/**
 * Incorrect secret in SignIn mutation.
 *
 * @extends {BaseGraphqlError<null>}
 */
export default class IncorrectSecretSignInGraphqlError extends BaseGraphqlError {
  /** @override */
  static get errorCode () {
    /*
     * NOTE:
     * Error code structure: Xx.YY.ZZ
     * X: Error category (2: Application errors)
     * x: Error subcategory (2: Access right errors)
     * YY: Target resolver (02: SignInMutationResolver)
     * ZZ: Specific error identifier (01: Incorrect secret)
     */
    return '22.02.01'
  }

  /** @override */
  static get errorMessage () {
    return 'Incorrect email or password.'
  }
}
