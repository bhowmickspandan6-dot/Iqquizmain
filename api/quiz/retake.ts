import app from '../../server';

export default function handler(req: any, res: any) {
  req.url = '/api/quiz/retake';
  return app(req, res);
}
