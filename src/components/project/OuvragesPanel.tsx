
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Mock data for ouvrages
const mockOuvrages = [
  {
    id: '1',
    categorie: 'Gros œuvre',
    items: [
      { id: '101', designation: 'Fondation béton', lot: 'Gros œuvre', unite: 'M3', prix: 120 },
      { id: '102', designation: 'Murs extérieurs', lot: 'Gros œuvre', unite: 'M2', prix: 85 }
    ]
  },
  {
    id: '2',
    categorie: 'Menuiseries',
    items: [
      { id: '201', designation: 'Fenêtre standard', lot: 'Menuiserie', unite: 'U', prix: 450 },
      { id: '202', designation: 'Porte intérieure', lot: 'Menuiserie', unite: 'U', prix: 220 }
    ]
  },
  {
    id: '3',
    categorie: 'Revêtements',
    items: [
      { id: '301', designation: 'Carrelage sol', lot: 'Revêtement', unite: 'M2', prix: 65 },
      { id: '302', designation: 'Peinture murs', lot: 'Revêtement', unite: 'M2', prix: 18 }
    ]
  }
];

const OuvragesPanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOuvrageId, setSelectedOuvrageId] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(['1', '2', '3']);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(current => 
      current.includes(categoryId) 
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
    );
  };

  const selectOuvrage = (ouvrageId: string) => {
    setSelectedOuvrageId(ouvrageId);
  };

  // Filter ouvrages based on search query
  const filteredOuvrages = mockOuvrages.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lot.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Ouvrages</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher un ouvrage..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredOuvrages.map(category => (
            <Collapsible 
              key={category.id} 
              open={openCategories.includes(category.id)}
              className="mb-2"
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between font-medium text-left"
                >
                  {category.categorie}
                  <span>{openCategories.includes(category.id) ? '-' : '+'}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {category.items.map(item => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left text-sm pl-4 mb-1",
                      selectedOuvrageId === item.id && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => selectOuvrage(item.id)}
                  >
                    <div className="truncate">
                      <div className="font-medium">{item.designation}</div>
                      <div className="text-xs text-gray-500">{item.lot} - {item.unite}</div>
                    </div>
                  </Button>
                ))}
              </CollapsibleContent>
              <Separator className="my-2" />
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OuvragesPanel;
