// Phase 2 replaces this. Stub exists so `vercel dev` can be proven to serve /api
// today rather than at 12:25. Vite's dev server does NOT serve this file —
// run `vercel dev`, not `npm run dev`.
type Req = { body?: unknown };
type Res = { status(code: number): Res; json(body: unknown): void };

export default function handler(_req: Req, res: Res) {
  res.status(200).json({ count: 0, events: [], source: 'stub' });
}
