interface AddPropertyProps {
  onBack?: () => void;
}

export function AddProperty({
  onBack,
}: //   staffData,
//   onShowNotifications,
//   onNavigateToAddProperty
AddPropertyProps) {
  return (
    <div className="bg-primary text-white">
      <span className="text-white text-2xl">Add Property</span>

      <button onClick={onBack}>Go Back</button>
    </div>
  );
}
