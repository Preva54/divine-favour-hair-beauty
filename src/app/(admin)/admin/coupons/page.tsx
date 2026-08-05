import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatDate, formatZAR } from "@/lib/utils";
import { deleteCouponAction, toggleCouponActiveAction } from "@/lib/actions/admin-content";
import { ToggleButton } from "@/components/admin/toggle-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { CouponForm } from "@/components/admin/coupon-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Coupons" };

export default async function AdminCouponsPage() {
  await requirePermission("coupons:view");
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Coupons</h2>
          <p className="text-sm text-muted-foreground">
            {coupons.filter((c) => c.active).length} active discount codes redeemable at checkout.
          </p>
        </div>
        <CouponForm />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Code</th>
                  <th className="px-5 py-3.5 font-semibold">Value</th>
                  <th className="px-5 py-3.5 font-semibold">Min spend</th>
                  <th className="px-5 py-3.5 font-semibold">Usage</th>
                  <th className="px-5 py-3.5 font-semibold">Expires</th>
                  <th className="px-5 py-3.5 font-semibold">Active</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((c) => {
                  const expired = c.expiresAt && c.expiresAt < new Date();
                  return (
                    <tr key={c.id} className="transition hover:bg-ivory/40">
                      <td className="px-5 py-3.5">
                        <p className="font-mono font-semibold">{c.code}</p>
                        <p className="text-xs text-muted-foreground capitalize">{c.type.toLowerCase()}</p>
                      </td>
                      <td className="px-5 py-3.5 font-medium">
                        {c.type === "FIXED" ? formatZAR(c.value) : `${c.value}%`}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{c.minSpend ? formatZAR(c.minSpend) : "—"}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {c.usageCount}
                        {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td className="px-5 py-3.5">
                        {c.expiresAt ? (
                          <Badge variant={expired ? "danger" : "neutral"}>{formatDate(c.expiresAt)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <ToggleButton
                          on={c.active && !expired}
                          id={c.id}
                          onToggle={toggleCouponActiveAction}
                          label={c.active ? "Deactivate coupon" : "Activate coupon"}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <CouponForm
                            coupon={{
                              id: c.id,
                              code: c.code,
                              type: c.type,
                              value: c.value,
                              minSpend: c.minSpend,
                              maxDiscount: c.maxDiscount,
                              expiresAt: c.expiresAt ? c.expiresAt.toISOString().slice(0, 10) : null,
                              usageLimit: c.usageLimit,
                              active: c.active,
                            }}
                          />
                          <DeleteButton id={c.id} label="coupon" onDelete={deleteCouponAction} confirm={`Delete coupon ${c.code}?`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}