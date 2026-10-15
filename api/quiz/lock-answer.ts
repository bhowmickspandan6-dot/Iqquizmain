import handler from '../index.ts';

export default async function (req: any, res: any) {
  req.url = '/api/quiz/lock-answer';
  req.originalUrl = '/api/quiz/lock-answer';
  return handler(req, res);
}
