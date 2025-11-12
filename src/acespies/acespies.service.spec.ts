import { Test, TestingModule } from '@nestjs/testing';
import { AcespiesService } from './acespies.service';

describe('AcespiesService', () => {
  let service: AcespiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcespiesService],
    }).compile();

    service = module.get<AcespiesService>(AcespiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
