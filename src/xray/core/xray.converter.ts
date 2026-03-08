import type {
  Protocol,
  XRayConfig,
  XRayOutbound,
  ConvertResult,
} from '../types';
import { PROXY_PROTOCOLS } from '../types';
import {
  parseVlessLink,
  parseVmessLink,
  parseTrojanLink,
  parseShadowsocksLink,
  parseHysteria2Link,
  extractHash,
} from '../parsers';
import {
  serializeVless,
  serializeVmess,
  serializeTrojan,
  serializeShadowsocks,
  serializeHysteria2,
} from '../serializers';
import { buildBaseConfig, extractProxyOutbound } from './config.builder';

export class XRayConverter {
  public configToLink(config: XRayConfig): ConvertResult<string> {
    try {
      const outbound = extractProxyOutbound(config);
      if (!outbound) return this.err('No proxy outbound found in config');
      return this.ok(this.serialize(outbound, config.remarks));
    } catch (e) {
      return this.err(e);
    }
  }

  public linkToConfig(link: string): ConvertResult<XRayConfig> {
    try {
      const outbound = this.parse(link.trim());
      const remarks = extractHash(link.trim());
      return this.ok(buildBaseConfig(outbound, remarks));
    } catch (e) {
      return this.err(e);
    }
  }

  public linksToConfigs(links: string[]): ConvertResult<XRayConfig[]> {
    const configs: XRayConfig[] = [];
    const errors: string[] = [];

    for (const link of links) {
      const result = this.linkToConfig(link);
      if (result.success) {
        configs.push(result.data);
      } else {
        errors.push(`[${link.slice(0, 40)}…] ${result.error}`);
      }
    }

    return configs.length > 0 ? this.ok(configs) : this.err(errors.join('\n'));
  }

  public configsToLinks(configs: XRayConfig[]): ConvertResult<string[]> {
    const links: string[] = [];
    const errors: string[] = [];

    for (const cfg of configs) {
      const result = this.configToLink(cfg);
      if (result.success) {
        links.push(result.data);
      } else {
        errors.push(result.error);
      }
    }

    return links.length > 0 ? this.ok(links) : this.err(errors.join('\n'));
  }

  public detectProtocol(link: string): Protocol | null {
    const scheme = link.split('://')[0].toLowerCase();
    return (PROXY_PROTOCOLS as readonly string[]).includes(scheme)
      ? (scheme as Protocol)
      : null;
  }

  public validateLink(link: string): ConvertResult<true> {
    const result = this.linkToConfig(link);
    return result.success ? this.ok(true as const) : this.err(result.error);
  }

  private serialize(outbound: XRayOutbound, remarks?: string): string {
    switch (outbound.protocol) {
      case 'vless':
        return serializeVless(outbound, remarks);
      case 'vmess':
        return serializeVmess(outbound, remarks);
      case 'trojan':
        return serializeTrojan(outbound, remarks);
      case 'shadowsocks':
        return serializeShadowsocks(outbound, remarks);
      case 'hysteria2':
        return serializeHysteria2(outbound, remarks);
    }
  }

  private parse(link: string): XRayOutbound {
    const protocol = this.detectProtocol(link);
    switch (protocol) {
      case 'vless':
        return parseVlessLink(link);
      case 'vmess':
        return parseVmessLink(link);
      case 'trojan':
        return parseTrojanLink(link);
      case 'shadowsocks':
        return parseShadowsocksLink(link);
      case 'hysteria2':
        return parseHysteria2Link(link);
      default:
        throw new Error(`Unsupported protocol: ${link.slice(0, 30)}`);
    }
  }

  private ok<T>(data: T): ConvertResult<T> {
    return { success: true, data };
  }

  private err(e: unknown): ConvertResult<never> {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}
