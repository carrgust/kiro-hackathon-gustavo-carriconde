import { motion } from 'framer-motion';
import { UserPlus, Linkedin, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { pageVariants, cardContainerVariants, cardItemVariants } from '@/lib/animations';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export default function StakeholderSection() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'John Doe',
      role: 'Product Manager',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Engineering Lead',
      email: 'jane@example.com',
    },
  ]);

  const handleAddContact = () => {
    toast.info('Add contact feature coming soon');
  };

  const handleLinkedInImport = () => {
    toast.info('LinkedIn import feature coming soon');
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-800 to-black p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Stakeholder Management</h1>
          <p className="text-gray-400">Manage contacts and stakeholders for your project</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleAddContact}
            className="flex-1 py-4 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <UserPlus size={20} />
            Add Contact
          </button>
          <button
            onClick={handleLinkedInImport}
            className="px-6 py-4 bg-[#0077B5] hover:bg-[#006399] rounded-lg font-semibold text-white transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Linkedin size={20} />
            Import from LinkedIn
          </button>
        </div>

        {/* Contact List */}
        <motion.div
          className="space-y-4"
          variants={cardContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {contacts.map((contact) => (
            <motion.div key={contact.id} variants={cardItemVariants}>
              <GlassCard className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{contact.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{contact.role}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Mail size={16} />
                        <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors">
                          {contact.email}
                        </a>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Phone size={16} />
                          <a href={`tel:${contact.phone}`} className="hover:text-white transition-colors">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-xl font-bold">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {contacts.length === 0 && (
          <GlassCard className="p-12 text-center">
            <UserPlus size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No contacts yet. Add your first stakeholder.</p>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
}
