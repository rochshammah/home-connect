import { z } from 'zod';
import { insertListingSchema, insertApplicationSchema, listings, applications, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    // Basic user update (role, bio, etc)
    updateProfile: {
      method: 'PATCH' as const,
      path: '/api/user/profile' as const,
      input: z.object({
        role: z.enum(["landlord", "tenant"]).optional(),
        phoneNumber: z.string().optional(),
        bio: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  listings: {
    list: {
      method: 'GET' as const,
      path: '/api/listings' as const,
      input: z.object({
        search: z.string().optional(),
        location: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof listings.$inferSelect & { landlord: typeof users.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/listings/:id' as const,
      responses: {
        200: z.custom<typeof listings.$inferSelect & { landlord: typeof users.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/listings' as const,
      input: insertListingSchema,
      responses: {
        201: z.custom<typeof listings.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/listings/:id' as const,
      input: insertListingSchema.partial(),
      responses: {
        200: z.custom<typeof listings.$inferSelect>(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/listings/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  applications: {
    create: {
      method: 'POST' as const,
      path: '/api/applications' as const,
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    // For landlords to see apps for their listing
    listByListing: {
      method: 'GET' as const,
      path: '/api/listings/:id/applications' as const,
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect & { tenant: typeof users.$inferSelect }>()),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized, // Forbidden
      },
    },
    // For tenants to see their apps
    listMyApplications: {
      method: 'GET' as const,
      path: '/api/my-applications' as const,
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect & { listing: typeof listings.$inferSelect }>()),
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/applications/:id/status' as const,
      input: z.object({
        status: z.enum(["accepted", "rejected"]),
      }),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
