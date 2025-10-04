import { date, symbol, z } from "zod";

export const investorSchema = z.object({
    name: z.string().min(3, 'Investor name must be at least 3 characters'),
    description: z.string().min(15, 'Description must be at least 15 characters').max(500, 'Description cannot exceed 500 characters'),
    logo: z.string().optional(),
    logoAltText: z.string().optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    socialLinks: z
        .array(
            z.object({
                type: z.enum(['twitter', 'linkedin', "facebook", "telegram"]),
                url: z.string().url('Invalid URL'),
            })
        )
        .optional(),
})

export const projectDetailsSchema = z.object({

    slug: z.string().min(3, {
        message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    }).regex(/^[a-z0-9-]+$/, {
        message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    }),
    name: z.string().min(3, {
        message: 'Project name must be at least 3 characters.',
    }),
    symbol: z.string().min(3, {
        message: 'Symbol must be at least 2 characters.',
    }).optional().nullable(),
    title: z.string().min(3, {
        message: 'Title must be at least 3 characters.',
    }).optional().nullable(),
    description: z.string().min(15, {
        message: 'Description must be at least 15 characters.',
    }).max(5000).optional().nullable(),
    logo: z.string().optional().nullable(),
    logoAltText: z.string().optional(),
    category: z.array(z.string()).optional().nullable(),
    links: z
        .array(
            z.object({
                type: z.enum(['website' , 'twitter', 'linkedin', "facebook", "telegram"]),
                url: z.string().url('Invalid URL'),
            })
        )
        .optional().nullable(),
    metaTitle: z.string().max(100, {
        message: 'SEO title should be 60 characters or less.'
    }).optional().nullable(),
    metaDescription: z.string().max(300, {
        message: 'SEO description should be 300 characters or less.'
    }).optional().nullable(),
    metaImage: z.string().optional().nullable(),
    metaKeywords: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']).default('DRAFT'),
});

export const projectRoundsSchema = z.object({
    title: z.string().min(2, {
        message: 'Round title must be at least 2 characters.',
    }),
    description: z.string().optional(),
    date: z.string().optional(),
    amount: z.string().optional(),
    type: z.string().optional(),
});

export const investorDetailsSchema = z.object({

    slug: z.string().min(3, {
        message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    }).regex(/^[a-z0-9-]+$/, {
        message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    }),
    name: z.string().min(3, {
        message: 'Project name must be at least 3 characters.',
    }),
    description: z.string().min(15, {
        message: 'Description must be at least 15 characters.',
    }).max(5000).optional(),
    logo: z.string().optional(),
    logoAltText: z.string().optional(),
    category: z.array(z.string()).optional(),
    links: z
        .array(
            z.object({
                type: z.enum(['website' , 'twitter', 'linkedin', "facebook", "telegram"]),
                url: z.string().url('Invalid URL'),
            })
        )
        .optional(),
    metaTitle: z.string().max(100, {
        message: 'SEO title should be 60 characters or less.'
    }).optional(),
    metaDescription: z.string().max(300, {
        message: 'SEO description should be 300 characters or less.'
    }).optional(),
    metaImage: z.string().optional(),
    metaKeywords: z.string().optional(),
    status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'REJECTED']).default('DRAFT'),
});

