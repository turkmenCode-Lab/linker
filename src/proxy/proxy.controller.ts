import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
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
import {
  LinkToConfigDto,
  ConfigToLinkDto,
  BulkImportDto,
} from './dtos/proxy.dto';
import type { XRayConfig } from '../xray';

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
  linkToConfig(@Request() req, @Body() body: LinkToConfigDto): Promise<object> {
    return this.proxyService.linkToConfig(body.link, req.user.userId);
  }

  @Post('config-to-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert a full XRay JSON config → share link' })
  @ApiOkResponse({ description: 'Share link string' })
  @ApiBadRequestResponse({ description: 'No proxy outbound found in config' })
  async configToLink(
    @Request() req,
    @Body() body: ConfigToLinkDto,
  ): Promise<{ link: string }> {
    const link = await this.proxyService.configToLink(
      body.config as XRayConfig,
      req.user.userId,
    );
    return { link };
  }

  @Post('bulk-import')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk import links — tolerates partial failures' })
  @ApiOkResponse({ description: 'Imported configs and failed links' })
  bulkImport(@Request() req, @Body() body: BulkImportDto): Promise<object> {
    return this.proxyService.bulkImport(body.links, req.user.userId);
  }
}
