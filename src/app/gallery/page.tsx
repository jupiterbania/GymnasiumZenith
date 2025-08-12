
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { GalleryItem } from '@/types';
import { getGalleryItems } from '@/lib/actions';

const GalleryPage = async () => {
    const galleryItems = await getGalleryItems();
    const categories = ['All', ...Array.from(new Set(galleryItems.map(item => item.category)))];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <section className="w-full py-12 md:py-24">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                            <h1 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">
                                Gallery
                            </h1>
                            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Explore moments from Gymnasium Zenith.
                            </p>
                        </div>
                        <Tabs defaultValue="All" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-lg mx-auto mb-8">
                                {categories.map(category => (
                                    <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                                ))}
                            </TabsList>
                            {categories.map(category => (
                                <TabsContent key={category} value={category}>
                                     {galleryItems.filter(item => category === 'All' || item.category === category).length === 0 ? (
                                        <div className="text-center text-muted-foreground py-12">
                                            <p>No items found in this category yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                            {(category === 'All' ? galleryItems : galleryItems.filter(item => item.category === category)).map(item => (
                                                <Card key={item.id} className="overflow-hidden group">
                                                    <CardContent className="p-0">
                                                        <div className="relative h-64 w-full">
                                                            <Image src={item.image || 'https://placehold.co/600x400.png'} alt={item.title} fill data-ai-hint={item.hint} className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                                        </div>
                                                        <div className="p-4">
                                                            <h3 className="font-semibold font-headline truncate">{item.title}</h3>
                                                            <Badge variant="secondary" className="mt-2">{item.category}</Badge>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

export default GalleryPage;
