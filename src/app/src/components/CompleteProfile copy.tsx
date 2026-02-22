import type { UserRole } from "../types/common.types";

interface CompleteProfileProps {
  onBack?: () => void;
  userRole: UserRole;
  onComplete?: () => void;
}

export function CompleteProfile({
  onBack,
  userRole,
  onComplete,
}: CompleteProfileProps) {
  const handleProfileSubmit = async () => {
    // Submit profile data to API
    // ... profile submission logic ...

    // After successful submission, call onComplete
    onComplete?.();
  };
  return (
    <div className="bg-primary text-white">
      <span className="text-white text-2xl">Complete Profile</span>
      <span>{userRole}</span>

      {/* Your form fields here */}

      <button onClick={handleProfileSubmit}>Submit Profile</button>
      <button onClick={onBack}>Go Back</button>
    </div>
  );
}
