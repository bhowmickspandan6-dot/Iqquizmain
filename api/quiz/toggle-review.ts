import handler from '../index.ts';

export default async function (req: any, res: any) {
  req.url = '/api/quiz/toggle-review';
  req.originalUrl = '/api/quiz/toggle-review';
  return handler(req, res);
}
