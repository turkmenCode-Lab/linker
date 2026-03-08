import type { XRayOutbound } from '../types';
import { encodeTransport } from '../utils/url.utils';

export function serializeVless(
  outbound: XRayOutbound,
  remarks?: string,
): string {
  const vnext = outbound.settings.vnext?.[0];
  if (!vnext) throw new Error('vless: missing vnext');

  const user = vnext.users[0];
  const ss = outbound.streamSettings ?? {};
  const params = new URLSearchParams();

  params.set('encryption', user.encryption ?? 'none');
  params.set('security', ss.security ?? 'none');
  params.set('type', ss.network ?? 'tcp');

  if (user.flow) params.set('flow', user.flow);

  const tls = ss.tlsSettings;
  if (tls) {
    if (tls.serverName) params.set('sni', tls.serverName);
    if (tls.fingerprint) params.set('fp', tls.fingerprint);
    if (tls.alpn?.length) params.set('alpn', [...tls.alpn].join(','));
    if (tls.allowInsecure) params.set('allowInsecure', '1');
  }

  const reality = ss.realitySettings;
  if (reality) {
    if (reality.serverName) params.set('sni', reality.serverName);
    if (reality.fingerprint) params.set('fp', reality.fingerprint);
    if (reality.publicKey) params.set('pbk', reality.publicKey);
    if (reality.shortId) params.set('sid', reality.shortId);
    if (reality.spiderX) params.set('spx', reality.spiderX);
  }

  encodeTransport(ss, params);

  const tag = remarks ?? outbound.tag ?? '';
  return `vless://${user.id}@${vnext.address}:${vnext.port}?${params.toString()}#${encodeURIComponent(tag)}`;
}

export function serializeVmess(
  outbound: XRayOutbound,
  remarks?: string,
): string {
  const vnext = outbound.settings.vnext?.[0];
  if (!vnext) throw new Error('vmess: missing vnext');

  const user = vnext.users[0];
  const ss = outbound.streamSettings ?? {};
  const tls = ss.tlsSettings ?? {};
  const ws = ss.wsSettings ?? {};

  const payload: Record<string, unknown> = {
    v: '2',
    ps: remarks ?? outbound.tag ?? '',
    add: vnext.address,
    port: String(vnext.port),
    id: user.id,
    aid: String(user.alterId ?? 0),
    scy: user.security ?? 'auto',
    net: ss.network ?? 'tcp',
    type: 'none',
    host: ws.host ?? tls.serverName ?? '',
    path: ws.path ?? '',
    tls: ss.security === 'tls' ? 'tls' : '',
    sni: tls.serverName ?? '',
    alpn: tls.alpn ? [...tls.alpn].join(',') : '',
    fp: tls.fingerprint ?? '',
  };

  return `vmess://${btoa(JSON.stringify(payload))}`;
}

export function serializeTrojan(
  outbound: XRayOutbound,
  remarks?: string,
): string {
  const server = outbound.settings.servers?.[0];
  if (!server) throw new Error('trojan: missing server');

  const ss = outbound.streamSettings ?? {};
  const tls = ss.tlsSettings ?? {};
  const params = new URLSearchParams();

  params.set('security', ss.security ?? 'tls');
  params.set('type', ss.network ?? 'tcp');
  if (tls.serverName) params.set('sni', tls.serverName);
  if (tls.fingerprint) params.set('fp', tls.fingerprint);
  if (tls.alpn?.length) params.set('alpn', [...tls.alpn].join(','));
  encodeTransport(ss, params);

  const tag = remarks ?? outbound.tag ?? '';
  return `trojan://${server.password}@${server.address}:${server.port}?${params.toString()}#${encodeURIComponent(tag)}`;
}

export function serializeShadowsocks(
  outbound: XRayOutbound,
  remarks?: string,
): string {
  const server = outbound.settings.servers?.[0];
  if (!server) throw new Error('shadowsocks: missing server');

  const method = server.method ?? 'aes-128-gcm';
  const password = server.password ?? '';
  const userInfo = btoa(`${method}:${password}`);
  const tag = remarks ?? outbound.tag ?? '';

  return `ss://${userInfo}@${server.address}:${server.port}#${encodeURIComponent(tag)}`;
}
export function serializeHysteria2(
  outbound: XRayOutbound,
  remarks?: string,
): string {
  const server = outbound.settings.servers?.[0];
  if (!server) throw new Error('hysteria2: missing server');

  const ss = outbound.streamSettings ?? {};
  const tls = ss.tlsSettings ?? {};
  const params = new URLSearchParams();

  if (tls.serverName) params.set('sni', tls.serverName);
  if (tls.fingerprint) params.set('pinSHA256', tls.fingerprint);
  if (tls.allowInsecure) params.set('insecure', '1');
  if (tls.alpn?.length) params.set('alpn', [...tls.alpn].join(','));

  const tag = remarks ?? outbound.tag ?? '';
  const password = server.password ?? '';

  return `hysteria2://${encodeURIComponent(password)}@${server.address}:${server.port}?${params.toString()}#${encodeURIComponent(tag)}`;
}
