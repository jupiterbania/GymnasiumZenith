
"use client";

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash, Loader2, RefreshCw, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AddItemDialog from './add-item-dialog';
import { GalleryItem } from '@/types';
import { useState, useEffect, useTransition, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRefresh } from '@/hooks/use-refresh';
import { getGalleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/lib/actions';

const GalleryAdminPage = () => {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const { toast } = useToast();
    const { refresh } = useRefresh();
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await getGalleryItems();
            setGalleryItems(items);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load gallery items.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    // Auto-refresh data every 30 seconds - only when page is visible
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (interval) clearInterval(interval);
            } else {
                interval = setInterval(() => {
                    loadItems();
                }, 30000);
            }
        };

        if (!document.hidden) {
            interval = setInterval(() => {
                loadItems();
            }, 30000);
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (interval) clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loadItems]);

    const handleAddItem = (item: Omit<GalleryItem, 'id' | 'createdAt' | 'image' | 'hint'>) => {
        startTransition(async () => {
            try {
                const newItemData: Omit<GalleryItem, 'id'> = {
                    ...item,
                    createdAt: new Date().toISOString(),
                    image: item.url || 'https://placehold.co/600x400.png',
                    hint: 'new item'
                };
                await addGalleryItem(newItemData);
                await loadItems();
                toast({ title: "Item Added", description: `${item.title} has been added to the gallery.` });
            } catch (error) {
                toast({ title: "Error", description: "Failed to add item.", variant: "destructive" });
            }
        });
    };

    const handleUpdateItem = (item: GalleryItem) => {
        startTransition(async () => {
            try {
                await updateGalleryItem(item);
                await loadItems();
                toast({ title: "Item Updated", description: `${item.title} has been updated.` });
            } catch (error) {
                 toast({ title: "Error", description: "Failed to update item.", variant: "destructive" });
            }
        });
    }

    const handleDeleteItem = (itemId: string) => {
        startTransition(async () => {
            try {
                await deleteGalleryItem(itemId);
                await loadItems();
                toast({ title: "Item Deleted", description: "The gallery item has been deleted.", variant: "destructive" });
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete item.", variant: "destructive" });
            }
        });
    }

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Gallery Management</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={loadItems}
            disabled={isLoading}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Refresh</span>
          </Button>
          <AddItemDialog onAddItem={handleAddItem} />
        </div>
      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {galleryItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                    <Image
                        src={item.url || item.image || 'https://placehold.co/600x400.png'}
                        alt={item.title}
                        fill
                        className="object-cover"
                        data-ai-hint={item.hint}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <Badge variant="outline" className="mb-2">{item.category}</Badge>
                <CardTitle className="text-lg font-headline leading-tight truncate">{item.title}</CardTitle>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                 <p className="text-sm text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                 <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <AddItemDialog item={item} onUpdateItem={handleUpdateItem}>
                               <Button variant="ghost" className="w-full justify-start text-sm font-normal p-2 h-auto">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </AddItemDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the gallery item.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteItem(item.id)} disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GalleryAdminPage;
