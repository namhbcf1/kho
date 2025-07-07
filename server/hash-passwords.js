// Hash passwords for database seeding
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'pos-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function main() {
  const password = 'admin123'
  const hash = await hashPassword(password)
  console.log(`Password: ${password}`)
  console.log(`Hash: ${hash}`)
}

main().catch(console.error) 