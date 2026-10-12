import { hash, verify, Algorithm } from "@node-rs/argon2";

/**
 * Password hashing with Argon2id (OWASP-recommended parameters).
 * Never store passwords in plaintext or with reversible schemes.
 */

const PRODUCTION_PARAMS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

const LOOSE_PARAMS = {
  memoryCost: 4096, // 4 MiB — faster for local development only
  timeCost: 1,
  parallelism: 1,
};

export async function hashPassword(password) {
  const loose =
    process.env.NODE_ENV !== "production" && process.env.ARGON2_LOOSE_COST === "1";
  const params = loose ? LOOSE_PARAMS : PRODUCTION_PARAMS;
  return hash(password, { algorithm: Algorithm.Argon2id, ...params });
}

export async function verifyPassword(passwordHash, password) {
  try {
    return await verify(passwordHash, password, { algorithm: Algorithm.Argon2id });
  } catch {
    // Malformed hash or incompatible parameters — treat as mismatch.
    return false;
  }
}