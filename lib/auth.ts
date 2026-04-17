export function isAuthed(req: Request) {
  const secret = req.headers.get('x-admin-secret');
  return !!secret && secret === process.env.ADMIN_SECRET;
}
