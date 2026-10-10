import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/quiz/submit';
  return app(req, res);
}
