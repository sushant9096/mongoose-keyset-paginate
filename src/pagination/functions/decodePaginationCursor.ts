import { createDecipheriv, scrypt } from 'crypto'

const decodePaginationCursor = async (encrypted, secretKey) => {
  const [salt, token] = encrypted.split('_')
  const encKeyPromise = new Promise<Buffer>((resolve, reject) => {
    scrypt(secretKey, salt, 24, (err, derivedKey) => {
      if (err) reject(err)
      resolve(derivedKey)
    })
  })
  const enc_key = await encKeyPromise
  const algorithm = 'des-ede3'
  const decipher = createDecipheriv(algorithm, enc_key, '', {})
  let decrypted = decipher.update(token, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
export default decodePaginationCursor
