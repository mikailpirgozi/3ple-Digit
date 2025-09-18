import { z } from 'zod';
export declare const AssetType: {
  readonly POZICKY: 'PÔŽIČKY';
  readonly NEHNUTELNOSTI: 'NEHNUTEĽNOSTI';
  readonly AUTA: 'AUTÁ';
  readonly AKCIE: 'AKCIE';
  readonly MATERIAL: 'MATERIÁL';
  readonly PODIEL_VO_FIRME: 'PODIEL VO FIRME';
};
export type AssetTypeEnum = (typeof AssetType)[keyof typeof AssetType];
export declare const AssetEventType: {
  readonly VALUATION: 'VALUATION';
  readonly PAYMENT_IN: 'PAYMENT_IN';
  readonly PAYMENT_OUT: 'PAYMENT_OUT';
  readonly CAPEX: 'CAPEX';
  readonly NOTE: 'NOTE';
  readonly SALE: 'SALE';
};
export type AssetEventTypeEnum = (typeof AssetEventType)[keyof typeof AssetEventType];
export declare const createAssetSchema: z.ZodObject<
  {
    name: z.ZodString;
    type: z.ZodEnum<['PÔŽIČKY', 'NEHNUTEĽNOSTI', 'AUTÁ', 'AKCIE', 'MATERIÁL', 'PODIEL VO FIRME']>;
    category: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    currentValue: z.ZodNumber;
    acquiredPrice: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    type: 'PÔŽIČKY' | 'NEHNUTEĽNOSTI' | 'AUTÁ' | 'AKCIE' | 'MATERIÁL' | 'PODIEL VO FIRME';
    currentValue: number;
    category?: string | undefined;
    description?: string | undefined;
    acquiredPrice?: number | undefined;
  },
  {
    name: string;
    type: 'PÔŽIČKY' | 'NEHNUTEĽNOSTI' | 'AUTÁ' | 'AKCIE' | 'MATERIÁL' | 'PODIEL VO FIRME';
    currentValue: number;
    category?: string | undefined;
    description?: string | undefined;
    acquiredPrice?: number | undefined;
  }
>;
export declare const updateAssetSchema: z.ZodObject<
  {
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<
      z.ZodEnum<['PÔŽIČKY', 'NEHNUTEĽNOSTI', 'AUTÁ', 'AKCIE', 'MATERIÁL', 'PODIEL VO FIRME']>
    >;
    category: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    currentValue: z.ZodOptional<z.ZodNumber>;
    acquiredPrice: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<['ACTIVE', 'SOLD']>>;
    salePrice: z.ZodOptional<z.ZodNumber>;
    saleDate: z.ZodOptional<z.ZodDate>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name?: string | undefined;
    type?:
      | 'PÔŽIČKY'
      | 'NEHNUTEĽNOSTI'
      | 'AUTÁ'
      | 'AKCIE'
      | 'MATERIÁL'
      | 'PODIEL VO FIRME'
      | undefined;
    status?: 'ACTIVE' | 'SOLD' | undefined;
    category?: string | undefined;
    description?: string | undefined;
    currentValue?: number | undefined;
    acquiredPrice?: number | undefined;
    salePrice?: number | undefined;
    saleDate?: Date | undefined;
  },
  {
    name?: string | undefined;
    type?:
      | 'PÔŽIČKY'
      | 'NEHNUTEĽNOSTI'
      | 'AUTÁ'
      | 'AKCIE'
      | 'MATERIÁL'
      | 'PODIEL VO FIRME'
      | undefined;
    status?: 'ACTIVE' | 'SOLD' | undefined;
    category?: string | undefined;
    description?: string | undefined;
    currentValue?: number | undefined;
    acquiredPrice?: number | undefined;
    salePrice?: number | undefined;
    saleDate?: Date | undefined;
  }
>;
export declare const createAssetEventSchema: z.ZodObject<
  {
    assetId: z.ZodString;
    type: z.ZodEnum<['VALUATION', 'PAYMENT_IN', 'PAYMENT_OUT', 'CAPEX', 'NOTE', 'SALE']>;
    amount: z.ZodNumber;
    date: z.ZodDate;
    note: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    type: 'VALUATION' | 'PAYMENT_IN' | 'PAYMENT_OUT' | 'CAPEX' | 'NOTE' | 'SALE';
    date: Date;
    assetId: string;
    amount: number;
    note?: string | undefined;
  },
  {
    type: 'VALUATION' | 'PAYMENT_IN' | 'PAYMENT_OUT' | 'CAPEX' | 'NOTE' | 'SALE';
    date: Date;
    assetId: string;
    amount: number;
    note?: string | undefined;
  }
>;
export declare const updateAssetEventSchema: z.ZodObject<
  {
    type: z.ZodOptional<
      z.ZodEnum<['VALUATION', 'PAYMENT_IN', 'PAYMENT_OUT', 'CAPEX', 'NOTE', 'SALE']>
    >;
    amount: z.ZodOptional<z.ZodNumber>;
    date: z.ZodOptional<z.ZodDate>;
    note: z.ZodOptional<z.ZodString>;
  },
  'strip',
  z.ZodTypeAny,
  {
    type?: 'VALUATION' | 'PAYMENT_IN' | 'PAYMENT_OUT' | 'CAPEX' | 'NOTE' | 'SALE' | undefined;
    date?: Date | undefined;
    amount?: number | undefined;
    note?: string | undefined;
  },
  {
    type?: 'VALUATION' | 'PAYMENT_IN' | 'PAYMENT_OUT' | 'CAPEX' | 'NOTE' | 'SALE' | undefined;
    date?: Date | undefined;
    amount?: number | undefined;
    note?: string | undefined;
  }
>;
export declare const getAssetsQuerySchema: z.ZodObject<
  {
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<
      z.ZodEnum<['PÔŽIČKY', 'NEHNUTEĽNOSTI', 'AUTÁ', 'AKCIE', 'MATERIÁL', 'PODIEL VO FIRME']>
    >;
    sortBy: z.ZodDefault<z.ZodEnum<['name', 'type', 'currentValue', 'createdAt']>>;
    sortOrder: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    sortBy: 'name' | 'type' | 'currentValue' | 'createdAt';
    sortOrder: 'asc' | 'desc';
    type?:
      | 'PÔŽIČKY'
      | 'NEHNUTEĽNOSTI'
      | 'AUTÁ'
      | 'AKCIE'
      | 'MATERIÁL'
      | 'PODIEL VO FIRME'
      | undefined;
    search?: string | undefined;
    q?: string | undefined;
  },
  {
    type?:
      | 'PÔŽIČKY'
      | 'NEHNUTEĽNOSTI'
      | 'AUTÁ'
      | 'AKCIE'
      | 'MATERIÁL'
      | 'PODIEL VO FIRME'
      | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    q?: string | undefined;
    sortBy?: 'name' | 'type' | 'currentValue' | 'createdAt' | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
  }
>;
export declare const getAssetEventsQuerySchema: z.ZodObject<
  {
    assetId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<
      z.ZodEnum<['VALUATION', 'PAYMENT_IN', 'PAYMENT_OUT', 'CAPEX', 'NOTE', 'SALE']>
    >;
    dateFrom: z.ZodOptional<z.ZodDate>;
    dateTo: z.ZodOptional<z.ZodDate>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<['date', 'amount', 'createdAt']>>;
    sortOrder: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    page: number;
    limit: number;
    sortBy: 'date' | 'amount' | 'createdAt';
    sortOrder: 'asc' | 'desc';
    type?: 'VALUATION' | 'PAYMENT_IN' | 'PAYMENT_OUT' | 'CAPEX' | 'NOTE' | 'SALE' | undefined;
    assetId?: string | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
  },
  {
    type?: 'VALUATION' | 'PAYMENT_IN' | 'PAYMENT_OUT' | 'CAPEX' | 'NOTE' | 'SALE' | undefined;
    assetId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: 'date' | 'amount' | 'createdAt' | undefined;
    sortOrder?: 'asc' | 'desc' | undefined;
    dateFrom?: Date | undefined;
    dateTo?: Date | undefined;
  }
>;
export declare const assetResponseSchema: z.ZodObject<
  {
    id: z.ZodString;
    name: z.ZodString;
    type: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    currentValue: z.ZodNumber;
    status: z.ZodOptional<z.ZodString>;
    acquiredPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    salePrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    saleDate: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    eventsCount: z.ZodOptional<z.ZodNumber>;
    totalInflows: z.ZodOptional<z.ZodNumber>;
    totalOutflows: z.ZodOptional<z.ZodNumber>;
  },
  'strip',
  z.ZodTypeAny,
  {
    name: string;
    type: string;
    description: string | null;
    currentValue: number;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    status?: string | undefined;
    acquiredPrice?: number | null | undefined;
    salePrice?: number | null | undefined;
    saleDate?: Date | null | undefined;
    eventsCount?: number | undefined;
    totalInflows?: number | undefined;
    totalOutflows?: number | undefined;
  },
  {
    name: string;
    type: string;
    description: string | null;
    currentValue: number;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    status?: string | undefined;
    acquiredPrice?: number | null | undefined;
    salePrice?: number | null | undefined;
    saleDate?: Date | null | undefined;
    eventsCount?: number | undefined;
    totalInflows?: number | undefined;
    totalOutflows?: number | undefined;
  }
>;
export declare const assetEventResponseSchema: z.ZodObject<
  {
    id: z.ZodString;
    assetId: z.ZodString;
    type: z.ZodString;
    amount: z.ZodNumber;
    date: z.ZodDate;
    note: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    asset: z.ZodOptional<
      z.ZodObject<
        {
          id: z.ZodString;
          name: z.ZodString;
          type: z.ZodString;
        },
        'strip',
        z.ZodTypeAny,
        {
          name: string;
          type: string;
          id: string;
        },
        {
          name: string;
          type: string;
          id: string;
        }
      >
    >;
  },
  'strip',
  z.ZodTypeAny,
  {
    type: string;
    date: Date;
    assetId: string;
    amount: number;
    note: string | null;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    asset?:
      | {
          name: string;
          type: string;
          id: string;
        }
      | undefined;
  },
  {
    type: string;
    date: Date;
    assetId: string;
    amount: number;
    note: string | null;
    createdAt: Date;
    id: string;
    updatedAt: Date;
    asset?:
      | {
          name: string;
          type: string;
          id: string;
        }
      | undefined;
  }
>;
export type CreateAssetRequest = z.infer<typeof createAssetSchema>;
export type UpdateAssetRequest = z.infer<typeof updateAssetSchema>;
export type CreateAssetEventRequest = z.infer<typeof createAssetEventSchema>;
export type UpdateAssetEventRequest = z.infer<typeof updateAssetEventSchema>;
export type GetAssetsQuery = z.infer<typeof getAssetsQuerySchema>;
export type GetAssetEventsQuery = z.infer<typeof getAssetEventsQuerySchema>;
export type AssetResponse = z.infer<typeof assetResponseSchema>;
export type AssetEventResponse = z.infer<typeof assetEventResponseSchema>;
//# sourceMappingURL=schema.d.ts.map
