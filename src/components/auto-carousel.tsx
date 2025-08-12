'use client';

import { useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { GalleryItem, Post } from "@/types";

type FeaturedItem = (Post | GalleryItem) & { itemType: 'post' | 'gallery' };

interface AutoCarouselProps {
  featuredItems: FeaturedItem[];
}

export default function AutoCarousel({ featuredItems }: AutoCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!carouselRef.current || featuredItems.length <= 1) return;

    const interval = setInterval(() => {
      const nextButton = carouselRef.current?.querySelector('[data-carousel-next]') as HTMLButtonElement;
      if (nextButton) {
        nextButton.click();
      }
    }, 3000); // Auto-swipe every 3 seconds

    return () => clearInterval(interval);
  }, [featuredItems.length]);

  if (featuredItems.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-xl">
        <h2 className="text-2xl font-bold font-headline">Welcome to Gymnasium Zenith</h2>
        <p className="text-muted-foreground mt-2">News and announcements will appear here.</p>
      </div>
    );
  }

  return (
    <div ref={carouselRef}>
      <Carousel
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {featuredItems.map((item) => {
            const isPost = item.itemType === 'post';
            const post = isPost ? (item as Post) : null;
            const galleryItem = !isPost ? (item as GalleryItem) : null;
            
            const href = isPost ? post?.redirectUrl : undefined;
            const imageUrl = isPost ? post?.imageUrl : (galleryItem?.url || galleryItem?.image);
            const content = isPost ? post?.content : galleryItem?.description;

            const Wrapper = href ? 'a' : 'div';

            return (
              <CarouselItem key={item.id}>
                <Wrapper 
                  href={href || undefined}
                  target={href ? '_blank' : undefined}
                  rel={href ? 'noopener noreferrer' : undefined}
                  className="block"
                >
                  <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full">
                    <Image
                      src={imageUrl || 'https://placehold.co/1200x600.png'}
                      alt={item.title}
                      fill
                      className="rounded-xl object-cover"
                      data-ai-hint="gym announcement"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                      <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-bold mb-4">
                        {item.title}
                      </h1>
                      <p className="text-lg md:text-xl max-w-2xl line-clamp-3">
                        {content}
                      </p>
                    </div>
                  </div>
                </Wrapper>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/75" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/75" data-carousel-next />
      </Carousel>
    </div>
  );
}
