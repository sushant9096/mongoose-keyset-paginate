import { createCipheriv, randomBytes, scrypt } from 'crypto'

const encodePaginationCursor = async (data, secretKey) => {
  const salt = randomBytes(8).toString('hex')
  const encKeyPromise = new Promise<Buffer>((resolve, reject) => {
    scrypt(secretKey, salt, 24, (err, derivedKey) => {
      if (err) reject(err)
      resolve(derivedKey)
    })
  })
  const enc_key = await encKeyPromise
  const algorithm = 'des-ede3'
  const cipher = createCipheriv(algorithm, enc_key, '', {})
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return salt + '_' + encrypted
}
export default encodePaginationCursor
