import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/access";
import { formatZAR } from "@/lib/utils";
import {
  deleteStylistAction,
  toggleStylistAvailableAction,
  toggleStylistFeaturedAction,
} from "@/lib/actions/admin-content";
import { ToggleButton } from "@/components/admin/toggle-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { StylistForm } from "@/components/admin/stylist-form";
import { LeaveManager } from "@/components/admin/leave-manager";
import { StylistAvatar } from "@/components/stylist-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Stylists" };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function AdminStylistsPage() {
  await requirePermission("stylists:view");
  const [stylists, services] = await Promise.all([
    prisma.stylist.findMany({
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      include: {
        appointments: { where: { status: "COMPLETED" }, select: { amount: true } },
        _count: { select: { appointments: true } },
        schedule: true,
        leave: { orderBy: { start: "asc" } },
        services: { select: { id: true, name: true, category: true } },
      },
    }),
    prisma.service.findMany({ where: { active: true }, select: { id: true, name: true, category: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Staff Management</h2>
          <p className="text-sm text-muted-foreground">
            {stylists.length} artists on the team · {stylists.filter((s) => s.available).length} available for bookings.
          </p>
        </div>
        <StylistForm services={services} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Stylist</th>
                  <th className="px-5 py-3.5 font-semibold">Services</th>
                  <th className="px-5 py-3.5 font-semibold">Schedule</th>
                  <th className="px-5 py-3.5 font-semibold">Revenue</th>
                  <th className="px-5 py-3.5 font-semibold">Commission</th>
                  <th className="px-5 py-3.5 font-semibold">Rating</th>
                  <th className="px-5 py-3.5 font-semibold">Featured</th>
                  <th className="px-5 py-3.5 font-semibold">Available</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stylists.map((st) => {
                  const revenue = st.appointments.reduce((sum, a) => sum + a.amount, 0);
                  const commission = Math.round(revenue * (st.commissionRate / 100));
                  const scheduleDays = st.schedule.filter((d) => !d.closed).sort((a, b) => a.day - b.day);
                  return (
                    <tr key={st.id} className="align-top transition hover:bg-ivory/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                            <StylistAvatar name={st.name} image={st.image} initialsClassName="text-sm" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium">{st.name}</p>
                            <p className="text-xs text-muted-foreground">{st.title}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {st._count.appointments} bookings · {st.commissionRate}% commission
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex max-w-44 flex-wrap gap-1">
                          {st.services.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                          {st.services.slice(0, 4).map((s) => (
                            <span key={s.id} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-rose">
                              {s.name}
                            </span>
                          ))}
                          {st.services.length > 4 && (
                            <span className="text-[10px] font-semibold text-muted-foreground">+{st.services.length - 4}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {scheduleDays.map((d) => (
                            <span key={d.day} className="rounded border px-1.5 py-0.5 text-[10px] text-muted-foreground" title={`${d.open}–${d.close}`}>
                              {WEEKDAYS[d.day]}
                            </span>
                          ))}
                        </div>
                        {st.leave.length > 0 && (
                          <p className="mt-1 text-[11px] font-semibold text-gold">
                            {st.leave.length} leave period(s) booked
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium">{formatZAR(revenue)}</td>
                      <td className="px-5 py-3.5 font-medium text-gold">{formatZAR(commission)}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="gold">★ {st.rating.toFixed(1)}</Badge>
                        <span className="ml-1 text-[11px] text-muted-foreground">({st.reviewCount})</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <ToggleButton
                          on={st.featured}
                          id={st.id}
                          onToggle={toggleStylistFeaturedAction}
                          label={st.featured ? "Unfeature stylist" : "Feature stylist"}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <ToggleButton
                          on={st.available}
                          id={st.id}
                          onToggle={toggleStylistAvailableAction}
                          label={st.available ? "Mark unavailable" : "Mark available"}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <LeaveManager
                            stylistId={st.id}
                            stylistName={st.name}
                            leave={st.leave.map((l) => ({ id: l.id, start: l.start, end: l.end, reason: l.reason }))}
                          />
                          <StylistForm
                            services={services}
                            stylist={{
                              id: st.id,
                              name: st.name,
                              title: st.title,
                              bio: st.bio,
                              image: st.image,
                              yearsExperience: st.yearsExperience,
                              rating: st.rating,
                              reviewCount: st.reviewCount,
                              specialties: st.specialties,
                              featured: st.featured,
                              available: st.available,
                              phone: st.phone,
                              email: st.email,
                              commissionRate: st.commissionRate,
                              serviceIds: st.services.map((s) => s.id),
                              schedule: st.schedule.map((d) => ({ day: d.day, open: d.open, close: d.close, closed: d.closed })),
                            }}
                          />
                          <DeleteButton
                            id={st.id}
                            label="stylist"
                            onDelete={deleteStylistAction}
                            confirm={
                              st._count.appointments > 0
                                ? `This stylist has ${st._count.appointments} appointment(s) on record and cannot be deleted.`
                                : `Remove ${st.name} from the team?`
                            }
                          />
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
