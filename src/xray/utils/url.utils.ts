import type {
  NetworkType,
  SecurityType,
  StreamSettings,
  TLSSettings,
} from '../types';

export interface ParsedProxyUrl {
  readonly uuid: string;
  readonly address: string;
  readonly port: number;
  readonly params: URLSearchParams;
  readonly hash: string;
}

export function parseProxyUrl(link: string, scheme: string): ParsedProxyUrl {
  const url = new URL(link);
  const uuid = url.username;
  const address = url.hostname;
  const port = Number(url.port);

  if (!uuid) throw new Error(`${scheme}: missing UUID`);
  if (!address) throw new Error(`${scheme}: missing address`);
  if (!port) throw new Error(`${scheme}: missing port`);

  return {
    uuid,
    address,
    port,
    params: url.searchParams,
    hash: url.hash.slice(1),
  };
}

export function extractHash(link: string): string {
  try {
    return decodeURIComponent(new URL(link).hash.slice(1));
  } catch {
    return '';
  }
}

export function encodeTransport(
  ss: StreamSettings,
  params: URLSearchParams,
): void {
  const net = ss.network ?? 'tcp';

  if (net === 'ws' && ss.wsSettings) {
    const { path, host, headers } = ss.wsSettings;
    const resolvedHost = host ?? headers?.['Host'] ?? headers?.['host'];
    if (path) params.set('path', path);
    if (resolvedHost) params.set('host', resolvedHost);
  }

  if (net === 'grpc' && ss.grpcSettings) {
    const { serviceName, multiMode } = ss.grpcSettings;
    if (serviceName) params.set('serviceName', serviceName);
    if (multiMode) params.set('mode', 'multi');
  }

  if (net === 'h2' && ss.httpSettings) {
    const { path, host } = ss.httpSettings;
    if (path) params.set('path', path);
    if (host?.length) params.set('host', [...host].join(','));
  }

  if (net === 'tcp' && ss.tcpSettings?.header?.type === 'http') {
    params.set('headerType', 'http');
  }
}

export function decodeTransport(
  network: NetworkType,
  params: URLSearchParams,
): Partial<StreamSettings> {
  if (network === 'ws') {
    const host = params.get('host') ?? undefined;
    return {
      wsSettings: {
        path: params.get('path') ?? '/',
        host,
        headers: host ? { Host: host } : {},
      },
    };
  }

  if (network === 'grpc') {
    return {
      grpcSettings: {
        serviceName: params.get('serviceName') ?? params.get('path') ?? '',
        multiMode: params.get('mode') === 'multi',
      },
    };
  }

  if (network === 'h2') {
    return {
      httpSettings: {
        path: params.get('path') ?? '/',
        host: params.get('host')?.split(',') ?? [],
      },
    };
  }

  if (network === 'tcp' && params.get('headerType') === 'http') {
    return { tcpSettings: { header: { type: 'http' } } };
  }

  return {};
}

export function decodeSecurity(
  security: SecurityType,
  params: URLSearchParams,
): Partial<StreamSettings> {
  if (security === 'tls') {
    const tlsSettings: TLSSettings = {
      serverName: params.get('sni') ?? params.get('host') ?? undefined,
      fingerprint: params.get('fp') ?? undefined,
      alpn: params.get('alpn') ? params.get('alpn')!.split(',') : undefined,
      allowInsecure: params.get('allowInsecure') === '1',
      show: false,
    };
    return { tlsSettings };
  }

  if (security === 'reality') {
    return {
      realitySettings: {
        serverName: params.get('sni') ?? undefined,
        fingerprint: params.get('fp') ?? undefined,
        publicKey: params.get('pbk') ?? undefined,
        shortId: params.get('sid') ?? undefined,
        spiderX: params.get('spx') ?? undefined,
        show: false,
      },
    };
  }

  return {};
}
