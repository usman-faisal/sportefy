import { Test, TestingModule } from '@nestjs/testing';
import { OperatingHourController } from './operating-hour.controller';

describe('OperatingHourController', () => {
  let controller: OperatingHourController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperatingHourController],
    }).compile();

    controller = module.get<OperatingHourController>(OperatingHourController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
