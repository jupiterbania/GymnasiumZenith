
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AutoCarousel from "@/components/auto-carousel";
import { getFeaturedItems, getGalleryItems, getMembers } from "@/lib/actions";
import { GalleryItem, Member, Post } from "@/types";

type FeaturedItem = (Post | GalleryItem) & { itemType: 'post' | 'gallery' };

// Force dynamic rendering to get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const featuredItems: FeaturedItem[] = await getFeaturedItems();
  const allGalleryItems = await getGalleryItems();
  const allMembers = await getMembers();

  const featuredGalleryItems = allGalleryItems.filter(item => item.showOnHomepage);
  const featuredMembers = allMembers.filter(member => member.showOnHomepage);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <AutoCarousel featuredItems={featuredItems} />
          </div>
        </section>



        <section id="members" className="w-full py-12 md:py-24">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
                            Meet Our Members
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Our community is our strength. Get to know some of our dedicated members.
                        </p>
                    </div>
                </div>
                {featuredMembers.length > 0 ? (
                    <div className="grid gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
                        {featuredMembers.slice(0, 4).map(member => (
                            <div key={member.memberId} className="flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarImage src={member.photoUrl || 'https://placehold.co/128x128.png'} alt={member.fullName} data-ai-hint="member portrait" />
                                    <AvatarFallback>{member.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-semibold font-headline text-lg">{member.fullName}</h3>
                                <Link href={`/members/${member.id}`} className="text-sm text-primary hover:underline">
                                    View Profile
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>Our community is growing. Members will be featured here soon!</p>
                    </div>
                )}
                <div className="text-center mt-12">
                    <Button asChild variant="outline">
                        <Link href="/members">
                            View All Members <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        <section id="gallery" className="w-full py-12 md:py-24 bg-card border-y">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
                            From Our Gallery
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            A glimpse into the life at Gymnasium Zenith.
                        </p>
                    </div>
                </div>
                {featuredGalleryItems.length > 0 ? (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredGalleryItems.slice(0, 4).map(item => (
                            <Card key={item.id} className="overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="relative h-56 w-full">
                                        <Image src={item.image || 'https://placehold.co/600x400.png'} alt={item.title} fill className="object-cover" data-ai-hint={item.hint || 'gym photo'}/>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold font-headline">{item.title}</h3>
                                        <Badge variant="secondary" className="mt-2">{item.category}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>No gallery items have been added yet.</p>
                    </div>
                )}
                <div className="text-center mt-12">
                    <Button asChild variant="outline">
                        <Link href="/gallery">
                            View Full Gallery <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
