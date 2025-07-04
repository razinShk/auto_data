import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Send, Mail, User, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportIssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIssueType?: string;
}

const ReportIssueForm: React.FC<ReportIssueFormProps> = ({ 
  isOpen, 
  onClose, 
  defaultIssueType = "general" 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: defaultIssueType,
    description: '',
    projectName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Create a form element and submit it traditionally to avoid CORS issues
    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/razinshaikh3133@gmail.com';
    form.method = 'POST';
    form.target = '_blank'; // Open in new tab
    
    // Add form fields
    const fields = {
      'name': formData.name,
      'email': formData.email,
      'issue_type': formData.issueType,
      'project_name': formData.projectName || 'Not specified',
      'description': formData.description,
      '_subject': `Excel Observer - ${formData.issueType === 'password' ? 'Password Reset Request' : 'Issue Report'}`,
      '_captcha': 'false',
      '_next': window.location.origin + '/',
      '_template': 'table'  // Better email formatting
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    // Submit the form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Show success message and reset form
    toast({
      title: "Report Issued Successfully! ✅",
      description: "Your report has been submitted and sent to our support team. We'll respond to your email within 24-48 hours.",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      issueType: 'general',
      description: '',
      projectName: ''
    });
    onClose();
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Issue
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Your Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Issue Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                  <FileText className="h-4 w-4" />
                  Issue Details
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="issueType" className="text-sm font-medium">
                      Issue Type *
                    </Label>
                    <Select value={formData.issueType} onValueChange={(value) => handleInputChange('issueType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="password">🔑 Forgot Password</SelectItem>
                        <SelectItem value="access">🚪 Cannot Access Project</SelectItem>
                        <SelectItem value="data">📊 Data Loss/Sync Issues</SelectItem>
                        <SelectItem value="bug">🐛 Bug Report</SelectItem>
                        <SelectItem value="feature">💡 Feature Request</SelectItem>
                        <SelectItem value="general">❓ General Support</SelectItem>
                        <SelectItem value="technical">⚙️ Technical Issues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectName" className="text-sm font-medium">
                      Project Name (if applicable)
                    </Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => handleInputChange('projectName', e.target.value)}
                      placeholder="Enter project name if issue is project-specific"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, or other relevant information."
                      rows={4}
                      className="resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Be as specific as possible to help us resolve your issue quickly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800 mb-1">✅ Email Service Active</p>
                    <p className="text-green-700">
                      Your report will be instantly sent to our support team at razinshaikh3133@gmail.com. 
                      Expect a response within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ReportIssueForm;
