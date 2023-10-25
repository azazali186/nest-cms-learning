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
  'FORGOT-PASSWORD',
  'VERIFY-EMAIL',
  'RESET-PASSWORD',
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
