import crypto from 'crypto'

const DEFAULT_KEY_HEX = 'e4b98fa5f162594bc90a88dc6a63fa62e4b98fa5f162594bc90a88dc6a63fa62'

const getSecretKey = () => {
  const envKey = process.env.BANK_ENCRYPTION_KEY
  if (envKey && envKey.length === 64) {
    return Buffer.from(envKey, 'hex')
  }
  return Buffer.from(DEFAULT_KEY_HEX, 'hex')
}

export const encrypt = (text) => {
  if (!text) return text
  const key = getSecretKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText
  const key = getSecretKey()
  const parts = encryptedText.split(':')
  if (parts.length !== 3) return encryptedText // not encrypted or corrupted
  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
