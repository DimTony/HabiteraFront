import React from 'react';
import { ChevronLeft, Building, User, FileText, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface UnregisteredBusinessChoiceScreenProps {
  onBack: () => void;
  onSelectOption: (option: 'register-business' | 'individual-account') => void;
}

export function UnregisteredBusinessChoiceScreen({
  onBack,
  onSelectOption
}: UnregisteredBusinessChoiceScreenProps) {
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
            How would you like to proceed?
          </h1>
          <p className="text-white/90 text-base">
            Choose to register your business or open an individual account
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6">
        <div className="max-w-md mx-auto">

          {/* Business Type Options */}
          <div className="space-y-4 mb-6">

            {/* Register Business Option */}
            <button
              onClick={() => onSelectOption('register-business')}
              className="w-full p-5 border-2 border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-all duration-300 flex-shrink-0">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Register Your Business
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Register your business with CAC through our third-party integration
                  </p>

                  {/* Business Type Tags */}
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-medium text-orange-700">
                      <FileText className="w-3 h-3 mr-1" />
                      Business Name
                    </div>
                    <div className="inline-flex items-center px-2.5 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs font-medium text-purple-700">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Limited Liability Co.
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Individual Account Option */}
            <button
              onClick={() => onSelectOption('individual-account')}
              className="w-full p-5 border-2 border-border rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 text-left group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-all duration-300 flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">
                    Open an Individual Account
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    Open a personal account without business registration
                  </p>

                  {/* Features */}
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      <span>BVN & NIN verification</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      <span>Quick account opening</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Help Text */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Not sure which to choose?
                </h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Choose <strong>Register Your Business</strong> if you want to officially register a new business with CAC.
                  Choose <strong>Individual Account</strong> if you want to open a personal account without business registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}