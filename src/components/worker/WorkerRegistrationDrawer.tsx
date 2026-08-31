import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Award,
  Upload,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  HeartHandshake,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SERVICE_CATEGORIES, COOPERATIVE_SOCIETIES } from '../../data/mockData';
import { ServiceType, WorkerDocument, WorkSample } from '../../types';

interface WorkerRegistrationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDIAN_STATES = [
  'Delhi (NCT)',
  'Haryana',
  'Uttar Pradesh',
  'Maharashtra',
  'Karnataka',
  'Telangana',
  'Tamil Nadu',
  'Andhra Pradesh',
  'West Bengal',
  'Rajasthan',
  'Gujarat',
  'Punjab',
  'Madhya Pradesh',
  'Bihar',
  'Kerala',
  'Odisha',
];

const SAMPLE_AVATARS = [
  {
    name: 'Photo Preset 1',
    url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    gender: 'Male',
  },
  {
    name: 'Photo Preset 2',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    gender: 'Female',
  },
  {
    name: 'Photo Preset 3',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    gender: 'Male',
  },
  {
    name: 'Photo Preset 4',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    gender: 'Female',
  },
];

const SAMPLE_WORK_PHOTOS = [
  {
    title: 'Precision Copper Pipe Fitting',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    description: 'Complete replacement of main bathroom inlet valve and PPR piping with zero leakage.',
  },
  {
    title: '3-Phase Distribution MCB Board',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    description: 'Installed 40A RCCB and 6-way distribution panel with proper earthing test.',
  },
  {
    title: 'Custom Teak Wood Modular Shelves',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80',
    description: 'Handcrafted solid wood living room wall cabinets with soft-close hinges.',
  },
];

export const WorkerRegistrationDrawer: React.FC<WorkerRegistrationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { addNewWorker, cooperatives, setCurrentRole, setActiveView, t } = useApp();

  // Current Step (1 to 7, Step 8 = Success Screen)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewDocModal, setPreviewDocModal] = useState<{ title: string; type: string; url?: string } | null>(null);

  // STEP 1 — PERSONAL DETAILS
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(SAMPLE_AVATARS[0].url);

  // STEP 2 — ADDRESS & LOCATION
  const [houseNumber, setHouseNumber] = useState('');
  const [streetLocality, setStreetLocality] = useState('');
  const [cityTown, setCityTown] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('Delhi (NCT)');
  const [pinCode, setPinCode] = useState('');

  // STEP 3 — SKILLS & PROFESSIONAL DETAILS
  const [primarySkill, setPrimarySkill] = useState<ServiceType>('Plumbing');
  const [secondarySkills, setSecondarySkills] = useState<ServiceType[]>([]);
  const [experienceYears, setExperienceYears] = useState(3);
  const [basePricePerHour, setBasePricePerHour] = useState(250);
  const [languages, setLanguages] = useState<string[]>(['Hindi', 'English']);
  const [bio, setBio] = useState('');

  // STEP 4 — CERTIFICATION & VERIFICATION
  const [cooperativeName, setCooperativeName] = useState(COOPERATIVE_SOCIETIES[0].name);
  const [membershipId, setMembershipId] = useState('');
  const [aadhaarRaw, setAadhaarRaw] = useState('');
  const [addressProofType, setAddressProofType] = useState('Voter ID Card');
  const [documents, setDocuments] = useState<WorkerDocument[]>([
    {
      id: 'doc-1',
      name: 'Skill_Competency_Certificate.pdf',
      type: 'Skill Certificate',
      fileSize: '1.8 MB',
      verified: false,
      uploadedAt: 'Just now',
    },
    {
      id: 'doc-2',
      name: 'Prior_Experience_Letter.pdf',
      type: 'Experience Certificate',
      fileSize: '950 KB',
      verified: false,
      uploadedAt: 'Just now',
    },
    {
      id: 'doc-3',
      name: 'Aadhaar_Card_Copy_Masked.pdf',
      type: 'Government ID',
      fileSize: '1.2 MB',
      verified: false,
      uploadedAt: 'Just now',
    },
  ]);

  // STEP 5 — WORK SAMPLE / SERVICE PHOTO
  const [workSamples, setWorkSamples] = useState<WorkSample[]>([
    {
      id: 'ws-1',
      title: 'Precision Work Sample 1',
      imageUrl: SAMPLE_WORK_PHOTOS[0].imageUrl,
      description: SAMPLE_WORK_PHOTOS[0].description,
    },
    {
      id: 'ws-2',
      title: 'Precision Work Sample 2',
      imageUrl: SAMPLE_WORK_PHOTOS[1].imageUrl,
      description: SAMPLE_WORK_PHOTOS[1].description,
    },
  ]);
  const [workDescription, setWorkDescription] = useState('');

  // STEP 6 — COOPERATIVE & WELFARE
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');
  const [insuranceMembership, setInsuranceMembership] = useState('ESI & PM-SYM Welfare Scheme');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');

  // STEP 7 — SECURITY & CONSENT
  const [consentAccuracy, setConsentAccuracy] = useState(true);
  const [consentVerification, setConsentVerification] = useState(true);
  const [consentPublicProfile, setConsentPublicProfile] = useState(true);

  // Track whether user attempted to advance the current step
  const [attemptedSteps, setAttemptedSteps] = useState<Record<number, boolean>>({});
  const [missingFieldsList, setMissingFieldsList] = useState<string[]>([]);

  // SUCCESS STATE
  const [submittedWorkerData, setSubmittedWorkerData] = useState<{
    id: string;
    applicationId: string;
    name: string;
    skill: string;
    cooperativeName: string;
    appliedDate: string;
  } | null>(null);

  if (!isOpen) return null;

  // Masked Aadhaar display format (e.g. XXXX XXXX 7741)
  const getMaskedAadhaarDisplay = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length < 4) return 'XXXX XXXX ' + (cleaned || '0000');
    const last4 = cleaned.slice(-4);
    return `XXXX XXXX ${last4}`;
  };

  // Helper to attach realistic sample files for quick 1-click test
  const handleAttachSampleDocs = () => {
    setDocuments([
      {
        id: `doc-${Date.now()}-1`,
        name: `${primarySkill}_National_Skill_Certificate.pdf`,
        type: 'Skill Certificate',
        fileSize: '2.1 MB',
        verified: false,
        uploadedAt: 'Just now',
      },
      {
        id: `doc-${Date.now()}-2`,
        name: 'Labour_Contract_Federation_Experience.pdf',
        type: 'Experience Certificate',
        fileSize: '1.4 MB',
        verified: false,
        uploadedAt: 'Just now',
      },
      {
        id: `doc-${Date.now()}-3`,
        name: 'Government_Identity_Aadhaar_Masked.pdf',
        type: 'Government ID',
        fileSize: '1.6 MB',
        verified: false,
        uploadedAt: 'Just now',
      },
      {
        id: `doc-${Date.now()}-4`,
        name: 'Electricity_Bill_Address_Proof.pdf',
        type: 'Address Proof',
        fileSize: '820 KB',
        verified: false,
        uploadedAt: 'Just now',
      },
    ]);
  };

  // Helper to attach sample work photos
  const handleAttachSampleWorkPhotos = () => {
    setWorkSamples([
      {
        id: `ws-${Date.now()}-1`,
        title: SAMPLE_WORK_PHOTOS[0].title,
        imageUrl: SAMPLE_WORK_PHOTOS[0].imageUrl,
        description: SAMPLE_WORK_PHOTOS[0].description,
      },
      {
        id: `ws-${Date.now()}-2`,
        title: SAMPLE_WORK_PHOTOS[1].title,
        imageUrl: SAMPLE_WORK_PHOTOS[1].imageUrl,
        description: SAMPLE_WORK_PHOTOS[1].description,
      },
      {
        id: `ws-${Date.now()}-3`,
        title: SAMPLE_WORK_PHOTOS[2].title,
        imageUrl: SAMPLE_WORK_PHOTOS[2].imageUrl,
        description: SAMPLE_WORK_PHOTOS[2].description,
      },
    ]);
  };

  // Simulated GPS Location Detection
  const handleUseCurrentLocation = () => {
    setStreetLocality('Sector 14, Main Market Road');
    setCityTown('Gurugram');
    setDistrict('Gurugram');
    setStateName('Haryana');
    setPinCode('122001');
    setErrorMessage('');
  };

  // Custom photo upload simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Document upload simulation
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: WorkerDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        verified: false,
        uploadedAt: 'Just now',
      };
      setDocuments((prev) => [...prev.filter((d) => d.type !== type), newDoc]);
    }
  };

  // Work sample upload simulation
  const handleWorkSampleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && workSamples.length < 5) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newWs: WorkSample = {
            id: `ws-${Date.now()}`,
            title: `Service Work Sample #${workSamples.length + 1}`,
            imageUrl: event.target.result as string,
            description: 'Recent professional installation and repair completed on-site.',
          };
          setWorkSamples((prev) => [...prev, newWs]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove document
  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Remove work sample
  const handleRemoveWorkSample = (id: string) => {
    setWorkSamples((prev) => prev.filter((ws) => ws.id !== id));
  };

  // Helper to calculate age from DOB
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 0 : age;
  };

  // Validation functions for each step to determine validity and missing field names
  const getStepValidationInfo = (step: number) => {
    const missing: string[] = [];
    let customErrorMsg = '';

    if (step === 1) {
      if (!fullName.trim()) missing.push('Full Name');
      if (!dob) {
        missing.push('Date of Birth');
      } else if (calculateAge(dob) < 18) {
        missing.push('Date of Birth (must be 18+ years)');
        customErrorMsg = 'You must be at least 18 years of age (DOB should be greater than 18 years).';
      }
      const digitsOnly = mobileNumber.replace(/\D/g, '');
      if (!digitsOnly || digitsOnly.length < 10) {
        missing.push('10-digit Mobile Number');
        if (!customErrorMsg) customErrorMsg = 'please enter valid number';
      }
      if (emailAddress.trim() && !emailAddress.trim().toLowerCase().endsWith('@gmail.com')) {
        missing.push('Email (must end with @gmail.com)');
        if (!customErrorMsg) customErrorMsg = 'Please enter a valid email';
      }
      if (!accountPassword.trim() || accountPassword.length < 4) {
        missing.push('Account Password (min 4 characters)');
        if (!customErrorMsg) customErrorMsg = 'Please enter a secure password for your worker account.';
      }
      if (!avatarUrl) {
        missing.push('Profile Photo');
      }
    }

    if (step === 2) {
      if (!houseNumber.trim()) missing.push('House / Flat No.');
      if (!streetLocality.trim()) missing.push('Street / Locality');
      if (!cityTown.trim()) missing.push('City / Town');
      if (!district.trim()) missing.push('District');
      if (!stateName.trim()) missing.push('State');
      const pinDigits = pinCode.replace(/\D/g, '');
      if (!pinDigits || pinDigits.length < 6) missing.push('6-digit PIN Code');
    }

    if (step === 3) {
      if (!primarySkill) missing.push('Primary Trade / Skill');
      if (experienceYears <= 0) missing.push('Years of Experience');
    }

    if (step === 4) {
      if (!cooperativeName.trim()) missing.push('Labour Cooperative Society');
      if (!aadhaarRaw.trim() || aadhaarRaw.replace(/\D/g, '').length < 4) missing.push('Aadhaar / National ID');
      if (documents.length === 0) missing.push('At least 1 Verification Document');
    }

    if (step === 6) {
      if (!emergencyName.trim()) missing.push('Emergency Contact Name');
      const emergencyDigits = emergencyPhone.replace(/\D/g, '');
      if (!emergencyDigits || emergencyDigits.length < 10) missing.push('10-digit Emergency Phone');
    }

    if (step === 7) {
      if (!consentAccuracy) missing.push('Accuracy Confirmation Checkbox');
      if (!consentVerification) missing.push('Verification Authorization Checkbox');
      if (!consentPublicProfile) missing.push('Public Profile Consent Checkbox');
    }

    return {
      isValid: missing.length === 0,
      missing,
      customErrorMsg,
    };
  };

  // Validation per step
  const validateCurrentStep = (): boolean => {
    setAttemptedSteps((prev) => ({ ...prev, [currentStep]: true }));
    const { isValid, missing, customErrorMsg } = getStepValidationInfo(currentStep);

    if (!isValid) {
      setMissingFieldsList(missing);
      if (customErrorMsg) {
        setErrorMessage(customErrorMsg);
      } else {
        setErrorMessage(`Please fill the required columns: ${missing.join(', ')}`);
      }
      return false;
    }

    setErrorMessage('');
    setMissingFieldsList([]);
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
      setErrorMessage('');
      setMissingFieldsList([]);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    setMissingFieldsList([]);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const coopList = cooperatives && cooperatives.length > 0 ? cooperatives : COOPERATIVE_SOCIETIES;
      const coopObj = coopList.find((c) => c.name === cooperativeName) || coopList[0];
      const approxLocation = `${streetLocality ? streetLocality + ', ' : ''}${cityTown}, ${stateName}`;

      let workerLat = 28.5700;
      let workerLng = 77.2200;
      const lowerCity = (cityTown + ' ' + district + ' ' + stateName).toLowerCase();
      if (lowerCity.includes('gurugram') || lowerCity.includes('gurgaon')) {
        workerLat = 28.4595;
        workerLng = 77.0266;
      } else if (lowerCity.includes('noida')) {
        workerLat = 28.5708;
        workerLng = 77.3271;
      } else if (lowerCity.includes('dwarka')) {
        workerLat = 28.5921;
        workerLng = 77.0460;
      } else if (lowerCity.includes('saket') || lowerCity.includes('south')) {
        workerLat = 28.5245;
        workerLng = 77.2177;
      }

      const createdWorker = await addNewWorker({
        name: fullName.trim() || 'Worker Applicant',
        avatar: avatarUrl,
        skill: primarySkill,
        secondarySkills,
        experienceYears: Number(experienceYears) || 4,
        basePricePerHour: Number(basePricePerHour) || 250,
        cooperativeId: coopObj.id,
        cooperativeName: coopObj.name,
        location: approxLocation,
        latitude: workerLat,
        longitude: workerLng,
        phone: mobileNumber.startsWith('+91') ? mobileNumber : `+91 ${mobileNumber}`,
        bio,
        languages,
        dob,
        gender,
        email: emailAddress.trim().toLowerCase(),
        password: accountPassword.trim(),
        address: {
          houseNumber,
          street: streetLocality,
          town: cityTown,
          district,
          state: stateName,
          pinCode,
        },
        maskedAadhaar: getMaskedAadhaarDisplay(aadhaarRaw),
        membershipId: membershipId || `COOP-${Date.now().toString().slice(-4)}`,
        documents,
        workSamples,
        workDescription,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation,
        },
        insuranceDetails: {
          membership: insuranceMembership,
          policyNumber: insurancePolicyNumber,
        },
        verificationDocType: `${coopObj.name} Attested Dossier`,
      });

      setSubmittedWorkerData({
        id: createdWorker.id,
        applicationId: createdWorker.applicationId || 'SHK-WKR-2026-8492',
        name: createdWorker.name,
        skill: createdWorker.skill,
        cooperativeName: createdWorker.cooperativeName,
        appliedDate: createdWorker.appliedDate || 'Today',
      });
      setCurrentStep(8); // Success View
    } catch (err: any) {
      setErrorMessage(err.message || 'Worker application registration failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCurrentStep(1);
    setErrorMessage('');
    setSubmittedWorkerData(null);
    onClose();
  };

  const handleGoToAdminVerification = () => {
    handleResetAndClose();
    setCurrentRole('admin');
    setActiveView('admin-verification');
  };

  // Step definition items for tracker
  const STEPS_LIST = [
    { num: 1, title: 'Personal' },
    { num: 2, title: 'Address' },
    { num: 3, title: 'Skills' },
    { num: 4, title: 'Documents' },
    { num: 5, title: 'Work' },
    { num: 6, title: 'Welfare' },
    { num: 7, title: 'Consent' },
  ];

  return (
    <>
      {/* Background Dark Backdrop */}
      <div
        onClick={handleResetAndClose}
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-over Right Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl md:max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-300 ease-out"
        role="dialog"
        aria-modal="true"
      >
        {/* Sticky Drawer Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                  <HeartHandshake className="w-3 h-3" />
                  <span>Labour Cooperative Registration</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Join Sahaayak as a Worker
                </h2>
                <p className="text-xs text-slate-300 line-clamp-1">
                  Register with your Labour Cooperative Society to receive verified service opportunities.
                </p>
              </div>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar (Only visible before success) */}
          {currentStep <= 7 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-emerald-400">
                  Step {currentStep} of 7: {STEPS_LIST[currentStep - 1]?.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  {Math.round((currentStep / 7) * 100)}% Complete
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${(currentStep / 7) * 100}%` }}
                />
              </div>

              {/* Step Badges Row */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[11px]">
                {STEPS_LIST.map((s) => {
                  const isCompleted = currentStep > s.num;
                  const isActive = currentStep === s.num;
                  return (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => {
                        if (s.num < currentStep) setCurrentStep(s.num);
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : isCompleted
                          ? 'bg-slate-800 text-emerald-300 hover:bg-slate-700 cursor-pointer'
                          : 'text-slate-500 cursor-default'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="text-[10px] shrink-0 font-bold">{s.num}</span>
                      )}
                      <span className="hidden sm:inline">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Body Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Inline Error Notice if validation fails */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: PERSONAL DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 1 — Personal Details</h3>
                <p className="text-xs text-slate-500">
                  Provide your primary identity information as registered in government records.
                </p>
              </div>

              {/* Profile Photo Picker */}
              <div
                className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                  attemptedSteps[1] && !avatarUrl
                    ? 'bg-red-50/40 border-red-400 ring-2 ring-red-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 block">
                    Profile Photo <span className="text-red-500">*</span>
                  </label>
                  {attemptedSteps[1] && !avatarUrl && (
                    <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      Required profile photo
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    <img
                      src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt="Worker profile preview"
                      className={`w-20 h-20 rounded-2xl object-cover border-2 shadow-sm ${
                        attemptedSteps[1] && !avatarUrl ? 'border-red-500' : 'border-emerald-500'
                      }`}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors">
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handlePhotoUpload(e);
                            if (errorMessage.includes('Profile Photo') || errorMessage.includes('please fill the details correctly')) {
                              setErrorMessage('');
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl(SAMPLE_AVATARS[1].url);
                          if (errorMessage.includes('Profile Photo') || errorMessage.includes('please fill the details correctly')) {
                            setErrorMessage('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Sample 2
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarUrl(SAMPLE_AVATARS[2].url);
                          if (errorMessage.includes('Profile Photo') || errorMessage.includes('please fill the details correctly')) {
                            setErrorMessage('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Sample 3
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Clear passport-style photo showing your face. JPG, PNG or WEBP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    Full Name (as on Aadhaar/Govt ID) <span className="text-red-500">*</span>
                  </label>
                  {attemptedSteps[1] && !fullName.trim() && (
                    <span className="text-[10px] text-red-500 font-medium">
                      Full Name is required
                    </span>
                  )}
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="Enter your full legal name as per Aadhaar"
                    className={`w-full text-xs bg-slate-50 border rounded-xl py-2.5 pl-9 pr-3 text-slate-900 focus:bg-white font-medium ${
                      attemptedSteps[1] && !fullName.trim()
                        ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                        : 'border-slate-200 focus:outline-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    {dob ? (
                      <span
                        className={`text-[10px] font-medium ${
                          calculateAge(dob) < 18 ? 'text-red-500 font-bold' : 'text-emerald-600'
                        }`}
                      >
                        {calculateAge(dob)} yrs old {calculateAge(dob) < 18 ? '(Must be 18+)' : '✓'}
                      </span>
                    ) : attemptedSteps[1] ? (
                      <span className="text-[10px] text-red-500 font-medium">
                        DOB is required
                      </span>
                    ) : null}
                  </div>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={dob}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                      onChange={(e) => {
                        setDob(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      className={`w-full text-xs bg-slate-50 border rounded-xl py-2.5 pl-9 pr-3 text-slate-900 focus:bg-white font-medium ${
                        attemptedSteps[1] && (!dob || calculateAge(dob) < 18)
                          ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                          : 'border-slate-200 focus:outline-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-colors ${
                          gender === g
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Number & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      Mobile Number (Aadhaar linked) <span className="text-red-500">*</span>
                    </label>
                    {((mobileNumber.length > 0 && mobileNumber.length < 10) || (attemptedSteps[1] && mobileNumber.length < 10)) && (
                      <span className="text-[10px] text-red-500 font-medium">
                        please enter valid number
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="bg-slate-200 border border-r-0 border-slate-300 px-2.5 py-2.5 rounded-l-xl text-xs font-bold text-slate-700">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      value={mobileNumber}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setMobileNumber(onlyDigits);
                        if (errorMessage === 'please enter valid number') {
                          setErrorMessage('');
                        }
                      }}
                      placeholder="9876543210"
                      className={`w-full text-xs bg-slate-50 border rounded-r-xl py-2.5 px-3 text-slate-900 focus:bg-white font-medium font-mono ${
                        (attemptedSteps[1] && mobileNumber.length < 10) || (mobileNumber.length > 0 && mobileNumber.length < 10)
                          ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                          : 'border-slate-200 focus:outline-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    {emailAddress.trim() && !emailAddress.trim().toLowerCase().endsWith('@gmail.com') && (
                      <span className="text-[10px] text-red-500 font-medium">
                        Must end with @gmail.com
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                      if (errorMessage === 'Please enter a valid email') {
                        setErrorMessage('');
                      }
                    }}
                    placeholder="worker.name@gmail.com"
                    className={`w-full text-xs bg-slate-50 border rounded-xl py-2.5 px-3 text-slate-900 focus:bg-white font-medium ${
                      emailAddress.trim() && !emailAddress.trim().toLowerCase().endsWith('@gmail.com')
                        ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                        : 'border-slate-200 focus:outline-emerald-500'
                    }`}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      Account Password <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Used for secure worker portal sign in</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={accountPassword}
                      onChange={(e) => {
                        setAccountPassword(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Enter a secure account password (min 4 chars)"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-slate-900 focus:bg-white font-medium focus:outline-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: ADDRESS & LOCATION */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 2 — Address & Location</h3>
                  <p className="text-xs text-slate-500">
                    Your residential area for approximate cooperative service dispatch.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Use Current GPS</span>
                </button>
              </div>

              {/* Privacy Notice Card */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-bold">Privacy Protection Policy</strong>
                  <p className="text-[11px] text-amber-800">
                    Your full home address is confidential and kept strictly with the Cooperative Federation. Customers only see your broad service zone (e.g. &ldquo;Sector 14, Gurugram&rdquo;).
                  </p>
                </div>
              </div>

              {/* House No & Street */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      House / Flat / Building No. <span className="text-red-500">*</span>
                    </label>
                    {attemptedSteps[2] && !houseNumber.trim() && (
                      <span className="text-[10px] text-red-500 font-medium">Required</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={houseNumber}
                    onChange={(e) => {
                      setHouseNumber(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Flat 304, Block C"
                    className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:bg-white font-medium ${
                      attemptedSteps[2] && !houseNumber.trim()
                        ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                        : 'border-slate-200 focus:outline-emerald-500'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      Street / Locality / Sector <span className="text-red-500">*</span>
                    </label>
                    {attemptedSteps[2] && !streetLocality.trim() && (
                      <span className="text-[10px] text-red-500 font-medium">Required</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={streetLocality}
                    onChange={(e) => {
                      setStreetLocality(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Sector 14, Main Market"
                    className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:bg-white font-medium ${
                      attemptedSteps[2] && !streetLocality.trim()
                        ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                        : 'border-slate-200 focus:outline-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* City / District / State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    {attemptedSteps[2] && !cityTown.trim() && (
                      <span className="text-[10px] text-red-500 font-medium">Required</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={cityTown}
                    onChange={(e) => {
                      setCityTown(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Gurugram"
                    className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:bg-white font-medium ${
                      attemptedSteps[2] && !cityTown.trim()
                        ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                        : 'border-slate-200 focus:outline-emerald-500'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      District <span className="text-red-500">*</span>
                    </label>
                    {attemptedSteps[2] && !district.trim() && (
                      <span className="text-[10px] text-red-500 font-medium">Required</span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="e.g. Gurugram"
                    className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:bg-white font-medium ${
                      attemptedSteps[2] && !district.trim()
                        ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                        : 'border-slate-200 focus:outline-emerald-500'
                    }`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-emerald-500 focus:bg-white font-medium"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PIN Code */}
              <div className="space-y-1.5 sm:w-1/2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  {attemptedSteps[2] && pinCode.replace(/\D/g, '').length < 6 && (
                    <span className="text-[10px] text-red-500 font-medium">
                      Enter 6-digit PIN
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pinCode}
                  onChange={(e) => {
                    setPinCode(e.target.value.replace(/\D/g, ''));
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. 122001"
                  className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:bg-white font-medium font-mono ${
                    attemptedSteps[2] && pinCode.replace(/\D/g, '').length < 6
                      ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                      : 'border-slate-200 focus:outline-emerald-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SKILLS & PROFESSIONAL DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 3 — Skills & Experience</h3>
                <p className="text-xs text-slate-500">
                  Select your primary trade and secondary skill specializations.
                </p>
              </div>

              {/* Primary Trade Selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 block">
                    Primary Trade / Skill <span className="text-red-500">*</span>
                  </label>
                  {attemptedSteps[3] && !primarySkill && (
                    <span className="text-[10px] text-red-500 font-medium">
                      Please select a primary trade
                    </span>
                  )}
                </div>
                <div
                  className={`grid grid-cols-2 sm:grid-cols-3 gap-2 p-1 rounded-2xl ${
                    attemptedSteps[3] && !primarySkill ? 'ring-2 ring-red-400 bg-red-50/30 p-2' : ''
                  }`}
                >
                  {SERVICE_CATEGORIES.map((c) => {
                    const isSelected = primarySkill === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setPrimarySkill(c.id);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs font-bold block">{c.title}</span>
                        <span className="text-[10px] text-slate-500 mt-1">₹{c.startingPrice}/hr baseline</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Skills Multi-select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Secondary Skills <span className="text-slate-400 font-normal">(Select all that apply)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICE_CATEGORIES.map((c) => {
                    if (c.id === primarySkill) return null;
                    const isSelected = secondarySkills.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSecondarySkills(secondarySkills.filter((s) => s !== c.id));
                          } else {
                            setSecondarySkills([...secondarySkills, c.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {c.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience & Wage Expectation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs font-bold text-emerald-700">{experienceYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1 yr</span>
                    <span>10 yrs</span>
                    <span>20 yrs</span>
                    <span>30+ yrs</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Base Wage Expectation (₹ / hour)
                  </label>
                  <input
                    type="number"
                    min={150}
                    max={1500}
                    step={25}
                    value={basePricePerHour}
                    onChange={(e) => setBasePricePerHour(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-emerald-500 font-medium font-mono"
                  />
                  <span className="text-[10px] text-slate-500">
                    Cooperative fair benchmark: ₹200–₹450/hr depending on trade.
                  </span>
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Languages Spoken
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Hindi', 'English', 'Telugu', 'Bengali', 'Marathi', 'Tamil', 'Kannada', 'Punjabi'].map((lang) => {
                    const isChecked = languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setLanguages(languages.filter((l) => l !== lang));
                          } else {
                            setLanguages([...languages, lang]);
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                          isChecked
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isChecked ? '✓ ' : ''}
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Short Professional Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your specializations, tools owned, and major repair capabilities..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: CERTIFICATION & VERIFICATION */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 4 — Documents & Verification</h3>
                  <p className="text-xs text-slate-500">
                    Upload official credentials for review by the Cooperative Federation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleAttachSampleDocs();
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ⚡ Attach Sample Docs
                </button>
              </div>

              {/* Cooperative Society Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    Labour Cooperative Society <span className="text-red-500">*</span>
                  </label>
                  {attemptedSteps[4] && !cooperativeName.trim() && (
                    <span className="text-[10px] text-red-500 font-medium">Required</span>
                  )}
                </div>
                <select
                  value={cooperativeName}
                  onChange={(e) => {
                    setCooperativeName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`w-full text-xs bg-slate-50 border rounded-xl p-3 text-slate-900 focus:bg-white font-medium ${
                    attemptedSteps[4] && !cooperativeName.trim()
                      ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                      : 'border-slate-200 focus:outline-emerald-500'
                  }`}
                >
                  {(cooperatives && cooperatives.length > 0 ? cooperatives : COOPERATIVE_SOCIETIES).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.district}, {c.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Membership ID & Aadhaar / Govt ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Membership ID / Trade Card No.
                  </label>
                  <input
                    type="text"
                    value={membershipId}
                    onChange={(e) => setMembershipId(e.target.value)}
                    placeholder="e.g. COOP-DL-2026-4892"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700">
                      Aadhaar / National ID <span className="text-red-500">*</span>
                    </label>
                    {attemptedSteps[4] && (!aadhaarRaw.trim() || aadhaarRaw.replace(/\D/g, '').length < 4) && (
                      <span className="text-[10px] text-red-500 font-medium">
                        Enter Aadhaar / ID number
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={aadhaarRaw}
                    onChange={(e) => {
                      setAadhaarRaw(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="12-digit Aadhaar Number"
                    className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-900 font-mono ${
                      attemptedSteps[4] && (!aadhaarRaw.trim() || aadhaarRaw.replace(/\D/g, '').length < 4)
                        ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                        : 'border-slate-200 focus:outline-emerald-500'
                    }`}
                  />
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    Masked preview: <strong>{getMaskedAadhaarDisplay(aadhaarRaw)}</strong>
                  </span>
                </div>
              </div>

              {/* Document Upload Sections */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Required Verification Dossier <span className="text-red-500">*</span>
                  </h4>
                  <span
                    className={`text-xs ${
                      attemptedSteps[4] && documents.length === 0 ? 'text-red-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {documents.length} Files Attached {attemptedSteps[4] && documents.length === 0 ? '(At least 1 required)' : ''}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-1 rounded-2xl ${
                    attemptedSteps[4] && documents.length === 0 ? 'ring-2 ring-red-400 bg-red-50/20 p-2.5' : ''
                  }`}
                >
                  {[
                    { label: 'Skill Certificate (NSDC / ITI / Trade)', type: 'Skill Certificate' },
                    { label: 'Experience Certificate / Union Card', type: 'Experience Certificate' },
                    { label: 'Government ID / Masked Aadhaar', type: 'Government ID' },
                    { label: 'Address Proof (Voter ID / Bill)', type: 'Address Proof' },
                  ].map((docType) => {
                    const existing = documents.find((d) => d.type === docType.type);
                    return (
                      <div
                        key={docType.type}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            {docType.label}
                          </span>
                          {existing ? (
                            <div className="mt-2 flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-slate-900 block truncate">
                                    {existing.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {existing.fileSize} • Uploaded
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewDocModal({
                                      title: existing.name,
                                      type: existing.type,
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-slate-700"
                                  title="View document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDoc(existing.id)}
                                  className="p-1 text-red-400 hover:text-red-600"
                                  title="Remove document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="mt-2 flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 cursor-pointer transition-colors text-xs font-semibold text-slate-600">
                              <Upload className="w-4 h-4 text-slate-400" />
                              <span>Attach PDF or Image</span>
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={(e) => {
                                  handleDocumentUpload(e, docType.type);
                                  if (errorMessage) setErrorMessage('');
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security & Masking Note */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cooperative Verification Protocol</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Documents will be reviewed by the Cooperative Federation before your profile becomes visible to customers. Private identity documents and full Aadhaar numbers are never shown on public customer profiles.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: SHOW YOUR WORK */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Step 5 — Show Your Work</h3>
                  <p className="text-xs text-slate-500">
                    Upload photos of past service jobs, repairs, or project finishes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAttachSampleWorkPhotos}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  ⚡ Sample Work Gallery
                </button>
              </div>

              {/* Work Samples Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Uploaded Work Photos ({workSamples.length}/5)</span>
                  <label className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWorkSampleUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {workSamples.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {workSamples.map((ws) => (
                      <div
                        key={ws.id}
                        className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative group"
                      >
                        <img
                          src={ws.imageUrl}
                          alt={ws.title}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkSample(ws.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="p-3">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{ws.title}</h5>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {ws.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                    <h5 className="text-xs font-bold text-slate-700">No work photos attached yet</h5>
                    <p className="text-[11px] text-slate-500">
                      Showcasing your past repairs increases booking acceptance by over 40%.
                    </p>
                  </div>
                )}
              </div>

              {/* Work Description */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">
                  Describe Your Previous Work & Expertise
                </label>
                <textarea
                  rows={3}
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Mention your key projects, residential complexes serviced, or specialized tools you handle..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 6: COOPERATIVE & WELFARE */}
          {/* ========================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 6 — Cooperative & Welfare</h3>
                <p className="text-xs text-slate-500">
                  Emergency contacts and social welfare protection details.
                </p>
              </div>

              {/* Society confirmation summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Registered Labour Cooperative Society
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{cooperativeName}</h4>
                  <p className="text-[11px] text-slate-500">Membership Card: {membershipId}</p>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Emergency Contact Details <span className="text-red-500">*</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700">Contact Name *</label>
                      {attemptedSteps[6] && !emergencyName.trim() && (
                        <span className="text-[10px] text-red-500 font-medium">Required</span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={emergencyName}
                      onChange={(e) => {
                        setEmergencyName(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Enter emergency contact person's name"
                      className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:bg-white ${
                        attemptedSteps[6] && !emergencyName.trim()
                          ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                          : 'border-slate-200 focus:outline-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700">Contact Phone *</label>
                      {attemptedSteps[6] && emergencyPhone.replace(/\D/g, '').length < 10 && (
                        <span className="text-[10px] text-red-500 font-medium">
                          10 digits required
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      value={emergencyPhone}
                      onChange={(e) => {
                        const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setEmergencyPhone(onlyDigits);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="9811122334"
                      className={`w-full text-xs bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:bg-white font-mono ${
                        attemptedSteps[6] && emergencyPhone.replace(/\D/g, '').length < 10
                          ? 'border-red-400 ring-2 ring-red-200 bg-red-50/20 focus:outline-red-500'
                          : 'border-slate-200 focus:outline-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Relationship</label>
                    <select
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-emerald-500"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Child">Child</option>
                      <option value="Relative">Relative</option>
                      <option value="Friend">Friend</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Welfare & Insurance info */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Welfare Scheme & Accidental Cover
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Welfare Membership</label>
                    <input
                      type="text"
                      value={insuranceMembership}
                      onChange={(e) => setInsuranceMembership(e.target.value)}
                      placeholder="e.g. ESI / PM-SYM Scheme"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Policy / Card No.</label>
                    <input
                      type="text"
                      value={insurancePolicyNumber}
                      onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                      placeholder="e.g. ESI-REG-994182"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Welfare Privacy Note */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Your welfare and emergency information is kept private with your cooperative administrator and is not displayed to customers.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 7: SECURITY & CONSENT */}
          {/* ========================================================================= */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold text-slate-900">Step 7 — Security & Consent</h3>
                <p className="text-xs text-slate-500">
                  Review authorization terms before submitting your application to the Cooperative Federation.
                </p>
              </div>

              {/* Review Summary Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Application Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Applicant Name</span>
                    <strong className="text-slate-900">{fullName.trim() || 'Applicant'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Primary Trade</span>
                    <strong className="text-emerald-700">{primarySkill} ({experienceYears} Yrs)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Cooperative Society</span>
                    <strong className="text-slate-900 truncate block">{cooperativeName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Aadhaar (Masked)</span>
                    <strong className="text-slate-900 font-mono">{getMaskedAadhaarDisplay(aadhaarRaw)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Attached Documents</span>
                    <strong className="text-slate-900">{documents.length} Files</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Work Portfolio</span>
                    <strong className="text-slate-900">{workSamples.length} Photos</strong>
                  </div>
                </div>
              </div>

              {/* Security Consent Checkboxes */}
              <div className="space-y-3 pt-2">
                <label
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                    attemptedSteps[7] && !consentAccuracy
                      ? 'border-red-400 bg-red-50/30 ring-2 ring-red-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={consentAccuracy}
                    onChange={(e) => {
                      setConsentAccuracy(e.target.checked);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-700 leading-relaxed font-medium block">
                      I confirm that the personal information and trade experience provided are authentic and accurate. <span className="text-red-500">*</span>
                    </span>
                    {attemptedSteps[7] && !consentAccuracy && (
                      <span className="text-[10px] text-red-600 font-bold block">
                        Required confirmation
                      </span>
                    )}
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                    attemptedSteps[7] && !consentVerification
                      ? 'border-red-400 bg-red-50/30 ring-2 ring-red-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={consentVerification}
                    onChange={(e) => {
                      setConsentVerification(e.target.checked);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-700 leading-relaxed font-medium block">
                      I authorize Sahaayak administrators and my registered Labour Cooperative Society to verify my identity, trade certificates, and background records. <span className="text-red-500">*</span>
                    </span>
                    {attemptedSteps[7] && !consentVerification && (
                      <span className="text-[10px] text-red-600 font-bold block">
                        Required authorization
                      </span>
                    )}
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors cursor-pointer ${
                    attemptedSteps[7] && !consentPublicProfile
                      ? 'border-red-400 bg-red-50/30 ring-2 ring-red-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={consentPublicProfile}
                    onChange={(e) => {
                      setConsentPublicProfile(e.target.checked);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs text-slate-700 leading-relaxed font-medium block">
                      I agree that my verified professional profile (name, photo, trade skill, and approximate area) will be displayed to customers upon cooperative approval. <span className="text-red-500">*</span>
                    </span>
                    {attemptedSteps[7] && !consentPublicProfile && (
                      <span className="text-[10px] text-red-600 font-bold block">
                        Required consent
                      </span>
                    )}
                  </div>
                </label>
              </div>

              {/* Final Privacy Guarantee Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sahaayak Worker Protection Guarantee</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Personal documents are used solely for cooperative identity verification. Private identity documents, full government identification numbers, and exact personal home addresses are never exposed to customers.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 8 / SUCCESS SCREEN */}
          {/* ========================================================================= */}
          {currentStep === 8 && submittedWorkerData && (
            <div className="text-center py-6 sm:py-8 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 border-2 border-emerald-200">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Status: Pending Cooperative Verification
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
                  Application Submitted!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your worker registration dossier has been submitted to the Cooperative Federation for background verification and certification check.
                </p>
              </div>

              {/* Dossier Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-md mx-auto text-left space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Application Reference ID
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {submittedWorkerData.applicationId}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Active Dossier
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Applicant</span>
                    <strong className="text-slate-800">{submittedWorkerData.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Trade Applied</span>
                    <strong className="text-slate-800">{submittedWorkerData.skill}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px] block">Cooperative Society</span>
                    <strong className="text-slate-800">{submittedWorkerData.cooperativeName}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={handleGoToAdminVerification}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Inspect in Admin Verification Desk</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close & Return
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Notification & Navigation Footer */}
        {currentStep <= 7 && (
          <div className="shrink-0 bg-slate-50 border-t border-slate-200 shadow-md">
            {/* Bottom Missing Fields / Validation Error Banner */}
            {(errorMessage || missingFieldsList.length > 0) && (
              <div className="px-4 py-3 bg-red-50 border-b border-red-200 text-xs flex items-start gap-2.5 text-red-900 animate-in slide-in-from-bottom-1">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-950">
                    <span>{errorMessage || 'Please fill the required details:'}</span>
                  </div>
                  {missingFieldsList.length > 0 && (
                    <div className="text-[11px] text-red-800 font-medium">
                      <span className="font-bold text-red-950">Required columns: </span>
                      <span className="underline decoration-red-400">{missingFieldsList.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div>
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit for Verification</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDocModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {previewDocModal.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewDocModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-100 rounded-2xl p-6 text-center space-y-2 border border-slate-200">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800">{previewDocModal.type}</div>
              <p className="text-[11px] text-slate-500">
                Official document encrypted and stored securely for cooperative audit.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDocModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
