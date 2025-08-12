"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Sparkles, Upload } from "lucide-react";
import { suggestGalleryCategories } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { GalleryItem } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface AddItemDialogProps {
    item?: GalleryItem;
    onAddItem?: (item: Omit<GalleryItem, 'id' | 'createdAt' | 'image' | 'hint'>) => void;
    onUpdateItem?: (item: GalleryItem) => void;
    children?: React.ReactNode;
}

export default function AddItemDialog({ item, onAddItem, onUpdateItem, children }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<GalleryItem>>({});
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isEditMode = !!item;

  useEffect(() => {
    if (item && open) {
        setFormData(item);
    } else {
        setFormData({
            title: "",
            description: "",
            url: "",
            type: "image",
            category: "",
            showOnHomepage: false,
        });
    }
    setSuggestedCategories([]);
  }, [item, open]);

  const handleChange = (field: keyof Omit<GalleryItem, 'id' | 'createdAt' | 'image' | 'hint'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestCategories = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Title and Description needed",
        description: "Please enter a title and description to get suggestions.",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      const result = await suggestGalleryCategories({ title: formData.title!, description: formData.description! });
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        setSuggestedCategories([]);
      } else {
        setSuggestedCategories(result.categories || []);
      }
    });
  };

  const handleCategorySelect = (category: string) => {
    handleChange('category', category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url || !formData.category) {
        toast({
            title: "Missing Fields",
            description: "Please fill out the title, URL/upload, and category.",
            variant: "destructive"
        })
        return;
    }

    if (isEditMode && onUpdateItem) {
        onUpdateItem(formData as GalleryItem);
    } else if (onAddItem) {
        onAddItem(formData as Omit<GalleryItem, 'id' | 'createdAt' | 'image' | 'hint'>);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Item</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditMode ? 'Edit Gallery Item' : 'Add Gallery Item'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of the gallery item.' : 'Upload a new image or video to the gallery. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the item for AI category suggestions..."
            />
          </div>

          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">URL</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="pt-4">
                <div className="space-y-2">
                    <Label htmlFor="url">Image URL</Label>
                    <Input id="url" value={formData.url || ''} onChange={e => handleChange('url', e.target.value)} placeholder="https://example.com/image.png" />
                </div>
            </TabsContent>
            <TabsContent value="upload" className="pt-4">
                <div className="space-y-2">
                    <Label htmlFor="file">Upload Image</Label>
                    <Input id="file" type="file" onChange={handleFileChange} accept="image/*" />
                </div>
            </TabsContent>
          </Tabs>

           {formData.url && formData.type === 'image' && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <img src={formData.url} alt="Preview" className="w-full h-auto rounded-md object-cover max-h-48" />
              </div>
            )}

          <div className="space-y-2">
            <Label htmlFor="type">
              Type
            </Label>
            <Select value={formData.type} onValueChange={value => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <Label htmlFor="category">
                Category
             </Label>
             <Input id="category" value={formData.category || ''} onChange={e => handleChange('category', e.target.value)} placeholder="e.g., Events" />
          </div>

           <div className="flex items-center space-x-2 pt-2">
            <Switch
                id="showOnHomepage"
                checked={formData.showOnHomepage}
                onCheckedChange={(checked) => handleChange('showOnHomepage', checked)}
            />
            <Label htmlFor="showOnHomepage">Show on Homepage</Label>
          </div>

          <div className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleSuggestCategories} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Suggest Categories
            </Button>
          </div>

          {suggestedCategories.length > 0 && (
             <div className="space-y-2">
                <Label>Suggestions</Label>
                <div className="flex flex-wrap gap-2">
                    {suggestedCategories.map(cat => (
                        <Badge key={cat} variant={formData.category === cat ? "default" : "secondary"} className="cursor-pointer" onClick={() => handleCategorySelect(cat)}>
                            {cat}
                        </Badge>
                    ))}
                </div>
             </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit">Save {isEditMode ? 'Changes' : 'Item'}</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
