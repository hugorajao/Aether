import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const artworks = sqliteTable('artworks', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  artistName: text('artist_name').notNull(),
  artistStatement: text('artist_statement'),
  description: text('description'),
  type: text('type', { enum: ['generative', 'community'] }).notNull(),
  medium: text('medium'),
  aiTool: text('ai_tool'),
  prompt: text('prompt'),
  tags: text('tags'),
  imagePath: text('image_path'),
  thumbnailPath: text('thumbnail_path'),
  width: integer('width'),
  height: integer('height'),
  dominantColor: text('dominant_color'),
  colorPalette: text('color_palette'),
  aspectRatio: real('aspect_ratio'),
  fileSizeBytes: integer('file_size_bytes'),
  generativeConfig: text('generative_config'),
  exhibitionId: text('exhibition_id').references(() => exhibitions.id),
  exhibitionOrder: integer('exhibition_order'),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const exhibitions = sqliteTable('exhibitions', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  curatorNote: text('curator_note'),
  coverImagePath: text('cover_image_path'),
  themeColor: text('theme_color'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const docentMessages = sqliteTable('docent_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  artworkId: text('artwork_id').references(() => artworks.id),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export type Artwork = typeof artworks.$inferSelect;
export type NewArtwork = typeof artworks.$inferInsert;
export type Exhibition = typeof exhibitions.$inferSelect;
export type NewExhibition = typeof exhibitions.$inferInsert;
export type DocentMessage = typeof docentMessages.$inferSelect;
export type NewDocentMessage = typeof docentMessages.$inferInsert;
