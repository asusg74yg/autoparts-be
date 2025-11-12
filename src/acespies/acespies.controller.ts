import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AcespiesService } from './acespies.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './config/multer.config';

@Controller('acespies')
export class AcespiesController {
  constructor(private readonly acespiesService: AcespiesService) {}

  @MessagePattern('aces_message')
  async appendLog(@Payload() payload: any) {
    return await this.acespiesService.handleAcesPiesCreation(payload.data);
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'aces', maxCount: 1 },
        { name: 'pies', maxCount: 1 },
      ],
      multerConfig,
    ),
  )
  uploadFile(
    @Req() req: any,
    @UploadedFiles()
    files: {
      aces: Express.Multer.File[];
      pies: Express.Multer.File[];
    },
  ) {
    console.log(req.ip);
    return this.acespiesService.handleETL(
      files.aces[0]?.path,
      files.pies[0]?.path,
    );
  }
}
