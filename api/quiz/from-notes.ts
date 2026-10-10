import handler from '../index.js';

export default async function (req: any, res: any) {
  req.url = '/api/quiz/from-notes';
  return handler(req, res);
}
