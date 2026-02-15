import { useState } from 'react';
import { ArrowLeft, User, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { FloatingLabelInput } from './FloatingLabelInput';
import { toast } from 'sonner';
import { formatErrorMessage } from '../utils/errorMessageFormatter';
import { useGenerateOTPByUsernameMutation } from '../hooks/auth/useAuthMutations';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onOTPGenerated: (username: string) => void;
}

export function ForgotPasswordScreen({
  onBack,
  onOTPGenerated
}: ForgotPasswordScreenProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateOTPMutation = useGenerateOTPByUsernameMutation();

  const handleSubmit = async () => {
    // Validate username
    if (!username || username.trim().length < 3) {
      toast.error('Validation Error', {
        description: 'Please enter a valid username (minimum 3 characters)'
      });
      return;
    }

    setIsLoading(true);
//     console.log('📱 [FORGOT PASSWORD] Requesting OTP for username:', sanitizeForLog(username));

    try {
      await generateOTPMutation.mutateAsync(username.trim());

//       console.log('✅ [FORGOT PASSWORD] OTP generated successfully');

      toast.success('OTP Sent!', {
        description: 'Please check your phone for the verification code'
      });

      // Navigate to OTP screen with username only
      onOTPGenerated(username.trim());
    } catch (error) {
//       console.error('❌ [FORGOT PASSWORD] OTP generation failed:', error);
      toast.error('Failed to Send OTP', {
        description: formatErrorMessage(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header with Back Button */}
      <div className="flex items-center p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-700 hover:bg-gray-50 p-3 rounded-2xl transition-all duration-300"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Container with Even Spacing */}
      <div className="flex-1 flex flex-col justify-center px-6 py-6 max-w-md mx-auto w-full space-y-8">

        {/* Logo Section */}
        <div className="flex justify-center">
          <motion.div
            className="bg-white rounded-3xl p-6 border border-gray-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
          >
            <img
              src={'/assets/3ebf5c44175bf36c1eceb7236d272904dfc164a1.png'}
              alt="Access Bank"
              className="h-10 w-auto object-contain"
            />
          </motion.div>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-3">
          <motion.div
            className="flex items-center justify-center bg-primary/10 rounded-full w-20 h-20 mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Mail className="w-10 h-10 text-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-2xl text-gray-900 font-bold tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-600 font-medium mt-2 px-4">
              No worries! Enter your username and we'll send you a verification code to reset your password.
            </p>
          </motion.div>
        </div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <FloatingLabelInput
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              label="Username"
              className="bg-white border-2 border-gray-200 rounded-xl"
              style={{ fontSize: '16px' }}
              disabled={isLoading}
              autoFocus
            />
          </div>
        </motion.div>

        {/* Submit Button Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !username.trim()}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-bold py-6 rounded-xl disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending Code...</span>
              </div>
            ) : (
              <span>Send Verification Code</span>
            )}
          </Button>

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <span className="text-gray-700 font-medium text-sm">Remember your password? </span>
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-primary hover:text-primary/80 hover:bg-primary/5 p-0 h-auto font-bold underline-offset-4 hover:underline ml-1 text-sm"
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
