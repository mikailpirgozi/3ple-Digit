import { z } from 'zod';
export declare const createLiabilitySchema: z.ZodObject<
  {
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    currentBalance: z.ZodNumber;
    interestRate: z.ZodOptional<z.ZodNumber>;
    maturityDate: z.ZodOptional<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    currentBalance: number;
    description?: string | undefined;
    interestRate?: number | undefined;
    maturityDate?: Date | undefined;
  },
  {
    name: string;
    currentBalance: number;
    description?: string | undefined;
    interestRate?: number | undefined;
    maturityDate?: Date | undefined;
  }
>;
export declare const updateLiabilitySchema: z.ZodObject<
  {
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    currentBalance: z.ZodOptional<z.ZodNumber>;
    interestRate: z.ZodOptional<z.ZodNumber>;
    maturityDate: z.ZodOptional<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name?: string | undefined;
    description?: string | undefined;
    currentBalance?: number | undefined;
    interestRate?: number | undefined;
    maturityDate?: Date | undefined;
  },
  {
    name?: string | undefined;
    description?: string | undefined;
    currentBalance?: number | undefined;
    interestRate?: number | undefined;
    maturityDate?: Date | undefined;
  }
>;
export declare const getLiabilitiesQuerySchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<
      z.ZodEnum<['name', 'currentBalance', 'interestRate', 'maturityDate', 'createdAt']>
    >;
    sortOrder: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    sortBy: 'name' | 'createdAt' | 'currentBalance' | 'interestRate' | 'maturityDate';
    sortOrder: 'asc' | 'desc';
    search?: string | undefined;
  },
  {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    sortBy?: 'name' | 'createdAt' | 'currentBalance' | 'interestRate' | 'maturityDate' | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
  }
>;
export declare const liabilityResponseSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    currentBalance: z.ZodNumber;
    interestRate: z.ZodNullable<z.ZodNumber>;
    maturityDate: z.ZodNullable<z.ZodDate>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    description: string | null;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    currentBalance: number;
    interestRate: number | null;
    maturityDate: Date | null;
  },
  {
    name: string;
    description: string | null;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    currentBalance: number;
    interestRate: number | null;
    maturityDate: Date | null;
  }
>;
export type CreateLiabilityRequest = z.infer<typeof createLiabilitySchema>;
export type UpdateLiabilityRequest = z.infer<typeof updateLiabilitySchema>;
export type GetLiabilitiesQuery = z.infer<typeof getLiabilitiesQuerySchema>;
export type LiabilityResponse = z.infer<typeof liabilityResponseSchema>;
//# sourceMappingURL=schema.d.ts.map
