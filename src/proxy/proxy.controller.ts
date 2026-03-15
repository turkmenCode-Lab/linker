import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProxyService } from './providers/proxy.service';
import { XRayConfig } from '../xray/types/index';

import {
  LinkToConfigDto,
  ConfigToLinkDto,
  BulkImportDto,
} from './dtos/proxy.dto';

@ApiTags('Proxy')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('link-to-config')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert a share link → full XRay JSON config' })
  @ApiOkResponse({ description: 'XRay config object' })
  @ApiBadRequestResponse({ description: 'Invalid or unsupported link format' })
  linkToConfig(@Body() body: LinkToConfigDto): object {
    return this.proxyService.linkToConfig(body.link);
  }

  @Post('config-to-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert a full XRay JSON config → share link' })
  @ApiOkResponse({
    description: 'Share link string',
    schema: { example: { link: 'vless://...' } },
  })
  @ApiBadRequestResponse({ description: 'No proxy outbound found in config' })
  configToLink(@Body() body: ConfigToLinkDto): { link: string } {
    const link = this.proxyService.configToLink(body.config as XRayConfig);
    return { link };
  }

  @Post('bulk-import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk import links — tolerates partial failures' })
  @ApiOkResponse({
    description: 'Imported configs and list of failed links with reasons',
    schema: {
      example: {
        imported: [{ remarks: 'Server1', outbounds: [] }],
        failed: [{ link: 'bad://link', reason: 'Unsupported protocol' }],
      },
    },
  })
  bulkImport(@Body() body: BulkImportDto): object {
    return this.proxyService.bulkImport(body.links);
  }
}
