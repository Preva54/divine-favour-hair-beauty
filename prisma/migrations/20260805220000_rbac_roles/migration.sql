-- RBAC: expand Role enum (ADMIN -> SUPER_ADMIN, STAFF -> STYLIST) and add RolePermission model

-- 1. Create the new enum with the full role set
CREATE TYPE "Role_new" AS ENUM (
  'CUSTOMER',
  'SUPER_ADMIN',
  'MANAGER',
  'RECEPTIONIST',
  'STYLIST',
  'ACCOUNTANT',
  'INVENTORY_MANAGER',
  'MARKETING_MANAGER',
  'CUSTOMER_SUPPORT'
);

-- 2. Migrate the users table: drop default, recast with value mapping
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE "role"::text
    WHEN 'ADMIN' THEN 'SUPER_ADMIN'
    WHEN 'STAFF' THEN 'STYLIST'
    ELSE "role"::text
  END::"Role_new"
);

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- 3. Replace the old enum
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

-- 4. Create the role permissions table
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- 5. Unique index on (role, permission)
CREATE UNIQUE INDEX "role_permissions_role_permission_key" ON "role_permissions"("role", "permission");
