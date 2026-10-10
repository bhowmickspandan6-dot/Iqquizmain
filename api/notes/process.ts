import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/notes/process';
  return app(req, res);
}
