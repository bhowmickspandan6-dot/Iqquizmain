import handler from '../index.ts';

export default async function (req: any, res: any) {
  req.url = '/api/quiz/reset-history';
  req.originalUrl = '/api/quiz/reset-history';
  return handler(req, res);
}
