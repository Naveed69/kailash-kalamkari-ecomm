import type { User } from "firebase/auth"
import { v5 as uuidv5 } from "uuid"

export const USER_ID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"

export const getDbUserId = (user: Pick<User, "uid"> | null | undefined) => {
  if (!user?.uid) return null
  return uuidv5(user.uid, USER_ID_NAMESPACE)
}

export const getUserPhone = (
  user: Pick<User, "phoneNumber"> | null | undefined,
) => user?.phoneNumber ?? null
