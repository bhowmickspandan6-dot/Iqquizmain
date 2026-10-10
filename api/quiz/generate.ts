import handler from '../index.js';

export const config = {
  maxDuration: 30,
};

export default async function (req: any, res: any) {
  req.url = '/api/quiz/generate';
  return handler(req, res);
}
