import type { UserRole } from "../types/common.types";

interface CompleteProfileProps {
  onBack?: () => void;
  userRole: UserRole;
}

export function CompleteProfile({
  onBack,
  userRole,
}: //   staffData,
//   onShowNotifications,
//   onNavigateToAddProperty
CompleteProfileProps) {
  return (
    <div className="bg-primary text-white">
      <span className="text-white text-2xl">Complete Profile</span>

      <span>{userRole}</span>
      <button onClick={onBack}>Go Back</button>
    </div>
  );
}
