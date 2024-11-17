"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Contact() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false, threshold: 0.1 });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  const variants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Your fetch logic here
  };


  return (
    <div className="max-w-6xl mx-auto min-h-screen flex flex-row justify-center items-center">
      <div className="w-1/2 p-4">
        <motion.div
          initial={{ x: -500, opacity: 0 }} // Starts from the left with opacity 0
          animate={{ x: 0, opacity: 1 }} // Ends at the original position with opacity 1
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/images/contact.png"
            alt="Contact Us"
            width={500}
            height={500}
            className="h-screen object-cover rounded-md"
            placeholder="blur"
            blurDataURL="/path-to-your-blur-image.jpg"
          />
        </motion.div>
      </div>

      <motion.div
        className="w-1/2 p-4"
        initial={{ x: '100%', opacity: 0 }} // Starts from the right with opacity 0
        animate={{ x: 0, opacity: 1 }} // Ends at the original position with opacity 1
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name:</label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message:</label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows={8}
              required
            />
          </div>
          <Button type="submit" className="bg-blue-900 text-white hover:bg-blue-950">Send</Button>
        </form>
      </motion.div>
    </div>
  );
}