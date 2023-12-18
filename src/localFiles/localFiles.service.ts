import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalFileDto } from './dto/localFile.dto';
import LocalFile from './entities/localFile.entity';
import ImageNotFoundException from './exceptions/imageNotFound.exception';

@Injectable()
class LocalFilesService {
  constructor(
    @InjectRepository(LocalFile)
    private localFilesRepository: Repository<LocalFile>,
  ) {}

  async saveLocalFileData(fileData: LocalFileDto) {
    const newFile = await this.localFilesRepository.create(fileData);
    await this.localFilesRepository.save(newFile);
    return newFile;
  }

  async getFileById(fileId: number) {
    const file = await this.localFilesRepository.findOne({
      where: { id: fileId },
    });
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }
  async deleteById(id: number) {
    const deleteResponse = await this.localFilesRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new ImageNotFoundException(id);
    }
  }
}

export default LocalFilesService;
