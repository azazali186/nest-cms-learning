import { Request } from 'express';

export function getClientIpUtil(request: Request): string {
  let ipAddress = request.ip;
  if (ipAddress) {
    const matches = ipAddress.match(/(\d+\.\d+\.\d+\.\d+)/);
    if (matches) {
      ipAddress = matches[0];
    }

    if (ipAddress === '::1') {
      ipAddress = '127.0.0.1';
    }
  }
  return ipAddress;
}
