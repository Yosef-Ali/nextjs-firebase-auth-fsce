'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { whatWeDoService } from '@/app/services/what-we-do';
import { Program } from '@/app/types/program';
import { PortableText } from '@portabletext/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Target, Trophy, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import FSCESkeleton from '@/components/FSCESkeleton';

export default function ProgramPage() {
  const params = useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        if (params.programId) {
          const data = await whatWeDoService.getProgramById(params.programId as string);
          setProgram(data);
        }
      } catch (error) {
        console.error('Error fetching program:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [params.programId]);

  if (loading) {
    return <FSCESkeleton />;
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Program Not Found</h1>
          <Link href="/what-we-do">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage: program.coverImage ? `url(${program.coverImage})` : undefined,
          backgroundColor: 'rgb(var(--primary) / 0.05)',
        }}
      >
        {program.coverImage && (
          <div className="absolute inset-0 bg-black/50" />
        )}
        <div className="container mx-auto px-4 relative">
          <Link href="/what-we-do">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </Link>
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${program.coverImage ? 'text-white' : ''}`}>
            {program.title}
          </h1>
          <p className={`text-lg max-w-2xl ${program.coverImage ? 'text-gray-200' : 'text-muted-foreground'}`}>
            {program.excerpt}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 prose prose-lg max-w-none">
              <PortableText value={program.content} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Objectives */}
              {program.objectives && program.objectives.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Objectives
                  </h3>
                  <ul className="space-y-2">
                    {program.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-sm text-muted-foreground">
                          {objective}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Beneficiaries */}
              {program.beneficiaries && program.beneficiaries.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Beneficiaries
                  </h3>
                  <ul className="space-y-2">
                    {program.beneficiaries.map((beneficiary, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {beneficiary}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Outcomes */}
              {program.outcomes && program.outcomes.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Outcomes
                  </h3>
                  <div className="space-y-4">
                    {program.outcomes.map((outcome, index) => (
                      <div key={index}>
                        <h4 className="font-medium mb-1">{outcome.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {outcome.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Resources */}
              {program.resources && program.resources.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <LinkIcon className="mr-2 h-5 w-5" />
                    Resources
                  </h3>
                  <ul className="space-y-2">
                    {program.resources.map((resource, index) => (
                      <li key={index}>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center"
                        >
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
