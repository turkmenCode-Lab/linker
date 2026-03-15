import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './providers/proxy.service';
import { HistoryModule } from '@/history/history.module';

@Module({
  imports: [HistoryModule],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
