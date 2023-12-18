import { NotFoundException } from '@nestjs/common';

class ImageNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Image with id ${id} not found`);
  }
}

export default ImageNotFoundException;
