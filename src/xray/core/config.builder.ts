import type {
  XRayConfig,
  XRayOutbound,
  SystemOutbound,
  XRayInbound,
} from '../types';

const SOCKS_INBOUND: XRayInbound = {
  listen: '0.0.0.0',
  port: 10808,
  protocol: 'socks',
  settings: { allowTransparent: false, auth: 'noauth', udp: true },
  sniffing: { destOverride: ['http', 'tls'], enabled: true, routeOnly: false },
  tag: 'socks',
};

const HTTP_INBOUND: XRayInbound = {
  listen: '0.0.0.0',
  port: 10809,
  protocol: 'http',
  settings: { allowTransparent: false, auth: 'noauth', udp: true },
  sniffing: { destOverride: ['http', 'tls'], enabled: true, routeOnly: false },
  tag: 'http',
};

const DIRECT: SystemOutbound = { protocol: 'freedom', tag: 'direct' };
const BLACKHOLE: SystemOutbound = { protocol: 'blackhole', tag: 'block' };

export function buildBaseConfig(
  outbound: XRayOutbound,
  remarks?: string,
): XRayConfig {
  return {
    remarks: remarks || outbound.tag || 'imported',
    meta: null,
    log: { access: '', error: '', loglevel: 'warning' },
    dns: { servers: ['1.1.1.1', '8.8.8.8'] },
    inbounds: [SOCKS_INBOUND, HTTP_INBOUND],
    outbounds: [
      { ...outbound, tag: 'proxy' } satisfies XRayOutbound,
      DIRECT,
      BLACKHOLE,
    ],
    routing: {
      domainStrategy: 'AsIs',
      rules: [],
    },
  };
}

const PROXY_PROTOCOL_SET = new Set<string>([
  'vless',
  'vmess',
  'trojan',
  'shadowsocks',
  'hysteria2',
]);

const EXCLUDED_TAG_SET = new Set<string>(['direct', 'block', 'dns-out']);

export function extractProxyOutbound(config: XRayConfig): XRayOutbound | null {
  const found = config.outbounds?.find(
    (o) =>
      PROXY_PROTOCOL_SET.has(o.protocol) && !EXCLUDED_TAG_SET.has(o.tag ?? ''),
  );
  return (found as XRayOutbound) ?? null;
}
