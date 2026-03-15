import { Protocol, XRayConfig, XRayConverter } from '../../xray';
import { Injectable, BadRequestException } from '@nestjs/common';
import { HistoryService } from '../../history/providers/history.service';

@Injectable()
export class ProxyService {
  private readonly converter = new XRayConverter();

  constructor(private readonly historyService: HistoryService) {}

  async linkToConfig(link: string, userId?: string): Promise<XRayConfig> {
    const result = this.converter.linkToConfig(link);
    if (!result.success) {
      if (userId)
        await this.historyService.record({
          userId,
          action: 'link_to_config',
          input: { link },
          success: false,
          error: result.error,
        });
      throw new BadRequestException(`Invalid proxy link: ${result.error}`);
    }
    if (userId)
      await this.historyService.record({
        userId,
        action: 'link_to_config',
        input: { link },
        output: result.data as unknown as Record<string, unknown>,
        success: true,
      });
    return result.data;
  }

  async configToLink(config: XRayConfig, userId?: string): Promise<string> {
    const result = this.converter.configToLink(config);
    if (!result.success) {
      if (userId)
        await this.historyService.record({
          userId,
          action: 'config_to_link',
          input: config as unknown as Record<string, unknown>,
          success: false,
          error: result.error,
        });
      throw new BadRequestException(`Cannot convert config: ${result.error}`);
    }
    if (userId)
      await this.historyService.record({
        userId,
        action: 'config_to_link',
        input: config as unknown as Record<string, unknown>,
        output: { link: result.data },
        success: true,
      });
    return result.data;
  }

  async bulkImport(
    links: string[],
    userId?: string,
  ): Promise<{
    imported: XRayConfig[];
    failed: { link: string; reason: string }[];
  }> {
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

    if (userId)
      await this.historyService.record({
        userId,
        action: 'bulk_import',
        input: { links },
        output: { imported: imported.length, failed: failed.length },
        success: true,
      });

    return { imported, failed };
  }

  sniffProtocol(link: string): Protocol | null {
    return this.converter.detectProtocol(link);
  }
}
