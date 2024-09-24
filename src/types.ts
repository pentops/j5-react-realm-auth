export interface J5StateV1StateMetadata {
  // format: date-time
  createdAt?: string;
  // format: date-time
  updatedAt?: string;
  // format: UINT64
  lastSequence?: string;
}

export interface J5RealmV1TenantType {
  // pattern: ^[a-z0-9-]+$
  name?: string;
  label?: string;
  singular?: boolean;
}

export interface J5RealmV1TenantSpec {
  name?: string;
  metadata?: Record<string, string>;
}

export interface J5RealmV1TenantStateData {
  spec?: J5RealmV1TenantSpec;
}

export enum J5RealmV1TenantStatus {
  Unspecified = 'UNSPECIFIED',
  Active = 'ACTIVE',
}

export interface J5RealmV1TenantState {
  metadata: J5StateV1StateMetadata;
  // format: uuid
  tenantId?: string;
  // format: uuid
  realmId?: string;
  tenantType?: string;
  status: J5RealmV1TenantStatus;
  data: J5RealmV1TenantStateData;
}

export interface J5RealmV1RealmSpec {
  name?: string;
  // pattern: ^[a-z0-9-]+$
  type?: string;
  baseUrl?: string;
  tenantTypes?: J5RealmV1TenantType[];
  metadata?: Record<string, string>;
}

export interface J5RealmV1RealmStateData {
  spec?: J5RealmV1RealmSpec;
}

export enum J5RealmV1RealmStatus {
  Unspecified = 'UNSPECIFIED',
  Active = 'ACTIVE',
}

export interface J5RealmV1RealmState {
  metadata: J5StateV1StateMetadata;
  // format: uuid
  realmId?: string;
  status: J5RealmV1RealmStatus;
  data: J5RealmV1RealmStateData;
}

export interface RealmAccess {
  realm: J5RealmV1RealmState;
  tenant: J5RealmV1TenantState;
}

export interface WhoAmIContext<TRealmAccess extends RealmAccess = RealmAccess> {
  accesses: TRealmAccess[];
}
