export async function onRequestGet(context) {
  try {
    const { id } = context.params

    const item = await context.env.DB
      .prepare('SELECT * FROM material_docent WHERE id=?')
      .bind(id)
      .first()

    if (!item) {
      return Response.json({ error: 'No trobat' }, { status: 404 })
    }

    const obj = await context.env.MEDIA.get(item.r2_key)

    if (!obj) {
      return Response.json({ error: 'Arxiu no trobat al storage' }, { status: 404 })
    }

    const headers = new Headers()
    obj.writeHttpMetadata(headers)
    headers.set('Content-Type', item.mimetype || headers.get('Content-Type') || 'application/octet-stream')
    headers.set('Content-Disposition', `inline; filename="${item.filename}"`)
    headers.set('Cache-Control', 'private, max-age=60')

    return new Response(obj.body, { headers })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
