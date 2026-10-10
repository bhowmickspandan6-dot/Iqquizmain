import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/quiz/lock-answer';
  return app(req, res);
}
