import slugify from 'slugify';

export function generateSlug(slug: string): string {
  return slugify(slug, { lower: true, remove: /[*~.()'"!:@]/g, strict: true });
}
