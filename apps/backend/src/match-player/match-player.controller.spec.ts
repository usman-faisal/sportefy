import { Test, TestingModule } from '@nestjs/testing';
import { MatchPlayerController } from './match-player.controller';

describe('MatchPlayerController', () => {
  let controller: MatchPlayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchPlayerController],
    }).compile();

    controller = module.get<MatchPlayerController>(MatchPlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
