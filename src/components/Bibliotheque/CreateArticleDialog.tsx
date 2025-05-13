import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemUnit } from '@/types/library';

// Types for the item form
export const itemFormSchema = z.object({
  designation: z.string().min(3, "La désignation doit contenir au moins 3 caractères"),
  lot: z.string().min(1, "Veuillez sélectionner un lot"),
  subCategory: z.string().optional(),
  type: z.string().min(1, "Veuillez entrer un type"),
  unite: z.string().min(1, "Veuillez sélectionner une unité"),
  prix_unitaire: z.coerce.number().min(0, "Le prix doit être positif"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fichier_joint: z.string().optional(),
  bibliotheque_id: z.string().optional(),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

interface CreateArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  categories: string[];
  units: { code: ItemUnit; name: string }[];
  libraries: string[];
  form: any;
  onSubmit: (values: ItemFormValues) => void;
}

const CreateArticleDialog: React.FC<CreateArticleDialogProps> = ({
  open,
  onOpenChange,
  isEditMode,
  categories,
  units,
  libraries,
  form,
  onSubmit
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] backdrop-blur-md bg-white/95 border-white/20">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier un article' : 'Créer un article'}</DialogTitle>
          <DialogDescription>
            Renseignez les informations de l'article ci-dessous.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Désignation*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lot*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un lot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bibliotheque_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bibliothèque*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || "default"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une bibliothèque" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default">Bibliothèque par défaut</SelectItem>
                        {libraries.map((library) => (
                          <SelectItem key={library} value={library}>
                            {library}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sous-lot</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type*</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="unite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une unité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name} ({unit.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prix_unitaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire HT*</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description technique</FormLabel>
                  <FormControl>
                    <textarea 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" className="bg-metrOrange hover:bg-metrOrange/90">
                {isEditMode ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateArticleDialog;
