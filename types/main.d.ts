// query result

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

// Model types

interface AdminWithAssociationsEntity {
  id: number
  username: string
  registeredAt: Date
  AdminSecret: {
    id: number
    AdminId: number
    email: string
  }
  AdminPasswordHash: {
    id: number
    passwordHash: string
  }
  AdminRoles: Array<{
    id: number
    name: string
  }>
}

interface AdminSecretWithAssociationsEntity {
  id: number
  AdminId: number
  email: string
  Admin: {
    id: number
    username: string
    registeredAt: Date
    AdminPasswordHash: {
      id: number
      passwordHash: string
    }
  }
}
