'use client';

import { useEffect, useState } from 'react';
import { whoWeAreService } from '@/app/services/who-we-are';
import { AboutContent } from '@/app/types/about';
import { Button } from '@/components/ui/button';
import { Edit2, Plus } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import AboutSectionForm from '../../_components/AboutSectionForm';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await whoWeAreService.getAboutContent();
        setContent(data);
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const sections = [
    { id: 'vision', title: 'Vision' },
    { id: 'mission', title: 'Mission' },
    { id: 'values', title: 'Values' }
  ];

  const refreshContent = async () => {
    const data = await whoWeAreService.getAboutContent();
    setContent(data);
    setSelectedSection(null);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Vision, Mission & Values</h2>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => {
          const sectionContent = content.find(item => item.section === section.id);
          
          return (
            <Card key={section.id} className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold">Our {section.title}</h3>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSection(section.id)}
                    >
                      {sectionContent ? (
                        <>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>
                        {sectionContent ? 'Edit' : 'Add'} {section.title}
                      </DialogTitle>
                    </DialogHeader>
                    {selectedSection === section.id && (
                      <AboutSectionForm
                        section={section.id as "values" | "vision" | "mission"}
                        initialData={sectionContent}
                        onSuccess={refreshContent}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
              
              {sectionContent ? (
                <div className="prose max-w-none">
                  <p>{sectionContent.content}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No content added yet. Click Add to create content.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
