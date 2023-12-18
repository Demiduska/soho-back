import { NotFoundException } from '@nestjs/common';

class PostNotFoundException extends NotFoundException {
  constructor(slug: string) {
    super(`Post with slug: ${slug} not found`);
  }
}

export default PostNotFoundException;
