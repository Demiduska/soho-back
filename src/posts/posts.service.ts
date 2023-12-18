import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserEntityPg } from '../users/entities/pg/user.entity';
import { PostEntity } from './entities/post.entity';
import { FindManyOptions, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import PostNotFoundException from './exceptions/postNotFound.exception';
//for dev
//import * as sanitizeHtml from 'sanitize-html';
// for prod
import sanitizeHtml from 'sanitize-html';
import { generateSlug } from '../utils/slugify';
import PostIdNotFoundException from './exceptions/postIdNotFound.exception';
import Role from '../roles/role.enum';
import { LocalFileDto } from '../localFiles/dto/localFile.dto';
import LocalFilesService from '../localFiles/localFiles.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private postsRepository: Repository<PostEntity>,
    private localFilesService: LocalFilesService,
  ) {}

  async create(post: CreatePostDto, user: UserEntityPg) {
    // const sanitizedContent = sanitizeHtml(post.content, {
    //   allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    // });
    const slug = await this.createUniqueSlug(post.name);
    const newPost = await this.postsRepository.create({
      ...post,
      slug,
      user: user,
    });
    await this.postsRepository.save(newPost);
    return newPost;
  }

  async update(id: number, post: UpdatePostDto, user: UserEntityPg) {
    // const sanitizedContent = sanitizeHtml(post.content, {
    //   allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    // });
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne({
      where: {
        id,
      },
    });
    if (updatedPost) {
      return updatedPost;
    }
    throw new PostIdNotFoundException(id);
  }

  async findBySlug(slug: string, ignoreErrors: boolean) {
    const post = await this.postsRepository.findOne({
      where: { slug },
    });
    if (post) {
      return post;
    }
    if (!ignoreErrors) {
      throw new PostNotFoundException(slug);
    }
  }

  async createUniqueSlug(title: string): Promise<string> {
    let slug = generateSlug(title);
    let count = 1;
    let exists = await this.findBySlug(slug, true);

    while (exists) {
      slug = `${generateSlug(title)}-${count}`;
      count++;
      exists = await this.findBySlug(slug, true);
    }

    return slug;
  }

  async getPosts(
    offset?: number,
    limit?: number,
    startId?: number,
    options?: FindManyOptions<PostEntity>,
  ) {
    const where: FindManyOptions<PostEntity>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.postsRepository.count();
    }

    const [items, count] = await this.postsRepository.findAndCount({
      where,
      order: {
        id: 'DESC',
      },
      skip: offset,
      take: limit,
      ...options,
    });

    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  async getPostsWithUsers(offset?: number, limit?: number, startId?: number) {
    return this.getPosts(offset, limit, startId, {
      relations: {
        user: false,
        banner: true,
      },
    });
  }

  async uploadBanner(
    postId: number,
    fileData: LocalFileDto,
    user: UserEntityPg,
  ) {
    if (user.role === Role.Admin) {
      const banner = await this.localFilesService.saveLocalFileData(fileData);
      await this.postsRepository.update(postId, {
        banner: banner,
      });

      const updatedPost = await this.postsRepository.findOne({
        where: {
          id: postId,
        },
      });

      if (updatedPost) {
        return updatedPost;
      }
      throw new PostIdNotFoundException(postId);
    }
    throw new HttpException(
      'You dont have rights to edit this post',
      HttpStatus.BAD_REQUEST,
    );
  }

  async removeBanner(postId: number, user: UserEntityPg) {
    if (user.role === Role.Admin) {
      await this.postsRepository.update(postId, {
        banner: null,
      });
      const updatedPost = await this.postsRepository.findOne({
        where: {
          id: postId,
        },
      });
      if (updatedPost) {
        return updatedPost;
      }
      throw new PostIdNotFoundException(postId);
    }
    throw new HttpException(
      'You dont have rights to edit this post',
      HttpStatus.BAD_REQUEST,
    );
  }

  findAll() {
    return `This action returns all posts  `;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  async removePost(id: number) {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostIdNotFoundException(id);
    }
  }
}
