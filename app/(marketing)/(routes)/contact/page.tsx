"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Mail, Phone, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import { useToast } from "@/hooks/use-toast";
// Import EmailJS
import emailjs from "@emailjs/browser";

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Initialize EmailJS
  useEffect(() => {
    // Initialize EmailJS with your public key
    if (typeof window !== "undefined") {
      emailjs.init("WTD9ae7biKLQejiOc");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Prepare template parameters
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_email: "meaza@fsc-e.org", // Admin email
      };

      // Send email using EmailJS with direct values
      const response = await emailjs.send(
        "service_7vfe7yh",
        "template_fhbuhcq",
        templateParams,
        {
          publicKey: "WTD9ae7biKLQejiOc",
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Message Sent",
        description:
          "Your message has been sent successfully. We'll get back to you soon!",
        variant: "default",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error sending email:", error);

      toast({
        title: "Something went wrong",
        description: "Unable to send your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      title: "Address",
      icon: <MapPin className="w-6 h-6 text-muted-foreground" />,
      content: "Addis Ababa, Ethiopia",
    },
    {
      title: "Email",
      icon: <Mail className="w-6 h-6 text-muted-foreground" />,
      content: "meaza@fsc-e.org",
    },
    {
      title: "Phone",
      icon: <Phone className="w-6 h-6 text-muted-foreground" />,
      content: "Tel. 251-111705024\n     251-118333927\nFax +251 111705234",
    },
    {
      title: "Website",
      icon: <Clock className="w-6 h-6 text-muted-foreground" />,
      content: "www.fsc-e.org",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />

      <div className="container relative px-4 py-16 mx-auto">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Get in Touch
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto lg:grid-cols-3">
          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="flex flex-col h-full p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Send us a Message</h3>
              </div>
              <div className="flex-grow">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 transition-all border border-gray-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-3 transition-all border border-gray-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-gray-700"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-3 transition-all border border-gray-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-gray-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-3 transition-all border border-gray-200 rounded-lg bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </motion.button>

                  <p className="mt-2 text-sm text-center text-gray-500">
                    We'll get back to you as soon as possible
                  </p>
                </form>
              </div>
            </Card>
          </motion.div>

          {/* Contact Information Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="flex flex-col h-full p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Contact Information</h3>
              </div>
              <div className="flex-grow space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="flex items-start gap-4"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      {React.cloneElement(info.icon, {
                        className: "h-6 w-6 text-primary",
                      })}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {info.title}
                      </h3>
                      <p className="mt-1 whitespace-pre-line text-muted-foreground">
                        {info.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
