export async function onRequest(context) {
  const url = new URL(context.request.url)

  // Rutas públicas (sin auth)
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/setup',
    '/api/media/imatge',
  ]

  // Permitir ver/descargar material sin token
  if (
    url.pathname.startsWith('/api/material/') &&
    (url.pathname.endsWith('/view') || url.pathname.endsWith('/download'))
  ) {
    return context.next()
  }

  // Permitir otras rutas públicas exactas o por prefijo
  if (publicPaths.some((p) => url.pathname === p || url.pathname.startsWith(p))) {
    return context.next()
  }

  // Proteger el resto de APIs
  if (url.pathname.startsWith('/api/')) {
    const auth = context.request.headers.get('Authorization') || ''
    const token = auth.replace('Bearer ', '').trim()

    if (!token) {
      return Response.json({ error: 'No autoritzat' }, { status: 401 })
    }

    try {
      const payload = await verifyJWT(token, context.env.JWT_SECRET)
      context.data.user = payload
    } catch {
      return Response.json({ error: 'Token invàlid' }, { status: 401 })
    }
  }

  return context.next()
}

async function verifyJWT(token, secret) {
  const [header, payload, sig] = token.split('.')
  const data = `${header}.${payload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const sigBytes = base64urlDecode(sig)
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes,
    new TextEncoder().encode(data)
  )

  if (!valid) throw new Error('Invalid signature')

  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  if (decoded.exp && decoded.exp < Date.now() / 1000) {
    throw new Error('Token expired')
  }

  return decoded
}

function base64urlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}
