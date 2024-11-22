"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BoardMember } from '@/app/types/board-member';
import { Card } from "@/components/ui/card";

interface BoardMemberGridProps {
  members: BoardMember[];
}

const BoardMemberGrid: React.FC<BoardMemberGridProps> = ({ members }) => {
  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No board members found.</p>
      </div>
    );
  }
  
  // Separate featured members from others and sort by order
  const sortedMembers = [...members].sort((a, b) => a.order - b.order);
  const featuredMembers = sortedMembers.filter(m => m.featured);
  const otherMembers = sortedMembers.filter(m => !m.featured);

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Featured Members Section */}
        {featuredMembers.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Executive Board
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-blue-50/40 hover:bg-blue-50/50 transition-colors rounded-xl shadow-sm p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                        {member.image && (
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover p-2"
                          />
                        )}
                      </div>
                      <div className="space-y-4 text-center md:text-left">
                        <div className="space-y-2">
                          <div className="inline-block px-3 py-1 bg-blue-600/90 text-white rounded-full text-sm font-semibold">
                            Executive Member
                          </div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            {member.name}
                          </h3>
                          <p className="text-blue-600/80 font-semibold">{member.position}</p>
                        </div>
                        <p className="text-gray-600/90 leading-relaxed">{member.bio}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other Members Grid */}
        {otherMembers.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Board Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-xl shadow-sm p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-white">
                        {member.image && (
                          <Image
                            src={member.image}
                            alt={member.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover p-2"
                          />
                        )}
                      </div>
                      <div className="text-center space-y-2">
                        <div className="inline-block px-3 py-1 bg-blue-600/90 text-white rounded-full text-sm font-semibold">
                          Board Member
                        </div>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          {member.name}
                        </h3>
                        <p className="text-blue-600/80 font-medium">{member.position}</p>
                        <p className="text-gray-600/90 leading-relaxed">{member.bio}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BoardMemberGrid;
