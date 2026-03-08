import type {
  NetworkType,
  SecurityType,
  StreamSettings,
  XRayOutbound,
} from '../types';
import {
  parseProxyUrl,
  extractHash,
  decodeTransport,
  decodeSecurity,
} from '../utils/url.utils';

export function parseVlessLink(link: string): XRayOutbound {
  const { uuid, address, port, params, hash } = parseProxyUrl(link, 'vless');

  const network = (params.get('type') ?? 'tcp') as NetworkType;
  const security = (params.get('security') ?? 'none') as SecurityType;
  const encryption = params.get('encryption') ?? 'none';
  const flow = params.get('flow') ?? null;

  const ss: StreamSettings = {
    network,
    security,
    ...decodeTransport(network, params),
    ...decodeSecurity(security, params),
  };

  return {
    protocol: 'vless',
    tag: decodeURIComponent(hash) || 'proxy',
    settings: {
      vnext: [
        {
          address,
          port,
          users: [
            {
              id: uuid,
              alterId: 0,
              email: '',
              encryption,
              flow,
              security: 'auto',
            },
          ],
        },
      ],
    },
    streamSettings: ss,
  };
}

export function parseVmessLink(link: string): XRayOutbound {
  const b64 = link.slice('vmess://'.length);
  const payload = JSON.parse(atob(b64)) as Record<string, string>;

  const network = (payload.net ?? 'tcp') as NetworkType;
  const isTLS = payload.tls === 'tls';
  const security: SecurityType = isTLS ? 'tls' : 'none';

  const tlsPart: Partial<StreamSettings> = isTLS
    ? {
        tlsSettings: {
          serverName: payload.sni || payload.host || undefined,
          fingerprint: payload.fp || undefined,
          alpn: payload.alpn ? payload.alpn.split(',') : undefined,
          allowInsecure: false,
        },
      }
    : {};

  const transportPart: Partial<StreamSettings> = (() => {
    if (network === 'ws')
      return { wsSettings: { path: payload.path, host: payload.host } };
    if (network === 'grpc')
      return { grpcSettings: { serviceName: payload.path } };
    if (network === 'h2')
      return {
        httpSettings: {
          path: payload.path,
          host: payload.host ? [payload.host] : [],
        },
      };
    return {};
  })();

  const ss: StreamSettings = {
    network,
    security,
    ...tlsPart,
    ...transportPart,
  };

  return {
    protocol: 'vmess',
    tag: payload.ps || 'proxy',
    settings: {
      vnext: [
        {
          address: payload.add,
          port: Number(payload.port),
          users: [
            {
              id: payload.id,
              alterId: Number(payload.aid ?? 0),
              email: '',
              security: payload.scy ?? 'auto',
            },
          ],
        },
      ],
    },
    streamSettings: ss,
  };
}

export function parseTrojanLink(link: string): XRayOutbound {
  const url = new URL(link);
  const password = url.username;
  const address = url.hostname;
  const port = Number(url.port);
  const params = url.searchParams;
  const hash = url.hash.slice(1);

  const network = (params.get('type') ?? 'tcp') as NetworkType;
  const security = (params.get('security') ?? 'tls') as SecurityType;

  const ss: StreamSettings = {
    network,
    security,
    ...decodeTransport(network, params),
    ...decodeSecurity(security, params),
  };

  return {
    protocol: 'trojan',
    tag: decodeURIComponent(hash) || 'proxy',
    settings: { servers: [{ address, port, password }] },
    streamSettings: ss,
  };
}

export function parseShadowsocksLink(link: string): XRayOutbound {
  const url = new URL(link);
  const hash = url.hash.slice(1);

  let method = 'aes-256-gcm';
  let password = '';

  try {
    const decoded = atob(url.username);
    const colon = decoded.indexOf(':');
    method = decoded.slice(0, colon);
    password = decoded.slice(colon + 1);
  } catch {
    password = url.username;
  }

  return {
    protocol: 'shadowsocks',
    tag: decodeURIComponent(hash) || 'proxy',
    settings: {
      servers: [
        { address: url.hostname, port: Number(url.port), method, password },
      ],
    },
  };
}

export function parseHysteria2Link(link: string): XRayOutbound {
  const url = new URL(link);
  const password = decodeURIComponent(url.username);
  const params = url.searchParams;
  const hash = url.hash.slice(1);

  const ss: StreamSettings = {
    network: 'tcp',
    security: 'tls',
    tlsSettings: {
      serverName: params.get('sni') ?? undefined,
      fingerprint: params.get('pinSHA256') ?? undefined,
      allowInsecure: params.get('insecure') === '1',
      alpn: params.get('alpn')?.split(',') ?? undefined,
    },
  };

  return {
    protocol: 'hysteria2',
    tag: decodeURIComponent(hash) || 'proxy',
    settings: {
      servers: [{ address: url.hostname, port: Number(url.port), password }],
    },
    streamSettings: ss,
  };
}

export { extractHash };
