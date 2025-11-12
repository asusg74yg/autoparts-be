import { Test, TestingModule } from '@nestjs/testing';
import { AcespiesController } from './acespies.controller';

describe('AcespiesController', () => {
  let controller: AcespiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcespiesController],
    }).compile();

    controller = module.get<AcespiesController>(AcespiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
