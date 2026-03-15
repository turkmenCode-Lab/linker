import { IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetHistoryDto {
  @ApiPropertyOptional({
    enum: ['link_to_config', 'config_to_link', 'bulk_import', 'subscription'],
  })
  @IsOptional()
  @IsEnum(['link_to_config', 'config_to_link', 'bulk_import', 'subscription'])
  action?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
