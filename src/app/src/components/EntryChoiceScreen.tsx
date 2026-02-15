import React, { useState } from 'react';
import { ChevronLeft, Building, FileText, Info, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { toast } from 'sonner';

interface EntryChoiceScreenProps {
  onBack: () => void;
  onSelectBusinessType: (type: 'registered' | 'unregistered') => void;
}

export function EntryChoiceScreen({ onBack, onSelectBusinessType }: EntryChoiceScreenProps) {
  const [selectedBusinessType, setSelectedBusinessType] = useState<'registered' | 'unregistered' | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  // Document lists based on business type
  const registeredDocuments = [
    { name: 'CAC Certificate (Certificate of Incorporation)', required: true, template: false },
    { name: 'Memorandum and Articles of Association', required: true, template: false },
    { name: 'Valid ID (NIN Card/Slip)', required: true, template: false },
    { name: 'Utility Bill (within 3 months)', required: true, template: false },
    { name: 'Passport Photograph', required: true, template: false },
    { name: 'Signature Specimen', required: true, template: false },
    { name: '2 Reference Forms', required: true, template: true },
    { name: 'Signed UBO Form', required: true, template: true },
  ];

  const unregisteredDocuments = [
    { name: 'CAC Document (Business Name Registration)', required: true, template: false },
    { name: 'Valid ID (NIN Card/Slip)', required: true, template: false },
    { name: 'Utility Bill (within 3 months)', required: true, template: false },
    { name: 'Passport Photograph', required: true, template: false },
    { name: 'Signature Specimen', required: true, template: false },
    { name: '2 Reference Forms', required: true, template: true },
    { name: 'Signed UBO Form', required: true, template: true },
  ];

  const handleBusinessTypeSelect = (type: 'registered' | 'unregistered') => {
    setSelectedBusinessType(type);
    setShowDocuments(true);
  };

  const handleDownloadAllForms = () => {
    toast.success('Downloading all required forms...', {
      description: 'Reference Forms and UBO Declaration Form'
    });
  };

  const handleCreateAccount = () => {
    if (selectedBusinessType && termsAccepted) {
      onSelectBusinessType(selectedBusinessType);
    }
  };

  const documents = selectedBusinessType === 'registered' ? registeredDocuments : unregisteredDocuments;
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Blue Header Section */}
      <div className="text-white px-4 pt-4 pb-6" style={{ backgroundColor: '#003883' }}>
        {/* Back Button and Logo Row */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors -ml-2 mr-2"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <img
            src={'/assets/access_sme_logo.png'}
            alt="Access Bank"
            className="h-24 w-auto brightness-0 invert"
          />
        </div>

        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Tell us about your business
          </h1>
          <p className="text-white/90 text-base">
            Select the type that best describes your business status
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6">
        <div className="max-w-md mx-auto">

          {/* Business Type Options */}
          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleBusinessTypeSelect('registered')}
              className={`w-full p-5 border-2 rounded-2xl transition-all duration-300 text-left group ${
                selectedBusinessType === 'registered'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary hover:bg-primary/5'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Registered Business
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    My business is registered with CAC and has official documentation
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleBusinessTypeSelect('unregistered')}
              className={`w-full p-5 border-2 rounded-2xl transition-all duration-300 text-left group ${
                selectedBusinessType === 'unregistered'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary hover:bg-primary/5'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 flex-shrink-0">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Unregistered Business
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I'm starting my business or it's not yet registered with CAC
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Document Checklist - Shows after business type selection */}
          {selectedBusinessType && showDocuments && (
            <div className="space-y-6 mb-6">
              {/* Info Alert - Shows which business type was selected */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Document Requirements</p>
                    <p>
                      You selected: <strong>{selectedBusinessType === 'registered' ? 'Registered Business' : 'Unregistered Business'}</strong>
                    </p>
                    <p className="mt-1">
                      Below are the documents you'll need to complete your application.
                    </p>
                  </div>
                </div>
              </div>

              {/* Document List Card */}
              <Card className="p-6">
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Required Documents for {selectedBusinessType === 'registered' ? 'Registered' : 'Unregistered'} Business
                      </h3>
                      <p className="text-sm text-gray-600">{documents.length} documents required</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="border-t border-gray-200 pt-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-start space-x-3 py-2">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">{doc.name}</span>
                            {doc.required && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                                Required
                              </Badge>
                            )}
                            {doc.template && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                Template Available
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleDownloadAllForms}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All Required Forms
                  </Button>
                </div>
              </Card>

              {/* Terms & Conditions */}
              <Card className="p-6 bg-gray-50">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms-acceptance"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-6 h-6 min-w-[24px] rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    style={{ accentColor: '#003883' }}
                  />
                  <label htmlFor="terms-acceptance" className="text-sm font-medium text-gray-900 cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-primary underline">Terms & Conditions</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary underline">Account Opening Agreement</a>
                  </label>
                </div>
              </Card>

              {/* Create Account Button */}
              <Button
                onClick={handleCreateAccount}
                disabled={!termsAccepted}
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}