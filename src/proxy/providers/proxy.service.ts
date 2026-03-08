import { Protocol, XRayConfig, XRayConverter } from '@/xray';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ProxyService {
  private readonly converter = new XRayConverter();

  linkToConfig(link: string): XRayConfig {
    const result = this.converter.linkToConfig(link);
    if (!result.success) {
      throw new BadRequestException(`Invalid proxy link: ${result.error}`);
    }
    return result.data;
  }

  configToLink(config: XRayConfig): string {
    const result = this.converter.configToLink(config);
    if (!result.success) {
      throw new BadRequestException(`Cannot convert config: ${result.error}`);
    }
    return result.data;
  }

  bulkImport(links: string[]): {
    imported: XRayConfig[];
    failed: { link: string; reason: string }[];
  } {
    const imported: XRayConfig[] = [];
    const failed: { link: string; reason: string }[] = [];

    for (const link of links) {
      const result = this.converter.linkToConfig(link);
      if (result.success) {
        imported.push(result.data);
      } else {
        failed.push({ link, reason: result.error });
      }
    }

    return { imported, failed };
  }

  sniffProtocol(link: string): Protocol | null {
    return this.converter.detectProtocol(link);
  }
}
