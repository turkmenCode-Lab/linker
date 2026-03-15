import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { HistoryService } from './providers/history.service';
import { GetHistoryDto } from './dtos/get-history.dto';

@ApiTags('History')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated history for current user' })
  @ApiOkResponse({ description: 'Paginated history items' })
  getHistory(@Request() req, @Query() dto: GetHistoryDto) {
    return this.historyService.getHistory(req.user.userId, dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all history for current user' })
  deleteAll(@Request() req) {
    return this.historyService.deleteAll(req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a single history entry' })
  deleteOne(@Request() req, @Param('id') id: string) {
    return this.historyService.deleteOne(req.user.userId, id);
  }
}
