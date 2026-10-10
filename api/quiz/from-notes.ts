import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/quiz/from-notes';
  return app(req, res);
}
