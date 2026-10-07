"use client";

import Spinner from "@/components/shared/Feedback/Spinner";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiMail, FiX, FiSend, FiUser, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import { useSendEmail } from '@/hooks/useEmailApi';
import { toast } from 'sonner';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientEmail: string;
  clientName: string;
  requestId?: string;
}

export default function EmailModal({ isOpen, onClose, clientEmail, clientName, requestId }: EmailModalProps) {
  const [emailData, setEmailData] = useState({
    to: clientEmail,
    subject: '',
    message: ''
  });
  const [isMinimized, setIsMinimized] = useState(false);

  const sendEmailMutation = useSendEmail();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!emailData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await sendEmailMutation.mutateAsync({
        to: emailData.to,
        subject: emailData.subject,
        message: emailData.message,
        clientName,
        requestId
      });
      
      toast.success('Email sent successfully!');
      onClose();
      setEmailData({ to: clientEmail, subject: '', message: '' });
    } catch (error: unknown) {
      let message = 'Failed to send email';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message: string }).message;
      }
      toast.error(message);
    }
  };

  const handleClose = () => {
    setEmailData({ to: clientEmail, subject: '', message: '' });
    setIsMinimized(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className={`bg-white dark:bg-[#0B0F2E] shadow-2xl border-2 border-slate-200 dark:border-white/10 transition-all duration-300 ease-in-out ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-4 ${isMinimized ? 'pb-2' : ''}`}>
          <CardTitle className={`flex items-center gap-2 ${isMinimized ? 'text-sm' : ''}`}>
            <FiMail className="w-4 h-4 text-blue-600" />
            {isMinimized ? 'Compose Email' : 'Send Email to Client'}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              {isMinimized ? <FiMaximize2 className="w-3 h-3" /> : <FiMinimize2 className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <FiX className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="h-[calc(600px-80px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client Info */}
              <div className="bg-slate-50 dark:bg-white/[0.04] p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiUser className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Client Information</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p><strong>Name:</strong> {clientName}</p>
                  <p><strong>Email:</strong> {clientEmail}</p>
                  {requestId && <p><strong>Request ID:</strong> {requestId}</p>}
                </div>
              </div>

              {/* To Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  To Email
                </label>
                <Input
                  name="to"
                  type="email"
                  value={emailData.to}
                  onChange={handleInputChange}
                  placeholder="recipient@example.com"
                  className="w-full"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Subject *
                </label>
                <Input
                  name="subject"
                  type="text"
                  value={emailData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter email subject..."
                  className="w-full"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Message *
                </label>
                <Textarea
                  name="message"
                  value={emailData.message}
                  onChange={handleInputChange}
                  placeholder="Enter your message here..."
                  className="w-full min-h-[150px] resize-none"
                  required
                />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Quick Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmailData(prev => ({
                        ...prev,
                        subject: 'Service Request Update',
                        message: `Dear ${clientName},\n\nThank you for your service request. We are currently reviewing your project requirements and will get back to you with a detailed proposal soon.\n\nBest regards,\nThemora Team`
                      }));
                    }}
                    className="text-xs"
                  >
                    Status Update
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmailData(prev => ({
                        ...prev,
                        subject: 'Project Proposal',
                        message: `Dear ${clientName},\n\nWe have prepared a detailed proposal for your project. Please find the attached document with our recommendations and pricing.\n\nWe look forward to discussing this with you.\n\nBest regards,\nThemora Team`
                      }));
                    }}
                    className="text-xs"
                  >
                    Project Proposal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEmailData(prev => ({
                        ...prev,
                        subject: 'Additional Information Required',
                        message: `Dear ${clientName},\n\nTo better understand your project requirements, we need some additional information:\n\n1. Project timeline\n2. Specific features needed\n3. Budget constraints\n\nPlease provide these details so we can serve you better.\n\nBest regards,\nThemora Team`
                      }));
                    }}
                    className="text-xs"
                  >
                    Request Info
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={sendEmailMutation.isPending}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendEmailMutation.isPending || !emailData.subject.trim() || !emailData.message.trim()}
                  className="tf-btn-primary tf-shine "
                  size="sm"
                >
                  {sendEmailMutation.isPending ? (
                    <>
                      <Spinner size="xs" tone="light" label="Sending" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}