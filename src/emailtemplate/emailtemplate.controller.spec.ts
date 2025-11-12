import { Test, TestingModule } from '@nestjs/testing';
import { EmailtemplateController } from './emailtemplate.controller';

describe('EmailtemplateController', () => {
  let controller: EmailtemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailtemplateController],
    }).compile();

    controller = module.get<EmailtemplateController>(EmailtemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
