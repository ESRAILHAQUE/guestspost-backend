/**
 * Package DTOs
 * Data Transfer Objects for package operations
 */

export interface CreatePackageDto {
  name: string;
  price: number;
  description: string;
  features?: string[];
  popular?: boolean;
  offer?: boolean;
  status?: "active" | "inactive";
}

export interface UpdatePackageDto {
  name?: string;
  price?: number;
  description?: string;
  features?: string[];
  popular?: boolean;
  offer?: boolean;
  status?: "active" | "inactive";
}
