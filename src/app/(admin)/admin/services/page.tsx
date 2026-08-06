import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatZAR } from "@/lib/utils";
import { ActiveToggle } from "@/components/admin/active-toggle";
import { ServiceForm, type ServiceFormData } from "@/components/admin/service-form";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Services" };

export default async function AdminServicesPage() {
  const session = await requirePermission("services:view");
  const canManage = await prisma.rolePermission.count({
    where: { role: session.user.role, permission: "services:manage" },
  });
  const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { price: "asc" }] });

  const toForm = (s: (typeof services)[number]): ServiceFormData => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    image: s.image,
    category: s.category,
    price: s.price,
    durationMinutes: s.durationMinutes,
    popular: s.popular,
    featured: s.featured,
    active: s.active,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Services</h2>
          <p className="text-sm text-muted-foreground">
            {services.length} services in the menu — manage pricing, durations and visibility.
          </p>
        </div>
        {canManage > 0 && <ServiceForm />}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Service</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Duration</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Popular</th>
                  <th className="px-5 py-3.5 font-semibold">Visible</th>
                  {canManage > 0 && <th className="px-5 py-3.5 font-semibold">Edit</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.map((s) => (
                  <tr key={s.id} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5 font-medium">{s.name}</td>
                    <td className="px-5 py-3.5 capitalize text-muted-foreground">{s.category.toLowerCase()}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.durationMinutes} min</td>
                    <td className="px-5 py-3.5 font-medium">{formatZAR(s.price)}</td>
                    <td className="px-5 py-3.5">{s.popular ? "⭐" : "—"}</td>
                    <td className="px-5 py-3.5">
                      <ActiveToggle kind="service" id={s.id} active={s.active} label={s.name} />
                    </td>
                    {canManage > 0 && (
                      <td className="px-5 py-3.5">
                        <ServiceForm service={toForm(s)} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
