import { useState, useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { toast } from 'sonner';
import { formatErrorMessage } from '../utils/errorMessageFormatter';
import { useGenerateOTPByUsernameMutation, useValidateOTPForgotPasswordMutation } from '../hooks/auth/useAuthMutations';

interface ForgotPasswordOTPScreenProps {
  username: string;
  onBack: () => void;
  onOTPValidated: (username: string, otp: string) => void;
}

export function ForgotPasswordOTPScreen({
  username,
  onBack,
  onOTPValidated
}: ForgotPasswordOTPScreenProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const validateOTPMutation = useValidateOTPForgotPasswordMutation();
  const generateOTPMutation = useGenerateOTPByUsernameMutation();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && !isLoading) {
      handleVerifyOTP(otp);
    }
  }, [otp]);

  const handleVerifyOTP = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      toast.error('Invalid OTP', {
        description: 'Please enter all 6 digits'
      });
      return;
    }

    setIsLoading(true);
//     console.log('🔐 [FORGOT PASSWORD] Validating OTP for username:', sanitizeForLog(username));

    try {
      await validateOTPMutation.mutateAsync({
        otp: otpCode,
        recipientId: username // Use username as recipientId
      });

//       console.log('✅ [FORGOT PASSWORD] OTP validated successfully');

      toast.success('OTP Verified!', {
        description: 'Proceeding to reset your password...'
      });

      // Navigate to new password screen
      setTimeout(() => {
        onOTPValidated(username, otpCode);
      }, 500);

    } catch (error) {
//       console.error('❌ [FORGOT PASSWORD] OTP validation failed:', error);

      // Clear OTP on error
      setOtp('');

      toast.error('Invalid OTP', {
        description: formatErrorMessage(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
//     console.log('📱 [FORGOT PASSWORD] Resending OTP for username:', sanitizeForLog(username));

    try {
      await generateOTPMutation.mutateAsync(username);

      toast.success('OTP Resent!', {
        description: 'A new verification code has been sent'
      });

      // Reset countdown
      setCountdown(60);
      setCanResend(false);

      // Clear current OTP
      setOtp('');

    } catch (error) {
//       console.error('❌ [FORGOT PASSWORD] Resend OTP failed:', error);
      toast.error('Failed to Resend OTP', {
        description: formatErrorMessage(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = () => {
    handleVerifyOTP(otp);
  };

  const isOTPComplete = otp.length === 6;

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

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-between px-6 py-8 max-w-md mx-auto w-full">

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
            <Shield className="w-10 h-10 text-primary" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-2xl text-gray-900 font-bold tracking-tight">
              Enter Verification Code
            </h1>
            <p className="text-sm text-gray-600 font-medium mt-2 px-4">
              We've sent a 6-digit code to your registered phone number.
            </p>
          </motion.div>
        </div>

        {/* OTP Input Section */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value: any) => setOtp(value)}
              disabled={isLoading}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold" style={{ fontSize: '16px' }} />
                <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold" style={{ fontSize: '16px' }} />
                <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold" style={{ fontSize: '16px' }} />
                <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold" style={{ fontSize: '16px' }} />
                <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold" style={{ fontSize: '16px' }} />
                <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold" style={{ fontSize: '16px' }} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Resend Section */}
          <div className="text-center">
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-primary hover:text-primary/80 hover:bg-primary/5 font-semibold text-sm"
              >
                Resend Code
              </Button>
            ) : (
              <p className="text-sm text-gray-600">
                Resend code in <span className="font-bold text-primary">{countdown}s</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* Verify Button Section */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button
            onClick={handleManualVerify}
            disabled={isLoading || !isOTPComplete}
            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-bold py-6 rounded-xl disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <span>Verify Code</span>
            )}
          </Button>
        </motion.div>

      </div>
    </div>
  );
}
