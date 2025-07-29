import { Test, TestingModule } from '@nestjs/testing';
import { MatchPlayerService } from './match-player.service';

describe('MatchPlayerService', () => {
  let service: MatchPlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchPlayerService],
    }).compile();

    service = module.get<MatchPlayerService>(MatchPlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
