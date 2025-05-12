
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Upload, FileUp, Plus, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

// Définir le schéma de validation
const projectSchema = z.object({
  name: z.string().min(3, { message: 'Le nom du projet est requis (3 caractères minimum)' }),
  client: z.string().min(2, { message: 'Le client est requis' }),
  reference: z.string().optional(),
  type: z.string().min(1, { message: 'La typologie est requise' }),
  address: z.string().optional(),
  deliveryDate: z.date().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const NewProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form hook setup
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      client: '',
      reference: '',
      type: '',
      address: '',
    },
  });

  // Check for previously saved form data in local storage
  useEffect(() => {
    const savedForm = localStorage.getItem('draft_project_form');
    if (savedForm) {
      try {
        const parsedForm = JSON.parse(savedForm);
        // Convert date string back to Date object if present
        if (parsedForm.deliveryDate) {
          parsedForm.deliveryDate = new Date(parsedForm.deliveryDate);
        }
        form.reset(parsedForm);
      } catch (e) {
        console.error('Error parsing saved form data', e);
      }
    }
  }, [form]);

  // Save form data to local storage on change
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.name || values.client) { // Only save if some main fields have values
        const saveValues = { ...values };
        localStorage.setItem('draft_project_form', JSON.stringify(saveValues));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProjectFormValues) => {
    if (files.length === 0) {
      toast({
        title: "Fichier requis",
        description: "Veuillez ajouter au moins un plan ou document",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear saved form data
      localStorage.removeItem('draft_project_form');
      
      toast({
        title: "Projet créé avec succès",
        description: `Le projet "${data.name}" a été créé.`,
      });
      
      // Redirect to dashboard or project page
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du projet",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = form.formState.isValid && files.length > 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold font-heading text-metrBlue mb-6">Créer un nouveau projet</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="backdrop-blur-sm bg-white/90 shadow-md">
              <CardHeader>
                <CardTitle>Informations du projet</CardTitle>
                <CardDescription>
                  Complétez les informations principales pour créer votre nouveau projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>🧱 Nom du projet*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Villa Méditerranée" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>🧍‍♂️ Client*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Dupont Immobilier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>🏷 Référence interne</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: PRJ-2025-042" {...field} />
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
                        <FormLabel>🗂 Typologie projet*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une typologie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="maison">Maison</SelectItem>
                            <SelectItem value="logement-collectif">Logement collectif</SelectItem>
                            <SelectItem value="tertiaire">Tertiaire</SelectItem>
                            <SelectItem value="industrie">Industrie</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>📍 Adresse du projet</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 12 Avenue des Plans, 75001 Paris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>📅 Date prévisionnelle de livraison</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full text-left font-normal flex justify-between items-center ${!field.value ? "text-muted-foreground" : ""}`}
                              >
                                {field.value ? (
                                  format(field.value, "d MMMM yyyy", { locale: fr })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/90 shadow-md">
              <CardHeader>
                <CardTitle>Ajouter un premier plan ou document</CardTitle>
                <CardDescription>
                  Importez des plans au format PDF, DWG, JPG ou PNG pour commencer votre projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className={`border-2 border-dashed rounded-lg p-10 text-center transition-all ${
                    isDragging 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-4 rounded-full bg-blue-50 p-3">
                      <Upload className="h-6 w-6 text-metrBlue" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Déposer vos fichiers ici</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Formats acceptés: PDF, DWG, JPG, PNG
                    </p>
                    <label htmlFor="file-upload">
                      <Button 
                        className="flex items-center gap-2" 
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <FileUp className="h-4 w-4" />
                        Parcourir les fichiers
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                      accept=".pdf,.dwg,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-sm text-gray-700">Fichiers sélectionnés</h4>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded mr-3">
                              <FileUp className="h-4 w-4 text-blue-700" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(1)} MB • {file.type || 'Fichier'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-center mt-6">
                  <label htmlFor="add-more-files">
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="flex items-center gap-2"
                      onClick={() => document.getElementById('add-more-files')?.click()}
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un autre document
                    </Button>
                  </label>
                  <input
                    id="add-more-files"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.dwg,.jpg,.jpeg,.png"
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => navigate('/dashboard')}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button 
                className="bg-metrOrange hover:bg-orange-600"
                type="submit"
                disabled={!isFormValid || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : "Créer mon projet"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default NewProject;
