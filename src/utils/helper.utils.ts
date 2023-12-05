import { Between } from 'typeorm';
import { format } from 'date-fns';
import { BadRequestException } from '@nestjs/common';

export function getPermissionNameFromRoute(
  path: string,
  method: string,
): string {
  method = getMethodName(path, method);
  const name = path;
  path =
    method.toLowerCase() +
    '-' +
    path.replaceAll('/api/v1/', '').replaceAll('/', '-').replace('-:id', '');

  if (path.includes('login')) {
    path = 'login';
  }
  if (path.includes('logout')) {
    path = 'logout';
  }
  if (path.includes('register')) {
    path = 'register';
  }
  if (path.includes('forgot-password')) {
    path = 'forgot-password';
  }
  if (path.includes('reset-password')) {
    path = 'reset-password';
  }
  if (path.includes('verify-email')) {
    path = 'verify-email';
  }
  if (path.includes('broadcast')) {
    path = 'broadcast';
  }
  if (path.includes('swagger')) {
    path = 'swagger';
  }
  if (
    path.includes('approval') ||
    path.includes('reject') ||
    path.includes('approve') ||
    path.includes('approved') ||
    path.includes('cancel') ||
    path.includes('cancelled') ||
    path.includes('rejected') ||
    path.includes('confirmed') ||
    path.includes('confirm')
  ) {
    path = name
      .replaceAll('/api/v1/auth-service/', '')
      .replaceAll('/', '-')
      .replace('-:id', '');
  }
  return path;
}

export const EXCLUDED_ROUTES = [
  'LOGIN',
  'SWAGGER',
  'REGISTER',
  'LOGOUT',
  'FORGOT_PASSWORD',
  'VERIFY_EMAIL',
  'RESET_PASSWORD',
  'BROADCAST',
];

export function getMethodName(path: string, method: string): string {
  switch (method) {
    case 'GET':
      if (path.slice(-3) == ':id') {
        method = 'view';
      } else {
        method = 'view-all';
      }
      break;
    case 'POST':
      method = 'create';
      break;
    case 'PATCH':
      method = 'update';
      break;
    case 'PUT':
      method = 'update';
      break;
    case 'DELETE':
      method = 'delete';
      break;

    default:
      method = 'view-all';
      break;
  }
  return method;
}

export const BetweenDates = (from: Date | string, to: Date | string) =>
  Between(
    format(
      typeof from === 'string' ? new Date(from) : from,
      'yyyy-MM-dd HH:mm:ss',
    ),
    format(typeof to === 'string' ? new Date(to) : to, 'yyyy-MM-dd HH:mm:ss'),
  );

export const GetJsonFromString = (body: any) => {
  const req: any = {};

  try {
    if (body) {
      body = body.replace(/\{|\}/g, '').replace(/\\n/g, '').split(',');

      body.forEach((b) => {
        const bdata = b.split(':');
        req[bdata[0].trim()] = bdata[1].trim();
      });
    }
  } catch (error) {
    throw new Error('INVALID_WS_REQUEST_BODY');
  }
  return req;
};

export function splitDateRange(dateRangeString: string) {
  const dateRangeFormat =
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!dateRangeString.match(dateRangeFormat)) {
    throw new BadRequestException(
      `Invalid date range format. The expected format is YYYY-MM-DD HH:mm:ss,YYYY-MM-DD HH:mm:ss`,
    );
  }

  const [start, end] = dateRangeString.split(',');
  const startDate = new Date(start.trim());
  const endDate = new Date(end.trim());
  return { startDate, endDate };
}

export function getMultipleSums(jsonArray: any[], keys: any[]) {
  const sums = {};

  keys.forEach((key) => {
    sums[key] = 0;
  });

  jsonArray.forEach((item) => {
    keys.forEach((key) => {
      if (item.hasOwnProperty(key) && typeof item[key] === 'number') {
        sums[key] += item[key];
      }
    });
  });

  return sums;
}
