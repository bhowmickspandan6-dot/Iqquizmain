import handler from '../index.js';

export default async function (req: any, res: any) {
  req.url = '/api/ai/status';
  return handler(req, res);
}
