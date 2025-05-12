
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Upload, FileUp, Plus, X, Loader2, FileText, FileImage, CheckCircle2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

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

interface FileWithType extends File {
  fileType?: 'plan' | 'document';
}

interface ProcessedFile {
  file: File;
  fileType: 'plan' | 'document';
  progress: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  id: string;
}

const NewProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'documents'>('plans');
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  // Add Google Maps Places autocomplete
  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps && addressInputRef.current) {
      initPlacesAutocomplete();
      return;
    }
    
    // Load Google Maps script if not loaded
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initPlacesAutocomplete;
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up script if component unmounts before script loads
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  const initPlacesAutocomplete = () => {
    if (addressInputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'fr' },
      });
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          form.setValue('address', place.formatted_address);
        }
      });
    }
  };

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
      handleNewFiles(Array.from(e.dataTransfer.files), activeTab);
    }
  }, [activeTab]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleNewFiles(Array.from(e.target.files), activeTab);
    }
  };

  const handleNewFiles = (newFiles: File[], fileType: 'plans' | 'documents') => {
    const processedFiles = newFiles.map(file => {
      // Generate unique ID for the file
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Process the file with simulated upload and processing
      const processedFile: ProcessedFile = {
        file,
        fileType: fileType === 'plans' ? 'plan' : 'document',
        progress: 0,
        status: 'uploading',
        id: fileId,
      };
      
      // Simulate upload progress
      simulateFileProcessing(fileId);
      
      return processedFile;
    });
    
    setFiles(prev => [...prev, ...processedFiles]);
  };
  
  const simulateFileProcessing = (fileId: string) => {
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // After upload is complete, simulate processing
        setFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, progress: 100, status: 'processing' } : file
        ));
        
        // Simulate processing time
        setTimeout(() => {
          setFiles(prev => prev.map(file => 
            file.id === fileId ? { ...file, status: 'ready' } : file
          ));
        }, 1500 + Math.random() * 1000);
      } else {
        setFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, progress } : file
        ));
      }
    }, 200);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const onSubmit = async (data: ProjectFormValues) => {
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

  const handleViewPlan = (fileId: string) => {
    toast({
      title: "Ouverture du plan",
      description: "Redirection vers l'éditeur de plans...",
    });
    
    // Here you would navigate to the plan editor with this specific plan
    // For now we just simulate the future behavior
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  // Form is valid even without files now
  const isFormValid = form.formState.isValid;

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
                          <Input 
                            placeholder="Ex: 12 Avenue des Plans, 75001 Paris" 
                            {...field} 
                            ref={addressInputRef}
                          />
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
                <CardTitle>Documents du projet</CardTitle>
                <CardDescription>
                  Vous pourrez ajouter des plans et documents à tout moment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="plans" className="mb-6" onValueChange={(value) => setActiveTab(value as 'plans' | 'documents')}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="plans" className="flex-1">Plans</TabsTrigger>
                    <TabsTrigger value="documents" className="flex-1">Documents</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="plans">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-10 text-center transition-all ${
                        isDragging && activeTab === 'plans'
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
                        <h3 className="text-lg font-semibold mb-2">Déposer vos plans ici</h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Formats recommandés: DWG, PDF
                        </p>
                        <label htmlFor="plan-upload">
                          <Button 
                            className="flex items-center gap-2" 
                            type="button"
                            onClick={() => document.getElementById('plan-upload')?.click()}
                          >
                            <FileUp className="h-4 w-4" />
                            Parcourir les plans
                          </Button>
                        </label>
                        <input
                          id="plan-upload"
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleFileChange}
                          accept=".pdf,.dwg"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents">
                    <div 
                      className={`border-2 border-dashed rounded-lg p-10 text-center transition-all ${
                        isDragging && activeTab === 'documents'
                          ? "border-primary bg-primary/5" 
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 rounded-full bg-blue-50 p-3">
                          <FileText className="h-6 w-6 text-metrBlue" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Déposer vos documents ici</h3>
                        <p className="text-sm text-gray-500 mb-6">
                          Formats acceptés: PDF, JPG, PNG, DOC, XLS
                        </p>
                        <label htmlFor="doc-upload">
                          <Button 
                            className="flex items-center gap-2" 
                            type="button"
                            onClick={() => document.getElementById('doc-upload')?.click()}
                          >
                            <FileUp className="h-4 w-4" />
                            Parcourir les documents
                          </Button>
                        </label>
                        <input
                          id="doc-upload"
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-700">Fichiers sélectionnés</h4>
                      <span className="text-xs text-gray-500">{files.length} fichier(s)</span>
                    </div>
                    
                    <ul className="space-y-3">
                      {files.map((file) => (
                        <li 
                          key={file.id} 
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center flex-1 mr-4">
                            <div className={`p-2 rounded mr-3 ${
                              file.fileType === 'plan' ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {file.fileType === 'plan' 
                                ? <FileImage className={`h-4 w-4 ${file.fileType === 'plan' ? 'text-blue-700' : 'text-green-700'}`} />
                                : <FileText className="h-4 w-4 text-green-700" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{file.file.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">
                                  {(file.file.size / 1024 / 1024).toFixed(1)} MB
                                </span>
                                {file.status === 'uploading' && (
                                  <span className="text-xs text-blue-600">
                                    Envoi: {file.progress}%
                                  </span>
                                )}
                                {file.status === 'processing' && (
                                  <span className="text-xs text-amber-600 animate-pulse">
                                    Traitement en cours...
                                  </span>
                                )}
                                {file.status === 'ready' && (
                                  <span className="text-xs text-green-600 flex items-center">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Prêt
                                  </span>
                                )}
                              </div>
                              {file.status === 'uploading' && (
                                <Progress 
                                  value={file.progress} 
                                  className="h-1 mt-1" 
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {file.status === 'ready' && file.fileType === 'plan' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleViewPlan(file.id)}
                                className="mr-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 text-xs px-2 py-0 h-7"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ouvrir
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeFile(file.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-center mt-6">
                  <label htmlFor={activeTab === 'plans' ? "add-more-plans" : "add-more-docs"}>
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="flex items-center gap-2"
                      onClick={() => document.getElementById(
                        activeTab === 'plans' ? "add-more-plans" : "add-more-docs"
                      )?.click()}
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un autre {activeTab === 'plans' ? 'plan' : 'document'}
                    </Button>
                  </label>
                  <input
                    id="add-more-plans"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => handleFileChange(e)}
                    accept=".pdf,.dwg"
                  />
                  <input
                    id="add-more-docs"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => handleFileChange(e)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                </div>
                
                <p className="text-xs text-gray-500 mt-6 text-center">
                  Vous pourrez ajouter d'autres documents après la création du projet
                </p>
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
