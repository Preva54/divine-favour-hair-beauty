import Image from "next/image";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/access";
import {
  deleteStylistAction,
  toggleStylistAvailableAction,
  toggleStylistFeaturedAction,
} from "@/lib/actions/admin-content";
import { ToggleButton } from "@/components/admin/toggle-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { StylistForm } from "@/components/admin/stylist-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Stylists" };

const img = (u: string) => (u.startsWith("/") || u.startsWith("http") ? u : `/images/${u}`);

export default async function AdminStylistsPage() {
  await adminGuard();
  const stylists = await prisma.stylist.findMany({
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    include: { appointments: { select: { id: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Stylists</h2>
          <p className="text-sm text-muted-foreground">
            {stylists.length} artists on the team · {stylists.filter((s) => s.available).length} available for bookings.
          </p>
        </div>
        <StylistForm />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-ivory/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 font-semibold">Stylist</th>
                  <th className="px-5 py-3.5 font-semibold">Experience</th>
                  <th className="px-5 py-3.5 font-semibold">Rating</th>
                  <th className="px-5 py-3.5 font-semibold">Featured</th>
                  <th className="px-5 py-3.5 font-semibold">Available</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stylists.map((st) => (
                  <tr key={st.id} className="transition hover:bg-ivory/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Image
                          src={img(st.image)}
                          alt={st.name}
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{st.name}</p>
                          <p className="text-xs text-muted-foreground">{st.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{st.yearsExperience} yrs</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="gold">★ {st.rating.toFixed(1)}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <ToggleButton
                        on={st.featured}
                        onToggle={() => toggleStylistFeaturedAction(st.id)}
                        label={st.featured ? "Unfeature stylist" : "Feature stylist"}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <ToggleButton
                        on={st.available}
                        onToggle={() => toggleStylistAvailableAction(st.id)}
                        label={st.available ? "Mark unavailable" : "Mark available"}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <StylistForm
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
                          }}
                        />
                        <DeleteButton
                          id={st.id}
                          label="stylist"
                          onDelete={deleteStylistAction}
                          confirm={
                            st.appointments.length > 0
                              ? `This stylist has ${st.appointments.length} appointment(s) on record and cannot be deleted.`
                              : `Remove ${st.name} from the team?`
                          }
                        />
                      </div>
                    </td>
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