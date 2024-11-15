export {}

declare global {
  namespace model {
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
  }
}
