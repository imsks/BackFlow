// In-memory blacklist for invalidated JWT tokens
// In production, use Redis or a database for distributed systems
class JWTBlacklist {
  constructor() {
    this.blacklistedTokens = new Set();
  }

  add(tokenId) {
    this.blacklistedTokens.add(tokenId);
    console.log(`Token blacklisted: ${tokenId}`);
  }

  has(tokenId) {
    return this.blacklistedTokens.has(tokenId);
  }

  remove(tokenId) {
    this.blacklistedTokens.delete(tokenId);
  }

  size() {
    return this.blacklistedTokens.size;
  }
}

export const jwtBlacklist = new JWTBlacklist();
