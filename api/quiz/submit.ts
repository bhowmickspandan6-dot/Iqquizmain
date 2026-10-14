import handler from '../index.ts';

export default async function (req: any, res: any) {
  req.url = '/api/quiz/submit';
  return handler(req, res);
}
