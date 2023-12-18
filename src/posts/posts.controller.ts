import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import RoleGuard from '../roles/role.guard';
import Role from '../roles/role.enum';
import RequestWithUser from '../auth/requestWithUser.interface';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationParams } from '../utils/types/paginationParams';
import S3FilesInterceptor from '../localFiles/s3-files.interceptor';

@Controller('posts')
@UseInterceptors(ClassSerializerInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(RoleGuard(Role.Admin))
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req: RequestWithUser) {
    return this.postsService.create(createPostDto, req.user);
  }

  @UseInterceptors(CacheInterceptor)
  @Get()
  async getPosts(
    // @Query('search') search: string,
    @Query()
    { offset, limit, startId }: PaginationParams,
  ) {
    // if (search) {
    //   return this.serversService.searchForPosts(search, offset, limit, startId);
    // }
    return await this.postsService.getPostsWithUsers(offset, limit, startId);
  }

  @UseInterceptors(CacheInterceptor)
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug, false);
  }

  @UseGuards(RoleGuard(Role.Admin))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.update(+id, updatePostDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RoleGuard(Role.Admin))
  remove(@Param('id') id: string) {
    return this.postsService.removePost(+id);
  }

  @Patch('upload/banner/:id')
  @UseGuards(RoleGuard(Role.Admin))
  @UseInterceptors(
    S3FilesInterceptor({
      fieldName: 'image',
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(
            new BadRequestException('Provide a valid image'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: Math.pow(2048, 2), // 2MB
      },
    }),
  )
  async uploadBanner(
    @Param('id') id: number,
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return this.postsService.uploadBanner(
      id,
      {
        key: file.key,
        location: file.location,
      },
      request.user,
    );
  }

  @Delete('banner/:id')
  @UseGuards(RoleGuard(Role.Admin))
  async removeAvatar(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.postsService.removeBanner(+id, request.user);
  }
}
