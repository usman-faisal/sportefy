import { Injectable } from '@nestjs/common';
import { SportRepository } from './sport.repository';
import { ResponseBuilder } from 'src/common/utils/response-builder';

@Injectable()
export class SportService {
    constructor(private readonly sportRepository: SportRepository) {}

    async getSports() {
        const sports = await this.sportRepository.getManySports()

        return ResponseBuilder.success(sports, "Retrieved sports")
    }
}
