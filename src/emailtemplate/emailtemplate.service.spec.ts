import { Test, TestingModule } from '@nestjs/testing';
import { EmailtemplateService } from './emailtemplate.service';

describe('EmailtemplateService', () => {
  let service: EmailtemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailtemplateService],
    }).compile();

    service = module.get<EmailtemplateService>(EmailtemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
