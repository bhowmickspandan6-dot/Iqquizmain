import handler from '../index.ts';

export default async function (req: any, res: any) {
  req.url = '/api/quiz/from-notes';
  req.originalUrl = '/api/quiz/from-notes';
  return handler(req, res);
}
