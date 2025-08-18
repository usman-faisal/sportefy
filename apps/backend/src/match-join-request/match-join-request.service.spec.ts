import { Test, TestingModule } from '@nestjs/testing';
import { MatchJoinRequestService } from './match-join-request.service';

describe('MatchJoinRequestService', () => {
  let service: MatchJoinRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchJoinRequestService],
    }).compile();

    service = module.get<MatchJoinRequestService>(MatchJoinRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
