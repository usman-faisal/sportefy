import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class UploadProofDto {
  @ApiProperty({
    description: 'The URL of the uploaded payment proof screenshot.',
    example: 'https://example.com/proof.jpg',
  })
  @IsUrl()
  @IsNotEmpty()
  screenshotUrl: string;
}
