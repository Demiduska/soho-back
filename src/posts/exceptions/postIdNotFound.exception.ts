import { NotFoundException } from '@nestjs/common';

class PostIdNotFoundException extends NotFoundException {
  constructor(id: number) {
    super(`Post with id: ${id} not found`);
  }
}

export default PostIdNotFoundException;
