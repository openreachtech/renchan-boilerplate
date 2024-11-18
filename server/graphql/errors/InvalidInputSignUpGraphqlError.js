import {
  BaseGraphqlError,
} from '@openreachtech/renchan'

/**
 * Invalid input in SignUp mutation.
 *
 * @extends {BaseGraphqlError<null>}
 */
export default class InvalidInputSignUpGraphqlError extends BaseGraphqlError {
  /** @override */
  static get errorCode () {
    /*
     * NOTE:
     * Error code structure: Xx.YY.ZZ
     * X: Error category (2: Application errors)
     * x: Error subcategory (2: Access right errors)
     * YY: Target resolver (01: SignUpMutationResolver)
     * ZZ: Specific error identifier (01: Invalid input)
     */
    return '22.01.01'
  }

  /** @override */
  static get errorMessage () {
    return 'Invalid input.'
  }
}
