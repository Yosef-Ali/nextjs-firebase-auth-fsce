"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BoardMember } from '@/app/types/board-member';

interface BoardMemberGridProps {
  members: BoardMember[];
}

const BoardMemberGrid: React.FC<BoardMemberGridProps> = ({ members }) => {
  console.log('BoardMemberGrid received members:', members);
  
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

  console.log('Featured members:', featuredMembers);
  console.log('Other members:', otherMembers);

  return (
    <div className="space-y-16">
      {/* Featured Members Section */}
      {featuredMembers.length > 0 && (
        <div className="space-y-8">
          <h3 className="text-2xl font-semibold text-center">Executive Board</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-xl p-8"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative w-48 h-48 flex-shrink-0">
                    {member.image && (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div className="space-y-4 text-center md:text-left">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{member.name}</h3>
                      <p className="text-blue-600 font-semibold">{member.position}</p>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Other Members Grid */}
      {otherMembers.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-center mb-8">Board Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-40 h-40">
                    {member.image && (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-gray-600 font-medium">{member.position}</p>
                  </div>
                  <p className="text-gray-500 text-center">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardMemberGrid;
