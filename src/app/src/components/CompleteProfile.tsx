import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Pencil,
  Camera,
  Shield,
  MapPin,
  Loader2,
  X,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import type { UserRole } from "../types/common.types";
import { useSafeArea } from "../hooks/useSafeAreaView";
import { useAuthStore } from "../stores/useAuthStore";
import { toast } from "sonner";
import {
  completeAgentProfile,
  completeUserProfile,
} from "../hooks/profile/useProfileMutations";
import type { AgentFormData, UserFormData } from "../types/profile.types";
import type { LoginUserData } from "../types/api.types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CompleteProfileProps {
  onBack?: () => void;
  userRole: UserRole;
  staffData?: LoginUserData | null;
  onComplete?: () => void;
}

// ─── Floating Label Input ────────────────────────────────────────────────────

function ProfileInput({
  label,
  value,
  onChange,
  editable = true,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  editable?: boolean;
  type?: string;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isFloating = focused || hasValue;

  return (
    <div className="relative">
      {/* Label */}
      <label
        className={`absolute left-0 transition-all duration-200 pointer-events-none ${
          isFloating
            ? "-top-2.5 text-[11px] text-gray-400 font-medium"
            : "top-4 text-base text-gray-400"
        }`}
      >
        {label}
      </label>

      <div className="flex items-center border-b border-gray-200 focus-within:border-gray-900 transition-colors">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          readOnly={!editable}
          placeholder={focused ? placeholder : ""}
          className={`flex-1 pt-5 pb-3 text-base font-medium text-gray-900 bg-transparent outline-none ${
            !editable ? "text-gray-500" : ""
          }`}
          style={{ fontSize: "16px" }}
        />
        {editable && (
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Select Input ────────────────────────────────────────────────────────────

function ProfileSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}) {
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <label
        className={`absolute left-0 transition-all duration-200 pointer-events-none ${
          hasValue
            ? "-top-2.5 text-[11px] text-gray-400 font-medium"
            : "top-4 text-base text-gray-400"
        }`}
      >
        {label}
      </label>

      <div className="flex items-center border-b border-gray-200 focus-within:border-gray-900 transition-colors">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 pt-5 pb-3 text-base font-medium text-gray-900 bg-transparent outline-none appearance-none cursor-pointer"
          style={{ fontSize: "16px" }}
        >
          <option value="" disabled />
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Location Tag Chips ──────────────────────────────────────────────────────

function LocationTags({
  city,
  state,
  country,
}: {
  city: string;
  state: string;
  country: string;
}) {
  const tags = [city, state, country].filter(Boolean);

  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-[11px] text-gray-400 font-medium">Location</span>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-3.5 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium"
          >
            <MapPin className="w-3 h-3 mr-1.5 text-gray-400" />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Languages ───────────────────────────────────────────────────────────────

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "Yoruba", value: "yo" },
  { label: "Igbo", value: "ig" },
  { label: "Hausa", value: "ha" },
  { label: "Pidgin", value: "pcm" },
  { label: "French", value: "fr" },
];

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
].map((s) => ({ label: s, value: s }));

// ─── Main Component ──────────────────────────────────────────────────────────

export function CompleteProfile({
  onBack,
  userRole,
  staffData,
  onComplete,
}: CompleteProfileProps) {
  const { safeArea } = useSafeArea();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("UUUU", staffData);
  }, [staffData]);

  // Agent form state
  const [agentForm, setAgentForm] = useState<AgentFormData>({
    firstName: "",
    lastName: "",
    licenseNumber: "",
    agencyName: "",
    phoneNumber: "",
    city: "",
    state: "",
    country: "Nigeria",
  });

  // User form state
  const [userForm, setUserForm] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    city: "",
    state: "",
    country: "Nigeria",
    latitude: 0,
    longitude: 0,
    phoneNumber: "",
    preferredLanguage: "en",
  });

  useEffect(() => {
    const email = staffData?.email || "";

    if (userRole === "Agent") {
      setAgentForm((prev) => ({
        ...prev,
        phoneNumber: prev.phoneNumber || "",
        // Pre-fill anything available from staffData
      }));
    } else {
      setUserForm((prev) => ({
        ...prev,
        phoneNumber: prev.phoneNumber || "",
      }));
    }
  }, [staffData, userRole]);

  // Get current location for user role
  useEffect(() => {
    if (userRole === "User" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        () => {
          // Silently fail - user can still submit without location
        },
      );
    }
  }, [userRole]);

  const updateAgentField = (field: keyof AgentFormData, value: string) => {
    setAgentForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateUserField = (
    field: keyof UserFormData,
    value: string | number,
  ) => {
    setUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const isAgentFormValid = () => {
    const {
      firstName,
      lastName,
      licenseNumber,
      agencyName,
      phoneNumber,
      city,
      state,
    } = agentForm;
    return (
      firstName.trim() &&
      lastName.trim() &&
      licenseNumber.trim() &&
      agencyName.trim() &&
      phoneNumber.trim() &&
      city.trim() &&
      state.trim()
    );
  };

  const isUserFormValid = () => {
    const { firstName, lastName, phoneNumber, city, state } = userForm;
    return (
      firstName.trim() &&
      lastName.trim() &&
      phoneNumber.trim() &&
      city.trim() &&
      state.trim()
    );
  };

  const isFormValid =
    userRole === "Agent" ? isAgentFormValid() : isUserFormValid();

  const handleProfileSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response =
        userRole === "Agent"
          ? await completeAgentProfile(agentForm)
          : await completeUserProfile(userForm);

      if (response?.statusCode === 200 && response.user) {
        toast.success("Profile updated successfully!");
        onComplete?.();
      } else {
        toast.error(response?.message || "Failed to complete profile");
      }
    } catch (error: any) {
      console.error("ERRRR", error);

      toast.error("Failed to update profile", {
        description: `${error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentForm = userRole === "Agent" ? agentForm : userForm;
  const displayName = `${currentForm.firstName || ""} ${
    currentForm.lastName || ""
  }`.trim();

  return (
    <div className="bg-primary text-white h-full flex flex-col">
      {/* <div className="min-h-screen bg-white flex flex-col"> */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          <h1 className="text-base font-semibold text-white">My Profile</h1>

          <div className="flex items-center space-x-3" />
        </div>
      </div>

      <div
        className="bg-gray-50 flex-1 rounded-t-3xl px-6 py-4 text-gray-900 overflow-y-auto"
        style={{ paddingBottom: `${64 + safeArea.bottom}px` }}
      >
        {/* ── Avatar Section ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center pt-2 pb-6">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-lg">
              <img
                src={staffData?.profilePhoto || "/User-80.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Camera button */}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-gray-700 active:scale-95 transition-all">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Name & Badge */}
          <h2 className="text-lg font-bold text-gray-900">
            {displayName || staffData?.email || "Complete Your Profile"}
          </h2>

          <div className="flex items-center gap-1.5 mt-1">
            {/* <Shield className="w-3.5 h-3.5 text-amber-500" /> */}
            <img
              src={"/Prize.svg"}
              alt="Profile"
              className="w-3.5 h-3.5 object-cover"
            />
            <span className="text-sm text-gray-500 font-medium">
              {userRole === "Agent" ? "Verified Agent" : "Verified User"}
            </span>
          </div>
        </div>

        {/* ── Form Fields ───────────────────────────────────────────────── */}
        <div className="px-6 space-y-6 pb-6">
          {/* ── Common Fields ─────────────────────────────────────────── */}
          <ProfileInput
            label="First Name"
            value={
              userRole === "Agent" ? agentForm.firstName : userForm.firstName
            }
            onChange={(val) =>
              userRole === "Agent"
                ? updateAgentField("firstName", val)
                : updateUserField("firstName", val)
            }
            placeholder="Enter your first name"
          />

          <ProfileInput
            label="Last Name"
            value={
              userRole === "Agent" ? agentForm.lastName : userForm.lastName
            }
            onChange={(val) =>
              userRole === "Agent"
                ? updateAgentField("lastName", val)
                : updateUserField("lastName", val)
            }
            placeholder="Enter your last name"
          />

          {/* Email (read-only from auth) */}
          <ProfileInput
            label="Email Address"
            value={staffData?.email || ""}
            onChange={() => {}}
            editable={false}
          />

          <ProfileInput
            label="Phone Number"
            value={
              userRole === "Agent"
                ? agentForm.phoneNumber
                : userForm.phoneNumber
            }
            onChange={(val) =>
              userRole === "Agent"
                ? updateAgentField("phoneNumber", val)
                : updateUserField("phoneNumber", val)
            }
            type="tel"
            placeholder="e.g. 08012345678"
          />

          {/* ── Agent-Specific Fields ─────────────────────────────────── */}
          {userRole === "Agent" && (
            <>
              <ProfileInput
                label="License Number"
                value={agentForm.licenseNumber}
                onChange={(val) => updateAgentField("licenseNumber", val)}
                placeholder="Enter your license number"
              />

              <ProfileInput
                label="Agency Name"
                value={agentForm.agencyName}
                onChange={(val) => updateAgentField("agencyName", val)}
                placeholder="Enter your agency name"
              />
            </>
          )}

          {/* ── User-Specific Fields ──────────────────────────────────── */}
          {userRole === "User" && (
            <ProfileSelect
              label="Preferred Language"
              value={userForm.preferredLanguage}
              onChange={(val) => updateUserField("preferredLanguage", val)}
              options={LANGUAGES}
            />
          )}

          {/* ── Location Fields (Both Roles) ──────────────────────────── */}
          <div className="pt-2">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-4">
              Location
            </p>

            <div className="space-y-6">
              <ProfileInput
                label="City"
                value={userRole === "Agent" ? agentForm.city : userForm.city}
                onChange={(val) =>
                  userRole === "Agent"
                    ? updateAgentField("city", val)
                    : updateUserField("city", val)
                }
                placeholder="e.g. Lagos"
              />

              <ProfileSelect
                label="State"
                value={userRole === "Agent" ? agentForm.state : userForm.state}
                onChange={(val) =>
                  userRole === "Agent"
                    ? updateAgentField("state", val)
                    : updateUserField("state", val)
                }
                options={NIGERIAN_STATES}
              />

              <ProfileInput
                label="Country"
                value={
                  userRole === "Agent" ? agentForm.country : userForm.country
                }
                onChange={(val) =>
                  userRole === "Agent"
                    ? updateAgentField("country", val)
                    : updateUserField("country", val)
                }
                editable={false}
              />
            </div>
          </div>

          {/* ── Location Tags Preview ─────────────────────────────────── */}
          <LocationTags
            city={userRole === "Agent" ? agentForm.city : userForm.city}
            state={userRole === "Agent" ? agentForm.state : userForm.state}
            country={
              userRole === "Agent" ? agentForm.country : userForm.country
            }
          />
        </div>
      </div>

      {/* ── Fixed Bottom Button ─────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4"
        style={{ paddingBottom: `${safeArea.bottom + 16}px` }}
      >
        <button
          onClick={handleProfileSubmit}
          disabled={!isFormValid || isSubmitting}
          className="w-full py-4 bg-gray-900 text-white font-semibold text-base rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
    </div>
  );
}
