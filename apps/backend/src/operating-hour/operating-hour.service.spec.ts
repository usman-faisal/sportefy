import { Test, TestingModule } from '@nestjs/testing';
import { OperatingHourService } from './operating-hour.service';

describe('OperatingHourService', () => {
  let service: OperatingHourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OperatingHourService],
    }).compile();

    service = module.get<OperatingHourService>(OperatingHourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
