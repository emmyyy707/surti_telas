import { Prisma, PrismaClient } from '@prisma/client';
import { CmsPage } from '../../domain/entities/CmsPage';
import type {
  CmsPageRepository,
  CreateCmsInput,
  UpdateCmsInput,
  CmsFilters,
} from '../../domain/repositories/CmsPageRepository';

const toCmsPage = (row: Prisma.CmsPageGetPayload<object>): CmsPage => ({
  id: row.id,
  slug: row.slug,
  titulo: row.titulo,
  contenido: row.contenido ?? undefined,
  publicado: row.publicado ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  deletedAt: row.deletedAt ?? undefined,
});

export class PrismaCmsPageRepository implements CmsPageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: CmsFilters): Promise<CmsPage[]> {
    const where: Prisma.CmsPageWhereInput = {
      ...(filters.slug ? { slug: { equals: filters.slug, mode: 'insensitive' } } : {}),
      deletedAt: null,
    };

    const rows = await this.prisma.cmsPage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toCmsPage);
  }

  async getById(id: string): Promise<CmsPage | null> {
    const row = await this.prisma.cmsPage.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? new CmsPage(toCmsPage(row)) : null;
  }

  async getBySlug(slug: string): Promise<CmsPage | null> {
    const row = await this.prisma.cmsPage.findFirst({
      where: { slug, deletedAt: null },
    });
    return row ? new CmsPage(toCmsPage(row)) : null;
  }

  async create(input: CreateCmsInput): Promise<CmsPage> {
    const row = await this.prisma.cmsPage.create({
      data: {
        slug: input.slug,
        titulo: input.titulo,
        contenido: input.contenido,
        publicado: input.publicado ?? false,
      },
    });
    return new CmsPage(toCmsPage(row));
  }

  async update(id: string, changes: UpdateCmsInput): Promise<CmsPage> {
    const row = await this.prisma.cmsPage.update({
      where: { id },
      data: {
        ...(changes.slug !== undefined ? { slug: changes.slug } : {}),
        ...(changes.titulo !== undefined ? { titulo: changes.titulo } : {}),
        ...(changes.contenido !== undefined ? { contenido: changes.contenido } : {}),
        ...(changes.publicado !== undefined ? { publicado: changes.publicado } : {}),
      },
    });
    return new CmsPage(toCmsPage(row));
  }
}
