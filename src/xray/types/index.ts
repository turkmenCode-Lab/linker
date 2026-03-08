export const PROXY_PROTOCOLS = [
  'vless',
  'vmess',
  'trojan',
  'shadowsocks',
  'hysteria2',
] as const;
export const SYSTEM_PROTOCOLS = ['freedom', 'blackhole', 'dns'] as const;
export const NETWORK_TYPES = [
  'tcp',
  'ws',
  'grpc',
  'h2',
  'quic',
  'httpupgrade',
] as const;
export const SECURITY_TYPES = ['none', 'tls', 'reality', 'auto'] as const;

export type Protocol = (typeof PROXY_PROTOCOLS)[number];
export type SystemProtocol = (typeof SYSTEM_PROTOCOLS)[number];
export type NetworkType = (typeof NETWORK_TYPES)[number];
export type SecurityType = (typeof SECURITY_TYPES)[number];


export interface XRayUser {
  readonly id?: string;
  readonly alterId?: number;
  readonly email?: string;
  readonly encryption?: string;
  readonly flow?: string | null;
  readonly security?: string;
  readonly password?: string;
}

export interface XRayVnext {
  readonly address: string;
  readonly port: number;
  readonly users: readonly XRayUser[];
}

export interface XRayServer {
  readonly address: string;
  readonly port: number;
  readonly password?: string;
  readonly method?: string;
  readonly users?: readonly XRayUser[];
}


export interface TLSSettings {
  readonly serverName?: string;
  readonly allowInsecure?: boolean;
  readonly alpn?: readonly string[];
  readonly fingerprint?: string;
  readonly show?: boolean;
}

export interface RealitySettings {
  readonly serverName?: string;
  readonly fingerprint?: string;
  readonly shortId?: string;
  readonly publicKey?: string;
  readonly spiderX?: string;
  readonly show?: boolean;
}

export interface WsSettings {
  readonly path?: string;
  readonly host?: string;
  readonly headers?: Readonly<Record<string, string>>;
}

export interface GrpcSettings {
  readonly serviceName?: string;
  readonly multiMode?: boolean;
}

export interface H2Settings {
  readonly path?: string;
  readonly host?: readonly string[];
}

export interface TcpSettings {
  readonly header?: { readonly type: string };
}

export interface StreamSettings {
  readonly network?: NetworkType;
  readonly security?: SecurityType;
  readonly tlsSettings?: TLSSettings;
  readonly realitySettings?: RealitySettings;
  readonly wsSettings?: WsSettings;
  readonly grpcSettings?: GrpcSettings;
  readonly httpSettings?: H2Settings;
  readonly tcpSettings?: TcpSettings;
}


export interface XRayOutboundSettings {
  readonly vnext?: readonly XRayVnext[];
  readonly servers?: readonly XRayServer[];
}

export interface XRayOutbound {
  readonly protocol: Protocol;
  readonly tag?: string;
  readonly settings: XRayOutboundSettings;
  readonly streamSettings?: StreamSettings;
}

export interface SystemOutbound {
  readonly protocol: SystemProtocol;
  readonly tag?: string;
  readonly settings?: Readonly<Record<string, unknown>>;
}

export type AnyOutbound = XRayOutbound | SystemOutbound;


export interface XRayInbound {
  readonly listen: string;
  readonly port: number;
  readonly protocol: string;
  readonly settings: Readonly<Record<string, unknown>>;
  readonly sniffing: Readonly<Record<string, unknown>>;
  readonly tag: string;
}

export interface XRayConfig {
  readonly remarks?: string;
  readonly meta?: unknown;
  readonly log?: Readonly<Record<string, unknown>>;
  readonly dns?: Readonly<Record<string, unknown>>;
  readonly inbounds?: readonly XRayInbound[];
  readonly outbounds?: readonly AnyOutbound[];
  readonly routing?: Readonly<Record<string, unknown>>;
}


export type ConvertResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };
