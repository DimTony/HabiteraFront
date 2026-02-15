import { AlertTriangle, LogOut, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

/**
 * Props for AutoLogoutWarning component
 */
interface AutoLogoutWarningProps {
  /**
   * Whether the warning dialog should be shown
   */
  open: boolean;

  /**
   * Remaining time in seconds before auto logout
   */
  remainingSeconds: number;

  /**
   * Callback when user clicks "Stay Logged In"
   */
  onStayLoggedIn: () => void;

  /**
   * Callback when user clicks "Logout Now"
   */
  onLogout: () => void;
}

/**
 * Warning modal displayed before auto logout due to inactivity
 *
 * Features:
 * - Shows countdown timer
 * - Allows user to extend session
 * - Provides manual logout option
 * - Cannot be dismissed by clicking outside or ESC key (for security)
 *
 * @example
 * ```tsx
 * <AutoLogoutWarning
 *   open={showWarning}
 *   remainingSeconds={60}
 *   onStayLoggedIn={resetTimer}
 *   onLogout={handleLogout}
 * />
 * ```
 */
export function AutoLogoutWarning({
  open,
  remainingSeconds,
  onStayLoggedIn,
  onLogout,
}: AutoLogoutWarningProps) {
  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e: any) => e.preventDefault()}
        onEscapeKeyDown={(e: any) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-yellow-100">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You've been inactive for a while. For your security, you will be
            automatically logged out soon.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Time remaining:</span>
            </div>
            <div className="text-4xl font-bold text-red-600 tabular-nums">
              {formatTime(remainingSeconds)}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button
            onClick={onStayLoggedIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            Stay Logged In
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            size="lg"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}