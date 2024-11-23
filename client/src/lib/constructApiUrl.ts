import { env } from '$env/dynamic/public';

export const constructApiUrl = (isWebsocket: boolean = false): string => {
  const {PUBLIC_SERVER_URL, PUBLIC_SERVER_PORT} = env;
  const isLocal = PUBLIC_SERVER_URL === 'localhost';
  if (isLocal) {
    return `${isWebsocket ? 'ws://' : ''}${PUBLIC_SERVER_URL}:${PUBLIC_SERVER_PORT}`
  } else {
    return `${isWebsocket ? 'wss://' : 'https://'}${PUBLIC_SERVER_URL}`
  }
}
