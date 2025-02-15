'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AboutContent } from '@/app/types/about';
import { whoWeAreService } from '@/app/services/who-we-are';
import { toast } from '@/hooks/use-toast';
import AboutContentForm from './AboutContentForm';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import { LoadingScreen } from '@/components/loading-screen';
import { withRoleProtection } from '@/app/lib/withRoleProtection';
import { UserRole } from '@/app/types/user';

function AboutEditorContent() {
    const [aboutData, setAboutData] = useState<AboutContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'vision' | 'mission' | 'values'>('vision');

    useEffect(() => {
        loadAboutContent();
    }, []);

    const loadAboutContent = async () => {
        try {
            setLoading(true);
            const data = await whoWeAreService.getAboutContent();
            setAboutData(data);
        } catch (error) {
            console.error('Error loading about content:', error);
            toast({
                title: 'Error',
                description: 'Failed to load about content',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getSectionContent = (section: string) => {
        return aboutData.find(item => item.section === section);
    };

    const handleEditSuccess = () => {
        loadAboutContent();
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">About Content Management</h1>
            </div>

            <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as typeof activeSection)}>
                <TabsList className="mb-8">
                    <TabsTrigger value="vision">Vision</TabsTrigger>
                    <TabsTrigger value="mission">Mission</TabsTrigger>
                    <TabsTrigger value="values">Values</TabsTrigger>
                </TabsList>

                {['vision', 'mission', 'values'].map((section) => (
                    <TabsContent key={section} value={section}>
                        <DashboardErrorBoundary>
                            <div className="space-y-6">
                                {getSectionContent(section) ? (
                                    <AboutContentForm
                                        initialData={getSectionContent(section)}
                                        section={section as 'vision' | 'mission' | 'values'}
                                        onSuccess={handleEditSuccess}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                                        <p className="text-lg text-gray-600 mb-4">No content yet for this section</p>
                                        <AboutContentForm
                                            section={section as 'vision' | 'mission' | 'values'}
                                            onSuccess={handleEditSuccess}
                                        />
                                    </div>
                                )}
                            </div>
                        </DashboardErrorBoundary>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}

export function AboutEditor() {
    return (
        <DashboardErrorBoundary>
            <AboutEditorContent />
        </DashboardErrorBoundary>
    );
}