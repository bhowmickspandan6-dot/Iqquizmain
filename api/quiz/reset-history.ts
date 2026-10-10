import handler from '../index.js';

export default async function (req: any, res: any) {
  req.url = '/api/quiz/reset-history';
  return handler(req, res);
}
