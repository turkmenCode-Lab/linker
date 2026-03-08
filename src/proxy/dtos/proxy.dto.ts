import { IsString, IsNotEmpty, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkToConfigDto {
  @ApiProperty({
    description: 'A V2Ray / XRay share link',
    example:
      'vless://03b063c7-44a4-4895-8708-3acafacd2b1a@216.239.38.55:443' +
      '?encryption=none&security=tls&type=ws&sni=google.ru#MyServer',
  })
  @IsString()
  @IsNotEmpty()
  link!: string;
}

export class ConfigToLinkDto {
  @ApiProperty({
    description: 'A full XRay JSON config object',
    example: {
      remarks: 'My Server',
      outbounds: [
        {
          protocol: 'vless',
          settings: {
            vnext: [
              {
                address: '1.2.3.4',
                port: 443,
                users: [{ id: 'uuid-here', encryption: 'none' }],
              },
            ],
          },
          streamSettings: { network: 'ws', security: 'tls' },
        },
      ],
    },
  })
  @IsObject()
  @IsNotEmpty()
  config!: Record<string, unknown>;
}

export class BulkImportDto {
  @ApiProperty({
    description: 'Array of V2Ray / XRay share links',
    type: [String],
    example: [
      'vless://uuid@host:443?encryption=none&security=tls&type=ws#Server1',
      'vmess://base64encodedpayload',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  links!: string[];
}
