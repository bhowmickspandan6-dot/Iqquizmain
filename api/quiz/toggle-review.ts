import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/quiz/toggle-review';
  return app(req, res);
}
