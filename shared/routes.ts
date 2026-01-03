import { z } from 'zod';
import {
  insertUserSchema,
  insertEventSchema,
  insertProgrammeSchema,
  insertStaffSchema,
  insertDepartmentSchema,
  insertCommentSchema,
  insertRegistrationSchema,
  events,
  programmes,
  staff,
  departments,
  comments,
  registrations
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: insertUserSchema.omit({ password: true }),
        401: errorSchemas.unauthorized,
      },
    }
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events',
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events',
      input: insertEventSchema,
      responses: {
        201: z.custom<typeof events.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/events/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  programmes: {
    list: {
      method: 'GET' as const,
      path: '/api/programmes',
      responses: {
        200: z.array(z.custom<typeof programmes.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/programmes',
      input: insertProgrammeSchema,
      responses: {
        201: z.custom<typeof programmes.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/programmes/:id',
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  staff: {
    list: {
      method: 'GET' as const,
      path: '/api/staff',
      responses: {
        200: z.array(z.custom<typeof staff.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/staff',
      input: insertStaffSchema,
      responses: {
        201: z.custom<typeof staff.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  departments: {
    list: {
      method: 'GET' as const,
      path: '/api/departments',
      responses: {
        200: z.array(z.custom<typeof departments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/departments',
      input: insertDepartmentSchema,
      responses: {
        201: z.custom<typeof departments.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    }
  },
  comments: {
    list: {
      method: 'GET' as const,
      path: '/api/events/:eventId/comments',
      responses: {
        200: z.array(z.custom<typeof comments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/events/:eventId/comments',
      input: insertCommentSchema.omit({ eventId: true }),
      responses: {
        201: z.custom<typeof comments.$inferSelect>(),
      },
    }
  },
  registrations: {
    list: {
      method: 'GET' as const,
      path: '/api/registrations',
      responses: {
        200: z.array(z.custom<typeof registrations.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/registrations',
      input: insertRegistrationSchema,
      responses: {
        201: z.custom<typeof registrations.$inferSelect>(),
      },
    }
  }
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
