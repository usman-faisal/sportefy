import { Test, TestingModule } from '@nestjs/testing';
import { mediaController } from './media.controller';

describe('mediaController', () => {
  let controller: mediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [mediaController],
    }).compile();

    controller = module.get<mediaController>(mediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
