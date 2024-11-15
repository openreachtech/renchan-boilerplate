export {}

declare global {
  namespace graphql {
    interface AdminRole {
      roleId: number
      roleName: string
    }

    interface Admin {
      adminId: number
      username: string
      email: string
      roles: Array<AdminRole>
    }

    interface AdminsResult {
      admins: Array<Admin>
    }

    interface AuthResult {
      accessToken: string
    }
  }
}
