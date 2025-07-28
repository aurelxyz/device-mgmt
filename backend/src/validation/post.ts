import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// --------------------------------------------------------------------------------------------
export const CreatePostSchema = z.object({
  title: z.string().min(1).openapi({ description: 'Post title' }),
  content: z.string().min(1).openapi({ description: 'Post content' }),
  authorId: z.uuid().openapi({ description: 'Post author unique identifier' }),
});

export const PostSchema = CreatePostSchema.extend({
  id: z.uuid().openapi({ description: 'Unique identifier for the post' }),
});

export type CreatePost = z.infer<typeof CreatePostSchema>;
export type Post = z.infer<typeof PostSchema>;

// --------------------------------------------------------------------------------------------
export const CreateCommentSchema = z.object({
  postId: z.uuid().openapi({ description: 'Unique identifier for the post where comment belongs' }),
  content: z.string().min(1).openapi({ description: 'Comment text' }),
  authorId: z.string().uuid().openapi({ description: 'Unique identifier for the author' }),
});

export const CommentSchema = CreateCommentSchema.extend({
  id: z.string().uuid().openapi({ description: 'Unique identifier for the comment' }),
});

export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type Comment = z.infer<typeof CommentSchema>;