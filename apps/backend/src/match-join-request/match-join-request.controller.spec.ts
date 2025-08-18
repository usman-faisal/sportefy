import { Test, TestingModule } from '@nestjs/testing';
import { MatchJoinRequestController } from './match-join-request.controller';

describe('MatchJoinRequestController', () => {
  let controller: MatchJoinRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchJoinRequestController],
    }).compile();

    controller = module.get<MatchJoinRequestController>(MatchJoinRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
