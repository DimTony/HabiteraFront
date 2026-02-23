import { useState } from "react";
import { ArrowLeft, Loader2, ChevronDown, Plus, X } from "lucide-react";
import { useSafeArea } from "../hooks/useSafeAreaView";
import { toast } from "sonner";
import type { UserRole } from "../types/common.types";
import {
  saveListingForLater,
  submitNewListing,
} from "../hooks/business/useListingMutations";

// ── Types ────────────────────────────────────────────────────────────────────

type PropertyType =
  | "House"
  | "Apartment"
  | "Condo"
  | "Townhouse"
  | "Land"
  | "Commercial";
type ListingType = "ForSale" | "ForRent" | "ShortLet";
type Tenor = "Daily" | "Weekly" | "Monthly" | "Yearly";
type AmenityCategory = "Interior" | "Exterior" | "Security" | "Utilities";

interface AmenityGroup {
  category: AmenityCategory;
  amenities: Record<string, string>;
}

interface NewListingPayload {
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  tenor: Tenor;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  amenities: AmenityGroup;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  price: number;
  currency: string;
}

interface AddPropertyProps {
  onBack?: () => void;
  userRole: UserRole;
  onComplete?: () => void;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES: PropertyType[] = [
  "House",
  "Apartment",
  "Condo",
  "Townhouse",
  "Land",
  "Commercial",
];
const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "ForSale", label: "For Sale" },
  { value: "ForRent", label: "For Rent" },
  { value: "ShortLet", label: "Short Let" },
];
const TENORS: Tenor[] = ["Daily", "Weekly", "Monthly", "Yearly"];
const AMENITY_CATEGORIES: AmenityCategory[] = [
  "Interior",
  "Exterior",
  "Security",
  "Utilities",
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
];

// ── Component ────────────────────────────────────────────────────────────────

export function AddProperty({
  onBack,
  userRole,
  onComplete,
}: AddPropertyProps) {
  const { safeArea } = useSafeArea();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // const [currentStep, setCurrentStep] = useState(1);
  // const totalSteps = 4;

  const [form, setForm] = useState<NewListingPayload>({
    title: "",
    description: "",
    propertyType: "House",
    listingType: "ForSale",
    tenor: "Monthly",
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
    latitude: 0,
    longitude: 0,
    amenities: {
      category: "Interior",
      amenities: {},
    },
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    lotSize: 0,
    yearBuilt: 0,
    price: 0,
    currency: "NGN",
  });

  // Amenity input state
  const [amenityKey, setAmenityKey] = useState("");
  const [amenityValue, setAmenityValue] = useState("");

  // ── Helpers ──────────────────────────────────────────────────────────────

  const updateForm = <K extends keyof NewListingPayload>(
    key: K,
    value: NewListingPayload[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateNumericField = (key: keyof NewListingPayload, value: string) => {
    const num = value === "" ? 0 : Number(value);
    if (!isNaN(num)) updateForm(key, num as any);
  };

  const addAmenity = () => {
    if (!amenityKey.trim()) return;
    setForm((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        amenities: {
          ...prev.amenities.amenities,
          [amenityKey.trim()]: amenityValue.trim(),
        },
      },
    }));
    setAmenityKey("");
    setAmenityValue("");
  };

  const removeAmenity = (key: string) => {
    setForm((prev) => {
      const updated = { ...prev.amenities.amenities };
      delete updated[key];
      return {
        ...prev,
        amenities: { ...prev.amenities, amenities: updated },
      };
    });
  };

  const isFormValid = (): boolean => {
    return (
      !!form.title.trim() &&
      !!form.description.trim() &&
      !!form.street.trim() &&
      !!form.city.trim() &&
      !!form.state.trim() &&
      form.price > 0
    );
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!isFormValid() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response =
        userRole === "Agent" ? await submitNewListing(form as any) : null;

      if (response?.statusCode === 200) {
        toast.success("Property listing created successfully!");
        onComplete?.();
      } else {
        toast.error(response?.message || "Failed to create listing");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error("Failed to submit listing", {
        description: `${error?.message || error}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveForLater = async () => {
    const missing: string[] = [];
    if (!form.title.trim()) missing.push("Title");
    if (!form.city.trim()) missing.push("City");

    if (missing.length > 0) {
      toast.error(
        `${missing.join(" and ")} ${
          missing.length > 1 ? "are" : "is"
        } required`,
      );
      return;
    }

    if (isSaving) return;
    setIsSaving(true);
    try {
      const response =
        userRole === "Agent" ? await saveListingForLater(form as any) : null;


      if (response?.statusCode === 201) {
        toast.success("Property listing saved successfully!");
        onComplete?.();
      } else {
        toast.error(response?.message || "Failed to save listing");
      }
    } catch (error) {
      toast.error("Failed to save draft", {
        description: `${error}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Shared Styles ────────────────────────────────────────────────────────

  const inputClass =
    "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  const selectClass =
    "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  // ── Render Steps ─────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

      <div>
        <label className={labelClass}>Property Title *</label>
        <input
          type="text"
          className={inputClass}
          placeholder="e.g. Luxury 3-Bedroom Apartment in Lekki"
          value={form.title}
          onChange={(e) => updateForm("title", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          className={`${inputClass} min-h-[120px] resize-none`}
          placeholder="Describe the property features, neighbourhood, and highlights..."
          value={form.description}
          onChange={(e) => updateForm("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Property Type *</label>
          <div className="relative">
            <select
              className={selectClass}
              value={form.propertyType}
              onChange={(e) =>
                updateForm("propertyType", e.target.value as PropertyType)
              }
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Listing Type *</label>
          <div className="relative">
            <select
              className={selectClass}
              value={form.listingType}
              onChange={(e) =>
                updateForm("listingType", e.target.value as ListingType)
              }
            >
              {LISTING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {form.listingType !== "ForSale" && (
        <div>
          <label className={labelClass}>Rental Tenor</label>
          <div className="relative">
            <select
              className={selectClass}
              value={form.tenor}
              onChange={(e) => updateForm("tenor", e.target.value as Tenor)}
            >
              {TENORS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Location Details
        </h2>

        <div>
          <label className={labelClass}>Street Address *</label>
          <input
            type="text"
            className={inputClass}
            placeholder="e.g. 12 Admiralty Way"
            value={form.street}
            onChange={(e) => updateForm("street", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. Lekki"
              value={form.city}
              onChange={(e) => updateForm("city", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>State *</label>
            <div className="relative">
              <select
                className={selectClass}
                value={form.state}
                onChange={(e) => updateForm("state", e.target.value)}
              >
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Country</label>
            <input
              type="text"
              className={inputClass}
              value={form.country}
              onChange={(e) => updateForm("country", e.target.value)}
              readOnly
            />
          </div>

          <div>
            <label className={labelClass}>Postal Code</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. 101233"
              value={form.postalCode}
              onChange={(e) => updateForm("postalCode", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Latitude</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0.0"
              value={form.latitude || ""}
              onChange={(e) => updateNumericField("latitude", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Longitude</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0.0"
              value={form.longitude || ""}
              onChange={(e) => updateNumericField("longitude", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Property Details
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Bedrooms</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              placeholder="0"
              value={form.bedrooms || ""}
              onChange={(e) => updateNumericField("bedrooms", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Bathrooms</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              placeholder="0"
              value={form.bathrooms || ""}
              onChange={(e) => updateNumericField("bathrooms", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Square Feet</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              placeholder="0"
              value={form.squareFeet || ""}
              onChange={(e) => updateNumericField("squareFeet", e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Lot Size (sq ft)</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              placeholder="0"
              value={form.lotSize || ""}
              onChange={(e) => updateNumericField("lotSize", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Year Built</label>
          <input
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            className={inputClass}
            placeholder={`e.g. ${new Date().getFullYear()}`}
            value={form.yearBuilt || ""}
            onChange={(e) => updateNumericField("yearBuilt", e.target.value)}
          />
        </div>

        {/* ── Amenities ─────────────────────────────────────────────────── */}
        <div>
          <label className={labelClass}>Amenities</label>

          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <div className="relative">
              <select
                className={selectClass}
                value={form.amenities.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    amenities: {
                      ...prev.amenities,
                      category: e.target.value as AmenityCategory,
                    },
                  }))
                }
              >
                {AMENITY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Existing amenities */}
          {Object.entries(form.amenities.amenities).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(form.amenities.amenities).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full"
                >
                  {key}
                  {value ? `: ${value}` : ""}
                  <button
                    type="button"
                    onClick={() => removeAmenity(key)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add amenity inputs */}
          <div className="flex gap-2">
            <input
              type="text"
              className={`${inputClass} flex-1`}
              placeholder="Name (e.g. Pool)"
              value={amenityKey}
              onChange={(e) => setAmenityKey(e.target.value)}
            />
            <input
              type="text"
              className={`${inputClass} flex-1`}
              placeholder="Detail (optional)"
              value={amenityValue}
              onChange={(e) => setAmenityValue(e.target.value)}
            />
            <button
              type="button"
              onClick={addAmenity}
              disabled={!amenityKey.trim()}
              className="px-3 py-3 bg-primary text-white rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>

        <div>
          <label className={labelClass}>Price *</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            placeholder="e.g. 50000000"
            value={form.price || ""}
            onChange={(e) => updateNumericField("price", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Currency</label>
          <div className="relative">
            <select
              className={selectClass}
              value={form.currency}
              onChange={(e) => updateForm("currency", e.target.value)}
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* ── Review Summary ───────────────────────────────────────────── */}
        <div className="mt-6 p-4 bg-gray-100 rounded-2xl space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Review Summary
          </h3>
          <SummaryRow label="Title" value={form.title} />
          <SummaryRow
            label="Type"
            value={`${form.propertyType} — ${
              LISTING_TYPES.find((l) => l.value === form.listingType)?.label
            }`}
          />
          {form.listingType !== "ForSale" && (
            <SummaryRow label="Tenor" value={form.tenor} />
          )}
          <SummaryRow
            label="Location"
            value={`${form.street}, ${form.city}, ${form.state}`}
          />
          <SummaryRow
            label="Beds / Baths"
            value={`${form.bedrooms} bed · ${form.bathrooms} bath`}
          />
          {form.squareFeet > 0 && (
            <SummaryRow
              label="Size"
              value={`${form.squareFeet.toLocaleString()} sq ft`}
            />
          )}
          <SummaryRow
            label="Price"
            value={`${form.currency} ${form.price.toLocaleString()}`}
            highlight
          />
        </div>
      </div>
    </div>
  );

  // ── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="bg-primary text-white h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <h1 className="text-base font-semibold text-white">Add a Property</h1>

          <div className="w-9" />
        </div>
      </div>

      {/* Form Body */}
      <div
        className="bg-gray-50 flex-1 rounded-t-3xl px-6 py-6 text-gray-900 overflow-y-auto"
        style={{ paddingBottom: `${80 + safeArea.bottom}px` }}
      >
        {renderStep1()}
      </div>

      {/* Fixed Bottom Buttons */}
      <div
        className="fixed flex items-center gap-3 bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4"
        style={{ paddingBottom: `${safeArea.bottom + 16}px` }}
      >
        <>
          <button
            onClick={handleSaveForLater}
            disabled={isSaving}
            className="flex-1 py-3.5 bg-transparent border-2 border-gray-900 text-gray-900 font-semibold text-sm rounded-2xl disabled:opacity-40 hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save for Later"
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="flex-1 py-3.5 bg-gray-900 text-white font-semibold text-sm rounded-2xl disabled:opacity-40 hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Listing"
            )}
          </button>
        </>
      </div>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span
        className={
          highlight ? "font-semibold text-primary" : "text-gray-900 font-medium"
        }
      >
        {value || "—"}
      </span>
    </div>
  );
}
