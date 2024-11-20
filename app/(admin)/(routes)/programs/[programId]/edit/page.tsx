'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { whatWeDoService } from '@/app/services/what-we-do';
import { Program, ProgramCategory } from '@/app/types/program';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const categories = [
  { id: 'prevention-promotion', label: 'Prevention & Promotion' },
  { id: 'protection', label: 'Protection' },
  { id: 'rehabilitation', label: 'Rehabilitation' },
  { id: 'resource-center', label: 'Resource Center' },
];

export default function EditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [program, setProgram] = useState<Program>({
    id: '',
    title: '',
    description: '',
    excerpt: '',
    category: 'prevention-promotion',
    content: [],
    published: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  useEffect(() => {
    const fetchProgram = async () => {
      if (params.programId === 'new') {
        setLoading(false);
        return;
      }

      try {
        const data = await whatWeDoService.getProgramById(params.programId as string);
        if (data) {
          setProgram(data);
        }
      } catch (error) {
        console.error('Error fetching program:', error);
        toast({
          title: 'Error',
          description: 'Failed to load program',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [params.programId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (params.programId === 'new') {
        await whatWeDoService.createProgram(program);
        toast({
          title: 'Success',
          description: 'Program created successfully',
        });
      } else {
        await whatWeDoService.updateProgram(program.id, program);
        toast({
          title: 'Success',
          description: 'Program updated successfully',
        });
      }
      router.push('/admin/programs');
    } catch (error) {
      console.error('Error saving program:', error);
      toast({
        title: 'Error',
        description: 'Failed to save program',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddObjective = () => {
    setProgram(prev => ({
      ...prev,
      objectives: [...(prev.objectives || []), ''],
    }));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    setProgram(prev => ({
      ...prev,
      objectives: prev.objectives?.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const handleRemoveObjective = (index: number) => {
    setProgram(prev => ({
      ...prev,
      objectives: prev.objectives?.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/programs">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Programs
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={program.title}
                onChange={e => setProgram(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={program.category}
                onValueChange={value => setProgram(prev => ({ ...prev, category: value as ProgramCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={program.excerpt}
                onChange={e => setProgram(prev => ({ ...prev, excerpt: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={program.description}
                onChange={e => setProgram(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={program.coverImage}
                onChange={e => setProgram(prev => ({ ...prev, coverImage: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Content</h2>
          <RichTextEditor
            value={program.content}
            onChange={value => setProgram(prev => ({ ...prev, content: value }))}
          />
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Objectives</h2>
            <Button type="button" variant="outline" onClick={handleAddObjective}>
              <Plus className="mr-2 h-4 w-4" />
              Add Objective
            </Button>
          </div>
          <div className="space-y-4">
            {program.objectives?.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={objective}
                  onChange={e => handleObjectiveChange(index, e.target.value)}
                  placeholder="Enter objective"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveObjective(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="published">Published</Label>
              <p className="text-sm text-muted-foreground">
                Make this program visible on the website
              </p>
            </div>
            <Switch
              id="published"
              checked={program.published}
              onCheckedChange={checked =>
                setProgram(prev => ({ ...prev, published: checked }))
              }
            />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/programs">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Program'}
          </Button>
        </div>
      </form>
    </div>
  );
}
