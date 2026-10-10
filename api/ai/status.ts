import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/ai/status';
  return app(req, res);
}
