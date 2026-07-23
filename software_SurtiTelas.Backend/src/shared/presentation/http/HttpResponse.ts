import { Response } from 'express';

export const ok = (res: Response, data: unknown, message?: string) =>
  res.status(200).json({ success: true, data, message });

export const created = (res: Response, data: unknown, message?: string) =>
  res.status(201).json({ success: true, data, message });

export const noContent = (res: Response) => res.status(204).send();
