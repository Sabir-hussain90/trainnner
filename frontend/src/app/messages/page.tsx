'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ============ PRIVILEGES CONFIG ============
const PRIVILEGE_ROWS = [
  { id: 'create_profiles', label: 'Create New Profiles' },
  { id: 'activate_profiles', label: 'Activate Profiles' },
  { id: 'archive_profiles', label: 'Archive Profiles' },
  { id: 'delete_profiles', label: 'Delete Profiles' },
  { id: 'grant_client_access', label: 'Grant Client Access to Profiles' },
  { id: 'create_programs', label: 'Create Programs' },
  { id: 'delete_programs', label: 'Delete Programs' },
  { id: 'create_workouts', label: 'Create Workouts' },
  { id: 'delete_workouts', label: 'Delete Workouts' },
  { id: 'create_exercises', label: 'Create Exercises' },
  { id: 'delete_exercises', label: 'Delete Exercises' },
  { id: 'create_forms', label: 'Create Forms' },
  { id: 'delete_forms', label: 'Delete Forms' },
];

// ============ METRICS CONFIG ============
const METRICS_BASIC = [
  { id: 'weight', label: 'Weight', defaultDays: '90', defaultShow: true },
  { id: 'body_fat', label: 'Body Fat %', defaultDays: '12', defaultShow: false },
  { id: 'lean_mass', label: 'Lean Mass', defaultDays: '14', defaultShow: false },
  { id: 'metabolic_inbody', label: 'Metabolic Rate: InBody', defaultDays: '', defaultShow: true },
  { id: 'metabolic_result', label: 'Metabolic Rate: Result', defaultDays: '', defaultShow: true },
  { id: 'metabolic_harris', label: 'Metabolic Rate: Harris-Benedict', defaultDays: '', defaultShow: true },
];

const METRICS_HEALTH = [
  { id: 'systolic_inbody', label: 'Systolic Blood Pressure: InBody', defaultDays: '', defaultShow: true },
  { id: 'systolic_result', label: 'Systolic Blood Pressure: Result', defaultDays: '', defaultShow: true },
  { id: 'diastolic_inbody', label: 'Diastolic Blood Pressure: InBody', defaultDays: '', defaultShow: true },
  { id: 'diastolic_result', label: 'Diastolic Blood Pressure: Result', defaultDays: '', defaultShow: true },
];

const METRICS_BODY_COMPOSITION = [
  { id: 'bf_3site', label: 'Body Fat %: 3 Site Skinfold (Jackson & Pollock)', defaultDays: '', defaultShow: true },
  { id: 'bf_4site_jp', label: 'Body Fat %: 4 Site Skinfold (Jackson & Pollock)', defaultDays: '', defaultShow: true },
  { id: 'bf_4site_dw', label: 'Body Fat %: 4 Site Skinfold (Durnin & Womersley)', defaultDays: '', defaultShow: true },
  { id: 'bf_7site', label: 'Body Fat %: 7 Site Skinfold (Jackson & Pollock)', defaultDays: '', defaultShow: true },
  { id: 'bf_whole_body', label: 'Body Fat %: Whole-Body Densitometry', defaultDays: '', defaultShow: true },
  { id: 'bf_styku', label: 'Body Fat %: Styku', defaultDays: '', defaultShow: true },
  { id: 'bf_inbody', label: 'Body Fat %: InBody', defaultDays: '', defaultShow: true },
  { id: 'bf_evolt', label: 'Body Fat %: Evolt', defaultDays: '', defaultShow: true },
  { id: 'bf_bioimpedance', label: 'Body Fat %: Bioelectrical Impedance', defaultDays: '', defaultShow: true },
  { id: 'bf_birth', label: 'Body Fat %: Body Girth', defaultDays: '', defaultShow: true },
  { id: 'bm_lean', label: 'Body Mass: Lean Mass', defaultDays: '', defaultShow: true },
  { id: 'bm_fat', label: 'Body Mass: Fat Mass', defaultDays: '', defaultShow: true },
  { id: 'circ_whr', label: 'Circumference: Waist-to-Hip Ratio', defaultDays: '', defaultShow: true },
  { id: 'circ_hip', label: 'Circumference: Hip', defaultDays: '', defaultShow: true },
  { id: 'circ_thigh', label: 'Circumference: Thigh', defaultDays: '', defaultShow: true },
  { id: 'circ_calf', label: 'Circumference: Calf', defaultDays: '', defaultShow: true },
  { id: 'circ_8site', label: 'Circumference: 8-Site', defaultDays: '', defaultShow: true },
  { id: 'circ_4site', label: 'Circumference: 4-Site', defaultDays: '', defaultShow: true },
  { id: 'circ_neck', label: 'Circumference: Neck', defaultDays: '', defaultShow: true },
  { id: 'circ_shoulder', label: 'Circumference: Shoulder', defaultDays: '', defaultShow: true },
  { id: 'circ_bicep', label: 'Circumference: Bicep', defaultDays: '', defaultShow: true },
  { id: 'circ_forearm', label: 'Circumference: Forearm', defaultDays: '', defaultShow: true },
  { id: 'circ_chest', label: 'Circumference: Chest', defaultDays: '', defaultShow: true },
  { id: 'circ_waist', label: 'Circumference: Waist', defaultDays: '', defaultShow: true },
];

const METRICS_CARDIO = [
  { id: 'vo2_1mile', label: 'VO2Max: 1 Mile Walk', defaultDays: '', defaultShow: true },
  { id: 'vo2_ebbeling', label: 'VO2Max: Ebbeling Treadmill', defaultDays: '', defaultShow: true },
  { id: 'vo2_3min', label: 'VO2Max: 3 Minutes Step', defaultDays: '', defaultShow: true },
  { id: 'vo2_12min', label: 'VO2Max: 12-Minute Run', defaultDays: '', defaultShow: true },
  { id: 'vo2_15mile', label: 'VO2Max: 1.5 Mile Run', defaultDays: '', defaultShow: true },
  { id: 'vo2_cycle', label: 'VO2Max: Cycle Ergometer (YMCA)', defaultDays: '', defaultShow: true },
  { id: 'vo2_bruce', label: 'VO2Max: Bruce Protocol', defaultDays: '', defaultShow: true },
  { id: 'vo2_result', label: 'VO2Max: Result', defaultDays: '', defaultShow: true },
  { id: 'resting_hr', label: 'Resting Heart Rate', defaultDays: '', defaultShow: true },
  { id: 'row_500m', label: '500m Row', defaultDays: '', defaultShow: true },
  { id: 'airbike_60', label: '60-Second Airbike', defaultDays: '', defaultShow: true },
  { id: 'step_ymca', label: 'Step Test (YMCA)', defaultDays: '', defaultShow: true },
];

const METRICS_STRENGTH = [
  { id: '1rm_squat', label: '1-Rep Max: Back Squat', defaultDays: '', defaultShow: true },
  { id: '1rm_deadlift', label: '1-Rep Max: Deadlift', defaultDays: '', defaultShow: true },
  { id: '1rm_bench', label: '1-Rep Max: Bench Press', defaultDays: '', defaultShow: true },
  { id: '1rm_row', label: '1-Rep Max: Bent Over Row', defaultDays: '', defaultShow: true },
  { id: '1rm_ohp', label: '1-Rep Max: Overhead Press', defaultDays: '', defaultShow: true },
  { id: 'maxrep_inverted', label: 'Max-Reps: Inverted Row', defaultDays: '', defaultShow: true },
  { id: 'maxtime_plank', label: 'Max-Time: Plank', defaultDays: '', defaultShow: true },
  { id: 'maxtime_wallsit', label: 'Max-Time: Wall Sit', defaultDays: '', defaultShow: true },
];

const METRICS_POWER = [
  { id: 'broad_jump', label: 'Broad Jump', defaultDays: '', defaultShow: true },
  { id: 'vertical_jump', label: 'Vertical Jump', defaultDays: '', defaultShow: true },
  { id: 'med_ball', label: 'Overhead Medicine Ball Toss', defaultDays: '', defaultShow: true },
];

const METRICS_BIOMECHANICS = [
  { id: 'ymca_sit', label: 'YMCA Sit & Reach', defaultDays: '', defaultShow: true },
  { id: 'trunk_lift', label: 'Trunk Lift', defaultDays: '', defaultShow: true },
  { id: 'move_overhead', label: 'Movement Assessments: Overhead Squat', defaultDays: '', defaultShow: true },
  { id: 'move_bend', label: 'Movement Assessments: Bend and Lift', defaultDays: '', defaultShow: true },
  { id: 'move_hurdle', label: 'Movement Assessments: Hurdle Step', defaultDays: '', defaultShow: true },
  { id: 'move_t_spine', label: 'Movement Assessments: Thoracic Spine Mobility', defaultDays: '', defaultShow: true },
  { id: 'screen_aslr', label: 'Movement Screens: Active Straight-Leg Raise', defaultDays: '', defaultShow: true },
  { id: 'screen_shoulder', label: 'Movement Screens: Shoulder Mobility', defaultDays: '', defaultShow: true },
  { id: 'screen_rotary', label: 'Movement Screens: Rotary Stability', defaultDays: '', defaultShow: true },
  { id: 'screen_inline', label: 'Movement Screens: Inline Lunge', defaultDays: '', defaultShow: true },
  { id: 'screen_hurdle', label: 'Movement Screens: Hurdle Step', defaultDays: '', defaultShow: true },
  { id: 'screen_trunk', label: 'Movement Screens: Trunk Stability Push Up', defaultDays: '', defaultShow: true },
  { id: 'screen_squat', label: 'Movement Screens: Deep Squat', defaultDays: '', defaultShow: true },
];

const METRICS_PROGRESS_PHOTO = [
  { id: 'progress_photo', label: 'Progress photo', defaultDays: '', defaultShow: true },
];

const METRICS_SENIOR = [
  { id: 'arm_curl_30s', label: '30-Second Arm Curl', defaultDays: '', defaultShow: true },
  { id: 'back_scratch', label: 'Back scratch', defaultDays: '', defaultShow: true },
  { id: 'chair_sit_reach', label: 'Chair Sit & Reach', defaultDays: '', defaultShow: true },
  { id: 'chair_stand_30s', label: '30-Second Chair Stand', defaultDays: '', defaultShow: true },
  { id: 'up_and_go', label: '8-Foot Up & Go', defaultDays: '', defaultShow: true },
  { id: 'step_2min', label: '2-Minute Step', defaultDays: '', defaultShow: true },
];

const ALL_METRICS = [
  ...METRICS_BASIC, ...METRICS_HEALTH, ...METRICS_BODY_COMPOSITION, ...METRICS_CARDIO,
  ...METRICS_STRENGTH, ...METRICS_POWER, ...METRICS_BIOMECHANICS, ...METRICS_PROGRESS_PHOTO, ...METRICS_SENIOR,
];

const TESTING_COLUMNS = [
  { id: 'weight_lo', label: 'WEIGHT LO' },
  { id: 'stabilization', label: 'STABILIZATI' },
  { id: 'endurance', label: 'ENDURANC' },
  { id: 'strength', label: 'STRENGTH' },
  { id: 'power', label: 'POWER' },
];

const INTERPRETATION_TEXT: { [key: string]: string } = {
  weight: "Weight can a tricky metric to use as a measurement of progress. Although it is a very easy to record, it must be combined with other factors such as height and body fat percentage. This is because weight fluctuates naturally by a few pounds during the day and is influenced by factors such as stress, hydration, or menstruation. Body Mass Index (BMI) takes into consideration your height and is a quick way to categorize someone as underweight, normal weight, overweight, or obese. Body fat measurements can be calculated in a variety of ways, but your trainer will most likely use skinfold calipers or a tape measure to perform these tests in the gym.",
  body_fat: "Keep in mind that the comparison classifications vary by age and by gender, so it wouldn't make sense to compare the body fat percentages of a 32 year old man vs a 32 year old woman, or a 32 year old woman vs a 65 year old woman. Skinfold measurements measure subcutaneous fat located under your skin and not visceral fat located within your abdomen. These metrics are best combined with circumference measurements and weight to create a complete picture of your health.",
  lean_mass: "Lean Body Mass (LBM) is a measurement of body composition calculated by subtracting the weight of your body fat from your total body weight. For fitness purposes, Body Fat % should be the primary metric used. LBM is typically used in metabolic calculations, as body fat is less relevant for some metabolic calculations.",
  bmi: "Body Mass Index (BMI) is a standardized formula to determine the ratio between height and weight. BMI is a fairly reliable indicator of body fat for most adults, though not for the elderly or those with a lot of muscle tone. It is best used to quickly categorize someone as underweight, normal weight, overweight, or obese.",
  metabolic_rate: "Your metabolism is the process by which your body converts what you eat and drink into energy. The rate at which this process occurs is your metabolic rate and is measured in terms of calories per day. Physical activity has a large effect on your metabolism, so metabolic estimates are expressed in terms of your activity level. The lowest possible level of activity is known as your Basal Metabolic Rate.",
  vo2max: "VO2Max is a measurement of your body's ability to process a volume of oxygen and is indexed to your body mass. Achieving and maintaining a healthy cardiovascular system is one of the most important aspects of fitness. Because it measures your body's capacity to process oxygen, it serves as a good indicator of how much you can safely exert yourself during exercise.",
  ymca_sit: "This is a common measurement of flexibility in the lower back and hamstrings (the back of the legs). This test is important because tightness in these areas is closely related to lower back pain and forward pelvic tilt. Tightness in these areas can also contribute to potential injury during periods of increased activity. Scores are related to age and gender, so please take this in mind if you compare your results with your friends.",
  trunk_lift: "This test measures your upper body flexibility and the strength of the muscles that stabilize your upper body and protect your spinal cord. Trunk Lift will let you know if you work is needed to the strength of your lower back muscles. These muscles are important for the avoidance of injury as you increase activity through your exercise program.",
  move_overhead: "The Overhead Squat Assessment (OHSA) is a head to toe assessment of your kinetic chain. Its purpose is to identify muscular imbalances or tightness that may lead to injury during your exercise program. Your trainer will most likely modify your exercise program based on these findings or assign corrective exercises to make sure your movement patterns are healthy.",
  move_t_spine: "Your thoracic spine runs from the base of the neck down to the abdomen and is the only part of your spine that connects to the rib cage. This assessment is important because poor thoracic spine mobility can affect the range of motion throughout your shoulders, neck, lower back, and hips during exercise. Sufficient Thoracic Spine Mobility is needed to avoid poor form and potential injury during exercise.",
  move_shoulder: "This assessment examines your ability to stabilize your scapula during pushing movements. Stability through your scapula is an important part of shoulder health, and any issues identified should be considered while creating your exercise program.",
  move_hurdle: "This is an assessment of your ability to maintain stability when standing on one leg or while taking steps. Single leg stability is very important in fitness as well as in daily life, and any issues should be identified and considered to avoid injury while increasing your activity level during exercise.",
  move_bend: "This is an assessment of your squatting movement patterns. It will identify issues below the waist in your feet, ankles, and knees, as well as variations from one side to the other. Above the waist it will identify issues in the hips, spine, and head. Proper squat mechanics will decrease your chances of injury while you increase activity.",
  screen_aslr: "This assessment is used to assess your stability through your lower back and across your hips. Insufficient stability is a red flag that should be addressed before moving on to exercises that require an extended range of motion. Ignoring red flags may lead to injury as you increase activity or incorporate a wider range of motion that is deemed appropriate.",
  screen_shoulder: "This assessment examines your ability to stabilize your scapula during pushing movements. Stability through your scapula is an important part of shoulder health, and any issues identified should be considered while creating your exercise program.",
  screen_rotary: "Rotary stability is a measure of your ability to transfer force from your lower body to your upper body through your core. This is important for activities that require rotation, such as swinging a golf club or throwing a ball.",
  screen_inline: "The inline lunge assessment evaluates your ability to maintain stability and control during a split stance movement. It helps identify imbalances between your left and right sides.",
  screen_hurdle: "The hurdle step assessment examines your ability to maintain stability and control during a single-leg movement. It helps identify issues with hip stability and core strength.",
  screen_trunk: "The trunk stability push-up assessment evaluates your ability to stabilize your spine during a pushing movement. It helps identify issues with core stability.",
  screen_squat: "The deep squat assessment is a full-body movement that helps identify issues with mobility and stability throughout your kinetic chain."
};

function buildInitialMetricsData() {
  const initial: any = {};
  ALL_METRICS.forEach((m) => { initial[m.id] = { days: m.defaultDays, show: m.defaultShow }; });
  return initial;
}
function buildInitialTestingData() {
  const initial: any = {};
  ALL_METRICS.forEach((m) => { initial[m.id] = { weight_lo: true, stabilization: true, endurance: true, strength: true, power: true }; });
  return initial;
}
function buildInitialResultsData() {
  const initial: any = {};
  ALL_METRICS.forEach((m) => { initial[m.id] = INTERPRETATION_TEXT[m.id] || ""; });
  if (initial['weight']) initial['weight'] = INTERPRETATION_TEXT.weight;
  if (initial['body_fat']) initial['body_fat'] = INTERPRETATION_TEXT.body_fat;
  if (initial['lean_mass']) initial['lean_mass'] = INTERPRETATION_TEXT.lean_mass;
  if (initial['bmi']) initial['bmi'] = INTERPRETATION_TEXT.bmi;
  if (initial['metabolic_inbody']) initial['metabolic_inbody'] = INTERPRETATION_TEXT.metabolic_rate;
  if (initial['metabolic_result']) initial['metabolic_result'] = INTERPRETATION_TEXT.metabolic_rate;
  if (initial['metabolic_harris']) initial['metabolic_harris'] = INTERPRETATION_TEXT.metabolic_rate;
  ['vo2_1mile','vo2_ebbeling','vo2_3min','vo2_12min','vo2_15mile','vo2_cycle','vo2_bruce','vo2_result'].forEach(k => {
    if (initial[k] !== undefined) initial[k] = INTERPRETATION_TEXT.vo2max;
  });
  if (initial['ymca_sit']) initial['ymca_sit'] = INTERPRETATION_TEXT.ymca_sit;
  if (initial['trunk_lift']) initial['trunk_lift'] = INTERPRETATION_TEXT.trunk_lift;
  if (initial['move_overhead']) initial['move_overhead'] = INTERPRETATION_TEXT.move_overhead;
  if (initial['move_bend']) initial['move_bend'] = INTERPRETATION_TEXT.move_bend;
  if (initial['move_hurdle']) initial['move_hurdle'] = INTERPRETATION_TEXT.move_hurdle;
  if (initial['move_t_spine']) initial['move_t_spine'] = INTERPRETATION_TEXT.move_t_spine;
  if (initial['screen_aslr']) initial['screen_aslr'] = INTERPRETATION_TEXT.screen_aslr;
  if (initial['screen_shoulder']) initial['screen_shoulder'] = INTERPRETATION_TEXT.move_shoulder;
  if (initial['screen_rotary']) initial['screen_rotary'] = INTERPRETATION_TEXT.screen_rotary;
  if (initial['screen_inline']) initial['screen_inline'] = INTERPRETATION_TEXT.screen_inline;
  if (initial['screen_hurdle']) initial['screen_hurdle'] = INTERPRETATION_TEXT.screen_hurdle;
  if (initial['screen_trunk']) initial['screen_trunk'] = INTERPRETATION_TEXT.screen_trunk;
  if (initial['screen_squat']) initial['screen_squat'] = INTERPRETATION_TEXT.screen_squat;
  return initial;
}

type UIConversation = {
  id: string; profile: string; profileEmail: string; profileId: string; user: string;
  trainerId: string; lastMessage: string; time: string; status: string; unread: boolean;
};
type ProfileOption = { id: string; name: string; email: string };
type StaffOption = { id: string; name: string; email: string };

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id?: string; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [openSections, setOpenSections] = useState({ home: true, organization: true, library: true, analytics: true });
  const [view, setView] = useState<'messages' | 'account-info' | 'account-settings'>('messages');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const [mainTab, setMainTab] = useState<'Conversations' | 'Flagged Messages'>('Conversations');
  const [statusTab, setStatusTab] = useState<'All' | 'Active' | 'Unassigned' | 'Escalated'>('All');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [layoutView, setLayoutView] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [conversations, setConversations] = useState<UIConversation[]>([]);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [newConvModalOpen, setNewConvModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({ profileId: '', trainerId: '', message: '' });
  const [profileSearch, setProfileSearch] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [trainerOpen, setTrainerOpen] = useState(false);
  const trainerRef = useRef<HTMLDivElement>(null);

  const [actionsConv, setActionsConv] = useState<UIConversation | null>(null);
  const [viewConv, setViewConv] = useState<UIConversation | null>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [reassignConv, setReassignConv] = useState<UIConversation | null>(null);
  const [reassignForm, setReassignForm] = useState({ newUser: '', reason: '' });
  const [reassignUserOpen, setReassignUserOpen] = useState(false);
  const [reassignErrors, setReassignErrors] = useState<{ [key: string]: string }>({});
  const [reassignSaving, setReassignSaving] = useState(false);
  const reassignUserRef = useRef<HTMLDivElement>(null);

  const [activeInfoTab, setActiveInfoTab] = useState<'user' | 'business'>('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [savingInfo, setSavingInfo] = useState(false);

  type SettingsTab = 'privileges' | 'metrics' | 'testing' | 'results' | 'branding' | 'integrations';
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('privileges');
  const [primaryColor, setPrimaryColor] = useState('#F59E0B');
  const [accountLogo, setAccountLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [integrations, setIntegrations] = useState({
    inbody: { enabled: false, apiUsername: '', apiKey: '' },
    evolt: { enabled: false, clientId: '', clientSecret: '' },
    styku: { enabled: false, apiKey: '', apiSecret: '', bodyFatMethod: 'BIA', circumferenceMeasurement: 'Left Side' },
  });

  const [privileges, setPrivileges] = useState<{ [key: string]: { admin: boolean; supervisor: boolean; staff: boolean } }>(() => {
    const defaults: any = {};
    PRIVILEGE_ROWS.forEach((row) => { defaults[row.id] = { admin: true, supervisor: true, staff: true }; });
    return defaults;
  });
  const [measurementSystem, setMeasurementSystem] = useState<'Imperial' | 'Metric'>('Imperial');
  const [metricsData, setMetricsData] = useState<{ [key: string]: { days: string; show: boolean } }>(() => buildInitialMetricsData());
  const [testingData, setTestingData] = useState<{ [key: string]: { [colId: string]: boolean } }>(() => buildInitialTestingData());
  const [resultsData, setResultsData] = useState<{ [key: string]: string }>(() => buildInitialResultsData());

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || localStorage.getItem('access_token') || sessionStorage.getItem('token') || sessionStorage.getItem('access_token');
  };
  const authHeaders = (): HeadersInit => {
    const t = getToken();
    return t ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type': 'application/json' };
  };
  const nameOf = (obj: any, fallback = ''): string => {
    if (!obj) return fallback;
    if (obj.name) return obj.name;
    const full = `${obj.firstName || ''} ${obj.lastName || ''}`.trim();
    return full || obj.email || fallback;
  };

  const normalizeConversation = (c: any): UIConversation => {
    const profileName = nameOf(c.profile, 'Unknown Profile');
    const trainerName = nameOf(c.trainer, 'Unassigned');
    return {
      id: c.id, profile: profileName, profileEmail: c.profile?.email || '',
      profileId: c.profile?.id || c.profileId || '', user: trainerName,
      trainerId: c.trainer?.id || c.trainerId || '',
      lastMessage: c.lastMessage || c.messages?.[0]?.body || '',
      time: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      status: c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase() : 'Active',
      unread: c.unread === true,
    };
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/messages`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load conversations`);
      const data = await res.json();
      if (Array.isArray(data)) setConversations(data.map(normalizeConversation));
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API_URL}/profiles`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setProfileOptions(data.map((p: any) => ({ id: p.id, name: nameOf(p, p.email || 'Unnamed'), email: p.email || '' })));
    } catch {}
  };

  // Load users from the endpoint declared in AuthController.
  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Failed to load users (HTTP ${res.status})`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setStaffOptions([]);
        return;
      }
      const unique = Array.from(new Map(data.filter((u: any) => u?.id).map((u: any) => [u.id, u])).values());
      setStaffOptions(unique.map((u: any) => ({
        id: u.id,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unnamed User',
        email: u.email || '',
      })));
    } catch (err) {
      console.error('[fetchStaff]', err);
      setStaffOptions([]);
    }
  };

  const refreshAll = async () => {
    setDataLoading(true);
    await Promise.all([fetchConversations(), fetchProfiles(), fetchStaff()]);
    setDataLoading(false);
  };

  const fetchPrivileges = async () => {
    try {
      const res = await fetch(`${API_URL}/privileges`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setPrivileges((prev) => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('Failed to load privileges', err);
    }
  };

  const markAsRead = async (conv: UIConversation) => {
    if (!conv.unread) return;
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: false } : c));
    try {
      await fetch(`${API_URL}/messages/${conv.id}/read`, { method: 'PATCH', headers: authHeaders() });
    } catch {
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: true } : c));
    }
  };
  const markAllRead = async () => {
    const unreadConvs = conversations.filter(c => c.unread);
    setConversations(prev => prev.map(c => ({ ...c, unread: false })));
    unreadConvs.forEach(conv => {
      fetch(`${API_URL}/messages/${conv.id}/read`, { method: 'PATCH', headers: authHeaders() }).catch(() => {});
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const token = getToken();
    if (!storedUser || !token) { router.push('/'); return; }

    let parsed: any = {};
    try { parsed = JSON.parse(storedUser); } catch { router.push('/'); return; }

    const safeName = parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || parsed.email || 'User';
    setUser({ ...parsed, id: parsed.id, name: safeName, role: parsed.role || 'User' });
    const parts = safeName.split(/\s+/).filter(Boolean);
    setFirstName(parts[0] || ''); setLastName(parts.slice(1).join(' ') || ''); setEmail(parsed.email || '');

    const storedBiz = localStorage.getItem('business_info');
    if (storedBiz) {
      try {
        const biz = JSON.parse(storedBiz);
        setCompanyName(biz.companyName || ''); setPhone(biz.phone || ''); setAddress(biz.address || '');
        setCity(biz.city || ''); setStateName(biz.state || ''); setZipCode(biz.zipCode || ''); setWebsite(biz.website || '');
      } catch {}
    }

    const storedSettings = localStorage.getItem('account_settings');
    if (storedSettings) {
      try {
        const s = JSON.parse(storedSettings);
        setPrimaryColor(s.primaryColor || '#F59E0B'); setAccountLogo(s.accountLogo || null);
        if (s.integrations) setIntegrations((prev) => ({ ...prev, ...s.integrations, styku: { ...prev.styku, ...(s.integrations.styku || {}) } }));
        if (s.privileges) setPrivileges((prev) => ({ ...prev, ...s.privileges }));
        if (s.measurementSystem) setMeasurementSystem(s.measurementSystem);
        if (s.metricsData) setMetricsData((prev) => ({ ...prev, ...s.metricsData }));
        if (s.testingData) setTestingData((prev) => ({ ...prev, ...s.testingData }));
        if (s.resultsData) setResultsData((prev) => ({ ...prev, ...s.resultsData }));
      } catch {}
    }

    const storedPhoto = localStorage.getItem('profile_photo');
    if (storedPhoto) setProfilePhoto(storedPhoto);

    setLoading(false);
    refreshAll();
    fetchPrivileges();
  }, [router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (profileRef.current && !profileRef.current.contains(t)) setProfileDropdownOpen(false);
      if (trainerRef.current && !trainerRef.current.contains(t)) setTrainerOpen(false);
      if (reassignUserRef.current && !reassignUserRef.current.contains(t)) setReassignUserOpen(false);
      if (accountMenuRef.current && !accountMenuRef.current.contains(t)) setAccountMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(t)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (newConvModalOpen || actionsConv || viewConv || reassignConv) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [newConvModalOpen, actionsConv, viewConv, reassignConv]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  // Poll the open thread because the current backend does not expose WebSockets.
  useEffect(() => {
    if (!viewConv?.id) return;
    let cancelled = false;
    const refreshOpenThread = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/${encodeURIComponent(viewConv.id)}`, { method: 'GET', headers: authHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data?.messages)) return;
        const sorted = [...data.messages].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setThreadMessages(sorted);
        await fetch(`${API_URL}/messages/${encodeURIComponent(viewConv.id)}/read`, { method: 'PATCH', headers: authHeaders() });
      } catch (err) { console.warn('[refreshOpenThread]', err); }
    };
    const intervalId = window.setInterval(refreshOpenThread, 5000);
    return () => { cancelled = true; window.clearInterval(intervalId); };
  }, [viewConv?.id]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(/[.\s+_-]+/).filter(Boolean);
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
  };
  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); router.push('/'); };
  const toggleSection = (key: keyof typeof openSections) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const goTo = (next: 'messages' | 'account-info' | 'account-settings') => {
    setAccountMenuOpen(false);
    setIsSidebarOpen(false);
    setTimeout(() => setView(next), 0);
  };

  const closeModal = () => { setNewConvModalOpen(false); setFormData({ profileId: '', trainerId: '', message: '' }); setProfileSearch(''); setValidationErrors({}); };
  const selectProfile = (p: ProfileOption) => { setFormData({ ...formData, profileId: p.id }); setProfileSearch(''); setProfileDropdownOpen(false); };
  const clearSelectedProfile = () => { setFormData({ ...formData, profileId: '' }); setProfileSearch(''); };
  const filteredProfiles = profileOptions.filter((p) => p.name.toLowerCase().includes(profileSearch.toLowerCase()) || (p.email && p.email.toLowerCase().includes(profileSearch.toLowerCase())));
  const selectedProfileObj = profileOptions.find((p) => p.id === formData.profileId);
  const selectedTrainerObj = staffOptions.find((s) => s.id === formData.trainerId);

  const handleStartConversation = async (e: FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};
    if (!formData.profileId) errs.profileId = 'Profile is required';
    if (!formData.trainerId) errs.trainerId = 'Trainer is required';
    if (!formData.message.trim()) errs.message = 'Message is required';
    if (Object.keys(errs).length > 0) { setValidationErrors(errs); return; }
    setValidationErrors({}); setSaving(true);
    try {
      // Reuse the same profile/trainer thread opened by the Profiles page.
      const threadRes = await fetch(
        `${API_URL}/messages/${encodeURIComponent(formData.profileId)}/${encodeURIComponent(formData.trainerId)}`,
        { method: 'GET', headers: authHeaders() },
      );
      const thread = await threadRes.json().catch(() => ({}));
      if (!threadRes.ok || !thread?.id) {
        const message = Array.isArray(thread?.message) ? thread.message.join(', ') : thread?.message;
        throw new Error(message || `Could not open conversation (HTTP ${threadRes.status})`);
      }

      const messageRes = await fetch(`${API_URL}/messages/${encodeURIComponent(thread.id)}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ senderName: user?.name || 'Trainer', body: formData.message.trim() }),
      });
      const savedMessage = await messageRes.json().catch(() => ({}));
      if (!messageRes.ok || !savedMessage?.id) {
        const message = Array.isArray(savedMessage?.message) ? savedMessage.message.join(', ') : savedMessage?.message;
        throw new Error(message || `Could not save the first message (HTTP ${messageRes.status})`);
      }

      closeModal();
      setToast({ message: 'Conversation started successfully', type: 'success' });
      await fetchConversations();
    } catch (err: any) {
      setToast({ message: err?.message || 'Failed to start conversation', type: 'error' });
    } finally { setSaving(false); }
  };

  const openActions = (conv: UIConversation) => setActionsConv(conv);

  const handleViewConversation = async () => {
    if (!actionsConv) return;
    const selected = actionsConv;
    setActionsConv(null);
    setViewConv(selected);
    setThreadMessages([]);
    setReplyText('');
    setThreadLoading(true);
    await markAsRead(selected);
    try {
      const res = await fetch(`${API_URL}/messages/${encodeURIComponent(selected.id)}`, {
        method: 'GET',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
        throw new Error(message || `Failed to load conversation (HTTP ${res.status})`);
      }
      const messages = Array.isArray(data?.messages) ? data.messages : [];
      messages.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setThreadMessages(messages);
      // Refresh the summary so the preview and unread status stay current.
      await fetchConversations();
    } catch (err: any) {
      setToast({ message: err?.message || 'Could not load conversation history.', type: 'error' });
    } finally {
      setThreadLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!viewConv || !replyText.trim() || replySending) return;
    const body = replyText.trim();
    const senderName = user?.name || 'Trainer';
    setReplySending(true);
    try {
      const res = await fetch(`${API_URL}/messages/${encodeURIComponent(viewConv.id)}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ senderName, body }),
      });
      const saved = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(saved?.message) ? saved.message.join(', ') : saved?.message;
        throw new Error(message || `Reply could not be saved (HTTP ${res.status})`);
      }
      if (!saved?.id) throw new Error('The server did not confirm that the reply was saved.');
      setThreadMessages((prev) => [...prev, saved]);
      setReplyText('');
      setViewConv((prev) => prev ? { ...prev, lastMessage: body, time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), unread: true } : prev);
      await fetchConversations();
    } catch (err: any) {
      setToast({ message: err?.message || 'Reply could not be sent.', type: 'error' });
    } finally {
      setReplySending(false);
    }
  };
  const handleOpenReassign = () => {
    if (actionsConv) { setReassignConv(actionsConv); setReassignForm({ newUser: '', reason: '' }); setReassignErrors({}); setActionsConv(null); }
  };
  const closeReassign = () => { setReassignConv(null); setReassignForm({ newUser: '', reason: '' }); setReassignErrors({}); setReassignUserOpen(false); };

  const handleConfirmReassign = async () => {
    if (!reassignConv) return;
    const errs: { [key: string]: string } = {};
    if (!reassignForm.newUser) errs.newUser = 'New user is required';
    if (Object.keys(errs).length > 0) { setReassignErrors(errs); return; }
    setReassignSaving(true);
    try {
      const res = await fetch(`${API_URL}/messages/${reassignConv.id}/reassign`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ trainerId: reassignForm.newUser, reason: reassignForm.reason }),
      });
      if (!res.ok) throw new Error('Failed to reassign');
      closeReassign(); setToast({ message: 'Thread reassigned', type: 'success' }); await fetchConversations();
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); } finally { setReassignSaving(false); }
  };

  const handleSaveAccountInfo = async () => {
    const errs: { [key: string]: string } = {};
    if (activeInfoTab === 'user') {
      if (!firstName.trim()) errs.firstName = 'First name is required';
      if (!lastName.trim()) errs.lastName = 'Last name is required';
      if (!email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
      if (newPassword && newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
      if (newPassword && newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (Object.keys(errs).length > 0) { setErrors(errs); setToast({ message: 'Please fix the highlighted fields', type: 'error' }); return; }
      setErrors({}); setSavingInfo(true); await new Promise((r) => setTimeout(r, 400));
      const updatedUser = { ...(user as any), name: `${firstName} ${lastName}`.trim(), email };
      localStorage.setItem('user', JSON.stringify(updatedUser)); setUser(updatedUser);
      if (newPassword) localStorage.setItem('user_password', newPassword);
      setNewPassword(''); setConfirmPassword(''); setSavingInfo(false); setToast({ message: 'User info saved successfully', type: 'success' });
    } else {
      if (!companyName.trim()) errs.companyName = 'Company name is required';
      if (!phone.trim()) errs.phone = 'Phone is required';
      if (Object.keys(errs).length > 0) { setErrors(errs); setToast({ message: 'Please fix the highlighted fields', type: 'error' }); return; }
      setErrors({}); setSavingInfo(true); await new Promise((r) => setTimeout(r, 400));
      localStorage.setItem('business_info', JSON.stringify({ companyName: companyName.trim(), phone: phone.trim(), address: address.trim(), city: city.trim(), state: stateName.trim(), zipCode: zipCode.trim(), website: website.trim() }));
      setSavingInfo(false); setToast({ message: 'Business info saved successfully', type: 'success' });
    }
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setToast({ message: 'Please select an image file.', type: 'error' }); e.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { setToast({ message: 'Photo too large. Max 5MB.', type: 'error' }); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => { const dataUrl = reader.result as string; setProfilePhoto(dataUrl); localStorage.setItem('profile_photo', dataUrl); setToast({ message: 'Profile photo updated', type: 'success' }); };
    reader.onerror = () => setToast({ message: 'Failed to read image', type: 'error' });
    reader.readAsDataURL(file); e.target.value = '';
  };

  const removeProfilePhoto = () => { setProfilePhoto(null); localStorage.removeItem('profile_photo'); setToast({ message: 'Profile photo removed', type: 'success' }); };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setToast({ message: 'Please select an image file.', type: 'error' }); e.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { setToast({ message: 'File too large. Max 5MB.', type: 'error' }); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAccountLogo(dataUrl);
      const stored = localStorage.getItem('account_settings');
      let current: any = {};
      if (stored) { try { current = JSON.parse(stored); } catch {} }
      localStorage.setItem('account_settings', JSON.stringify({ ...current, primaryColor, accountLogo: dataUrl, integrations }));
      setToast({ message: 'Account logo updated', type: 'success' });
    };
    reader.onerror = () => setToast({ message: 'Failed to read image', type: 'error' });
    reader.readAsDataURL(file); e.target.value = '';
  };

  const removeAccountLogo = () => {
    setAccountLogo(null);
    const stored = localStorage.getItem('account_settings');
    let current: any = {};
    if (stored) { try { current = JSON.parse(stored); } catch {} }
    localStorage.setItem('account_settings', JSON.stringify({ ...current, primaryColor, accountLogo: null, integrations }));
    setToast({ message: 'Account logo removed', type: 'success' });
  };

  const handleSaveSettings = async () => {
    localStorage.setItem('account_settings', JSON.stringify({
      primaryColor,
      accountLogo,
      integrations,
      measurementSystem,
      metricsData,
      testingData,
      resultsData,
      privileges,
    }));

    if (user?.role !== 'ADMIN') {
      setToast({ message: 'Settings saved', type: 'success' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/privileges`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(privileges),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save privileges');
      }

      setToast({ message: 'Privileges saved', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to save privileges', type: 'error' });
    }
  };

  const handleTogglePrivilege = (rowId: string, role: 'admin' | 'supervisor' | 'staff') => {
    if (!isAdmin) {
      setToast({ message: 'Only Admins can change privileges', type: 'error' });
      return;
    }

    setPrivileges((prev) => {
      const currentRow = prev[rowId] || { admin: false, supervisor: false, staff: false };
      const next = { ...currentRow };
      let added = false;

      if (role === 'admin') {
        next.admin = !currentRow.admin;
        added = next.admin;
        if (!next.admin) {
          next.supervisor = false;
          next.staff = false;
        }
      } else if (role === 'supervisor') {
        if (!currentRow.admin && !currentRow.supervisor) {
          setToast({ message: 'Cannot enable Supervisor — Admin must be enabled first', type: 'error' });
          return prev;
        }
        next.supervisor = !currentRow.supervisor;
        added = next.supervisor;
        if (!next.supervisor) next.staff = false;
      } else if (role === 'staff') {
        if (!currentRow.supervisor && !currentRow.staff) {
          setToast({ message: 'Cannot enable Staff — Supervisor must be enabled first', type: 'error' });
          return prev;
        }
        next.staff = !currentRow.staff;
        added = next.staff;
      }

      const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
      if (!next.admin) {
        setToast({ message: 'Privilege removed for all roles', type: 'success' });
      } else if (added) {
        setToast({ message: `Privilege added for ${roleLabel}`, type: 'success' });
      } else {
        setToast({ message: `Privilege removed for ${role}`, type: 'success' });
      }

      return { ...prev, [rowId]: next };
    });
  };

  const can = (key: string): boolean => {
    if (!user) return false;
    const roleKey = (user.role || '').toLowerCase() as 'admin' | 'supervisor' | 'staff';
    return privileges?.[key]?.[roleKey] === true;
  };

  const unreadCount = conversations.filter(c => c.unread).length;
  const unreadConversations = conversations.filter(c => c.unread);

  const filteredConversations = conversations.filter((c) => {
    if (statusTab === 'Active' && c.status !== 'Active') return false;
    if (statusTab === 'Unassigned' && c.status !== 'Unassigned') return false;
    if (statusTab === 'Escalated' && c.status !== 'Escalated') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!c.profile.toLowerCase().includes(q) && !c.profileEmail.toLowerCase().includes(q) && !c.lastMessage.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalItems = filteredConversations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedConversations = filteredConversations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading || !user) return <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex relative overflow-hidden">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[calc(100vw-2rem)] sm:w-auto flex justify-center">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3.5 px-5 flex items-center gap-3 w-full sm:w-auto sm:min-w-[320px]">
            <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-screen transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden bg-amber-600">
            {accountLogo ? <img src={accountLogo} alt="Logo" className="w-full h-full object-cover" /> : !logoError ? <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" onError={() => setLogoError(true)} /> : <span className="text-white text-sm font-bold">{getInitials(user.name)}</span>}
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 lg:hidden ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button className="hidden lg:block text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4v16M15 4v16" /></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <div className="mb-2">
            <button onClick={() => toggleSection('home')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 uppercase hover:text-gray-600">Home<svg className={`w-3 h-3 transition-transform ${openSections.home ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
            {openSections.home && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/dashboard" label="Dashboard" icon={<IconDashboard />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/tasks" label="Tasks" icon={<IconTask />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/calendar" label="Calendar" icon={<IconCalendar />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink
                  href="/messages"
                  label="Messages"
                  active
                  badge={unreadCount}
                  icon={<IconMessage />}
                  onClick={(e?: any) => {
                    e?.preventDefault?.();
                    goTo('messages');
                  }}
                />
              </nav>
            )}
          </div>
          <div className="mb-2">
            <button onClick={() => toggleSection('organization')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 uppercase hover:text-gray-600">Organization<svg className={`w-3 h-3 transition-transform ${openSections.organization ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
            {openSections.organization && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/profiles" label="Profiles" icon={<IconProfiles />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/users" label="Users" icon={<IconUser />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/groups" label="Groups" icon={<IconGroup />} onClick={() => setIsSidebarOpen(false)} />
              </nav>
            )}
          </div>
          <div className="mb-2">
            <button onClick={() => toggleSection('library')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 uppercase hover:text-gray-600">Library<svg className={`w-3 h-3 transition-transform ${openSections.library ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
            {openSections.library && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/programs" label="Programs" icon={<IconBook />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/workouts" label="Workouts" icon={<IconBolt />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/exercises" label="Exercises" icon={<IconActivity />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/forms" label="Forms" icon={<IconForm />} onClick={() => setIsSidebarOpen(false)} />
              </nav>
            )}
          </div>
          <div className="mb-2">
            <button onClick={() => toggleSection('analytics')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 uppercase hover:text-gray-600">Analytics<svg className={`w-3 h-3 transition-transform ${openSections.analytics ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
            {openSections.analytics && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/reports" label="Reports" icon={<IconChart />} onClick={() => setIsSidebarOpen(false)} />
              </nav>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-[11px] text-gray-600 font-medium">Online</span></div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-800 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0 h-screen">
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 lg:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="text-gray-500 hover:text-gray-700 relative p-1 rounded-full hover:bg-gray-100 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">{unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] max-w-[340px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-[14px] font-semibold text-gray-900">Notifications {unreadCount > 0 && <span className="text-gray-500 font-normal">({unreadCount})</span>}</p>
                    {unreadCount > 0 && <button onClick={markAllRead} className="text-[12px] font-medium text-[#1a73e8] hover:underline">Mark all read</button>}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {unreadConversations.length === 0 ? <div className="px-4 py-8 text-center text-sm text-gray-400">No unread messages</div> : (
                      unreadConversations.map((c) => (
                        <button key={c.id} onClick={() => { markAsRead(c); setViewConv(c); setNotificationsOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition">
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-gray-900 truncate">{c.profile}</p>
                              <p className="text-[12px] text-gray-500 truncate">{c.lastMessage}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={accountMenuRef}>
              <button onClick={() => setAccountMenuOpen(!accountMenuOpen)} className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-200">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold overflow-hidden">
                  {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : getInitials(user.name)}
                </div>
                <div className="text-left hidden sm:block"><p className="text-sm font-semibold text-gray-800">{user.name}</p><p className="text-[11px] text-gray-500">{user.role}</p></div>
              </button>
              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] max-w-[220px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 p-2">
                  <button onClick={() => goTo('messages')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Messages</button>
                  <button onClick={() => goTo('account-info')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Account Info</button>
                  <button onClick={() => goTo('account-settings')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Account Settings</button>
                  <button onClick={() => { setAccountMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1 border-t border-gray-100">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {view === 'messages' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#f7f8fa]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div><h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Messages</h1><p className="text-sm text-gray-500">Manage conversations and flagged messages.</p></div>
              <button onClick={() => setNewConvModalOpen(true)} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm whitespace-nowrap">+ New Conversation</button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-4 md:px-6 pt-5 flex items-center gap-3 overflow-x-auto">
                <button className="px-4 md:px-5 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-900 whitespace-nowrap">Conversations</button>
                <button className="px-4 md:px-5 py-2 text-sm font-medium rounded-lg text-gray-500 hover:text-gray-700 whitespace-nowrap">Flagged Messages</button>
              </div>

              <div className="px-4 md:px-6 py-4 flex items-center gap-2 flex-wrap border-b border-gray-100">
                <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                  {['All', 'Active', 'Unassigned', 'Escalated'].map((tab) => (
                    <button key={tab} onClick={() => { setStatusTab(tab as any); setCurrentPage(1); }} className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${statusTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
                  ))}
                </div>

                <div className="ml-auto flex items-center gap-2 w-full md:w-auto flex-wrap">
                  <div className="relative flex-1 md:flex-none">
                    <input type="text" placeholder="Search by name..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-4 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full md:w-64 outline-none focus:border-[#1a73e8]" />
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                    <button onClick={() => setLayoutView('list')} className={`p-2 border-r border-gray-200 ${layoutView === 'list' ? 'bg-blue-50 text-[#1a73e8]' : 'text-gray-500'}`}><IconList /></button>
                    <button onClick={() => setLayoutView('grid')} className={`p-2 ${layoutView === 'grid' ? 'bg-blue-50 text-[#1a73e8]' : 'text-gray-500'}`}><IconGrid /></button>
                  </div>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-gray-200 rounded-md px-2 md:px-3 py-2 outline-none bg-white font-medium">
                    <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                  </select>
                </div>
              </div>

              {layoutView === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead><tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/40">
                      <th className="px-4 md:px-6 py-3 font-medium text-xs">Profile</th><th className="px-4 py-3 font-medium text-xs">Trainer</th><th className="px-4 py-3 font-medium text-xs">Last Message</th><th className="px-4 py-3 font-medium text-xs">Time</th><th className="px-4 py-3 font-medium text-xs">Status</th><th className="px-4 md:px-6 py-3 font-medium text-xs text-right">Actions</th>
                    </tr></thead>
                    <tbody>
                      {paginatedConversations.map((c) => (
                        <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 ${c.unread ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-2">
                              {c.unread && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                              <div><div className="font-medium text-gray-800">{c.profile}</div><div className="text-xs text-gray-500 mt-0.5">{c.profileEmail}</div></div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{c.user}</td>
                          <td className="px-4 py-4 text-gray-600 max-w-[280px] truncate">{c.lastMessage}</td>
                          <td className="px-4 py-4 text-gray-600">{c.time}</td>
                          <td className="px-4 py-4"><span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">{c.status}</span></td>
                          <td className="px-4 md:px-6 py-4 text-right">
                            <button onClick={() => openActions(c)} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"><IconDots /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 bg-gray-50/30">
                  {paginatedConversations.map((c) => (
                    <div key={c.id} className={`bg-white border rounded-xl p-5 shadow-sm relative flex flex-col ${c.unread ? 'border-blue-200' : 'border-gray-200'}`}>
                       {c.unread && <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-red-500" />}
                       <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {getInitials(c.profile)}
                          </div>
                          <div className="min-w-0 pr-4">
                            <h3 className="font-semibold text-gray-900 truncate">{c.profile}</h3>
                            <p className="text-xs text-gray-500 truncate">{c.profileEmail}</p>
                          </div>
                       </div>
                       <div className="flex-1">
                         <p className="text-sm text-gray-600 line-clamp-2 italic mb-3">&quot;{c.lastMessage}&quot;</p>
                         <div className="flex items-center justify-between text-xs text-gray-500">
                           <span className="truncate max-w-[100px]">Trainer: {c.user}</span>
                           <span>{c.time}</span>
                         </div>
                       </div>
                       <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">{c.status}</span>
                          <button onClick={() => openActions(c)} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100"><IconDots /></button>
                       </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-4 border-t border-gray-100 bg-white gap-3">
                <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-700">{startItem}–{endItem}</span> of <span className="font-semibold text-gray-700">{totalItems}</span></p>
                <div className="flex items-center gap-2">
                  <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center gap-1 px-3 md:px-4 py-2 text-sm rounded-lg border transition ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>Previous</button>
                  <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className={`flex items-center gap-1 px-3 md:px-4 py-2 text-sm rounded-lg border transition ${currentPage >= totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'account-info' && (
          <div className="flex-1 overflow-y-auto bg-[#f7f8fa]">
            <div className="px-4 md:px-10 pt-6 md:pt-10 pb-4 md:pb-6">
              <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-tight mb-1">Account Info</h1>
              <p className="text-[13.5px] text-gray-500">Manage your personal profile and business details.</p>
            </div>
            <div className="px-4 md:px-10 pb-10">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-4 md:px-8 pt-6 pb-5 border-b border-gray-100 overflow-x-auto">
                  <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1 min-w-max">
                    <button onClick={() => { setActiveInfoTab('user'); setErrors({}); }} className={`px-4 md:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeInfoTab === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>User Info</button>
                    <button onClick={() => { setActiveInfoTab('business'); setErrors({}); }} className={`px-4 md:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeInfoTab === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Business Info</button>
                  </div>
                </div>

                {activeInfoTab === 'user' && (
                  <div className="p-4 md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">First name <span className="text-red-500">*</span></label>
                            <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }} className={`w-full h-[48px] px-4 border rounded-lg text-[14px] outline-none transition ${errors.firstName ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                            {errors.firstName && <p className="text-xs text-red-500 mt-1.5">{errors.firstName}</p>}
                          </div>
                          <div>
                            <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Last name <span className="text-red-500">*</span></label>
                            <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }} className={`w-full h-[48px] px-4 border rounded-lg text-[14px] outline-none transition ${errors.lastName ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                            {errors.lastName && <p className="text-xs text-red-500 mt-1.5">{errors.lastName}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Email <span className="text-red-500">*</span></label>
                          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }} className={`w-full h-[48px] px-4 border rounded-lg text-[14px] outline-none transition ${errors.email ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                          {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
                        </div>
                        <div className="border border-gray-200 rounded-2xl p-4 md:p-6">
                          <p className="text-[11px] font-bold text-gray-500 tracking-[0.12em] uppercase mb-5">Change password — leave blank to keep current</p>
                          <div className="space-y-5">
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">New password</label>
                              <div className="relative">
                                <input type={showNewPassword ? 'text' : 'password'} placeholder="Min 8 chars, upper, lower, number, special" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full h-[48px] px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${errors.newPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                              </div>
                              {errors.newPassword && <p className="text-xs text-red-500 mt-1.5">{errors.newPassword}</p>}
                            </div>
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Confirm new password</label>
                              <div className="relative">
                                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full h-[48px] px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                              </div>
                              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword}</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-start pt-2">
                        <p className="text-[14px] font-semibold text-gray-800 mb-5">Profile Photo</p>
                        <input ref={profileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleProfilePhotoUpload} className="hidden" />
                        <div className="w-[160px] h-[160px] md:w-[220px] md:h-[220px] rounded-full bg-gray-200 flex items-center justify-center mb-6 overflow-hidden">
                          {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-[42px] font-semibold text-gray-600">{getInitials(user.name)}</span>}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <button type="button" onClick={() => profileInputRef.current?.click()} className="px-6 h-[42px] border border-gray-300 rounded-full bg-white hover:bg-gray-50 text-[14px] font-medium text-gray-700 transition">Change photo</button>
                          {profilePhoto && <button type="button" onClick={removeProfilePhoto} className="px-4 h-[42px] border border-red-200 rounded-full bg-white hover:bg-red-50 text-[14px] font-medium text-red-600 transition">Remove</button>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={() => goTo('messages')} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={savingInfo} className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition ${savingInfo ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{savingInfo ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}

                {activeInfoTab === 'business' && (
                  <div className="p-4 md:p-8 lg:p-10">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Company name <span className="text-red-500">*</span></label><input type="text" placeholder="e.g. TMQA" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                        <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Phone <span className="text-red-500">*</span></label><input type="tel" placeholder="+1 (234) 567-890" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      </div>
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Address</label><input type="text" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">City</label><input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                        <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">State</label><input type="text" placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                        <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Zip code</label><input type="text" placeholder="Zip code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      </div>
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Website</label><input type="url" placeholder="https://yoursite.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={() => goTo('messages')} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={savingInfo} className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition ${savingInfo ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{savingInfo ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'account-settings' && (
          <div className="flex-1 overflow-y-auto bg-[#f7f8fa]">
            <div className="px-4 md:px-10 pt-6 md:pt-10 pb-4 md:pb-6">
              <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 leading-tight mb-1">Account Settings</h1>
              <p className="text-[13.5px] text-gray-500">Manage branding, metrics, testing, integrations, and system configuration.</p>
            </div>

            <div className="px-4 md:px-10 pb-6 overflow-x-auto">
              <div className="inline-flex items-center gap-1 bg-[#eef1f7] rounded-full p-1.5 min-w-max">
                {(['privileges', 'metrics', 'testing', 'results', 'branding', 'integrations'] as const).map((tab) => (
                  <button key={tab} onClick={() => setSettingsTab(tab)} className={`px-3 md:px-5 py-1.5 md:py-2 text-[12px] md:text-[14px] font-medium rounded-full transition capitalize ${settingsTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
                ))}
              </div>
            </div>

            <div className="px-4 md:px-10 pb-10 max-w-[1400px]">
              {settingsTab === 'privileges' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-2">Privileges</h3>
                  <p className="text-[13px] text-gray-500 mb-6">
                    Manage role-based permissions for account members.
                    {!isAdmin && <span className="ml-1 text-amber-600">(Only ADMIN can change these.)</span>}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Privilege</th>
                          <th className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Admin</th>
                          <th className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Supervisor</th>
                          <th className="py-3 md:py-4 px-2 md:px-4 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Staff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PRIVILEGE_ROWS.map((row) => {
                          const rowPriv = privileges[row.id] || { admin: false, supervisor: false, staff: false };
                          const adminOn = rowPriv.admin;
                          const supervisorOn = rowPriv.supervisor;

                          return (
                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="py-3 md:py-4 px-2 md:px-4 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>

                              <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={adminOn}
                                  onChange={() => handleTogglePrivilege(row.id, 'admin')}
                                  disabled={!isAdmin}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                              </td>

                              <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={rowPriv.supervisor}
                                  onChange={() => handleTogglePrivilege(row.id, 'supervisor')}
                                  disabled={!isAdmin || !adminOn}
                                  title={!adminOn ? 'Enable Admin first' : undefined}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                              </td>

                              <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={rowPriv.staff}
                                  onChange={() => handleTogglePrivilege(row.id, 'staff')}
                                  disabled={!isAdmin || !supervisorOn}
                                  title={!supervisorOn ? 'Enable Supervisor first' : undefined}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {settingsTab === 'metrics' && (
                <div className="space-y-8">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2">
                      <label className="text-[14px] font-semibold text-gray-900">Measurement System</label>
                      <div className="relative inline-block w-full sm:w-auto">
                        <select value={measurementSystem} onChange={(e) => setMeasurementSystem(e.target.value as 'Imperial' | 'Metric')} className="w-full sm:w-auto h-10 pl-4 pr-10 border border-gray-300 rounded-lg text-[14px] bg-white outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none cursor-pointer">
                          <option value="Imperial">Imperial</option>
                          <option value="Metric">Metric</option>
                        </select>
                        <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <MetricsSection title="Basic Data" rows={METRICS_BASIC} metricsData={metricsData} setMetricsData={setMetricsData} />
                  <MetricsSection title="Internal Health" rows={METRICS_HEALTH} metricsData={metricsData} setMetricsData={setMetricsData} />
                  <MetricsSection title="Body Composition" rows={METRICS_BODY_COMPOSITION} metricsData={metricsData} setMetricsData={setMetricsData} />
                  <MetricsSection title="Cardiovascular Capacity" rows={METRICS_CARDIO} metricsData={metricsData} setMetricsData={setMetricsData} />
                  <MetricsSection title="Strength" rows={METRICS_STRENGTH} metricsData={metricsData} setMetricsData={setMetricsData} />
                  <MetricsSection title="Power" rows={METRICS_POWER} metricsData={metricsData} setMetricsData={setMetricsData} />
                  <MetricsSection title="Biomechanics" rows={METRICS_BIOMECHANICS} metricsData={metricsData} setMetricsData={setMetricsData} />
                  <MetricsSection title="Progress Photo" rows={METRICS_PROGRESS_PHOTO} metricsData={metricsData} setMetricsData={setMetricsData} />
                  <MetricsSection title="Senior" rows={METRICS_SENIOR} metricsData={metricsData} setMetricsData={setMetricsData} />
                </div>
              )}

              {settingsTab === 'testing' && (
                <div className="space-y-8">
                  <TestingSection title="Basic Data" rows={METRICS_BASIC} testingData={testingData} setTestingData={setTestingData} />
                  <TestingSection title="Internal Health" rows={METRICS_HEALTH} testingData={testingData} setTestingData={setTestingData} />
                  <TestingSection title="Body Composition" rows={METRICS_BODY_COMPOSITION} testingData={testingData} setTestingData={setTestingData} />
                  <TestingSection title="Cardiovascular Capacity" rows={METRICS_CARDIO} testingData={testingData} setTestingData={setTestingData} />
                  <TestingSection title="Strength" rows={METRICS_STRENGTH} testingData={testingData} setTestingData={setTestingData} />
                  <TestingSection title="Power" rows={METRICS_POWER} testingData={testingData} setTestingData={setTestingData} />
                  <TestingSection title="Biomechanics" rows={METRICS_BIOMECHANICS} testingData={testingData} setTestingData={setTestingData} />
                  <TestingSection title="Progress Photo" rows={METRICS_PROGRESS_PHOTO} testingData={testingData} setTestingData={setTestingData} />
                  <TestingSection title="Senior" rows={METRICS_SENIOR} testingData={testingData} setTestingData={setTestingData} />
                </div>
              )}

              {settingsTab === 'results' && (
                <div className="space-y-8">
                  <ResultsSection title="Basic Data" rows={METRICS_BASIC} resultsData={resultsData} setResultsData={setResultsData} />
                  <ResultsSection title="Internal Health" rows={METRICS_HEALTH} resultsData={resultsData} setResultsData={setResultsData} />
                  <ResultsSection title="Body Composition" rows={METRICS_BODY_COMPOSITION} resultsData={resultsData} setResultsData={setResultsData} />
                  <ResultsSection title="Cardiovascular Capacity" rows={METRICS_CARDIO} resultsData={resultsData} setResultsData={setResultsData} />
                  <ResultsSection title="Strength" rows={METRICS_STRENGTH} resultsData={resultsData} setResultsData={setResultsData} />
                  <ResultsSection title="Power" rows={METRICS_POWER} resultsData={resultsData} setResultsData={setResultsData} />
                  <ResultsSection title="Biomechanics" rows={METRICS_BIOMECHANICS} resultsData={resultsData} setResultsData={setResultsData} />
                  <ResultsSection title="Progress Photo" rows={METRICS_PROGRESS_PHOTO} resultsData={resultsData} setResultsData={setResultsData} />
                  <ResultsSection title="Senior" rows={METRICS_SENIOR} resultsData={resultsData} setResultsData={setResultsData} />
                </div>
              )}

              {settingsTab === 'branding' && (
                <div className="space-y-10">
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">Primary Color</h3>
                    <p className="text-[13px] text-gray-500 mb-4">Sets the main accent color for the account.</p>
                    <div className="flex items-center gap-4">
                      <div className="w-[80px] md:w-[100px] h-[44px] md:h-[52px] rounded-lg border border-gray-200 bg-white p-1.5 md:p-2 shadow-sm"><div className="w-full h-full rounded-md" style={{ backgroundColor: primaryColor }} /></div>
                      <div className="relative">
                        <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 rounded-full border border-gray-200" style={{ backgroundColor: primaryColor }} />
                        <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-[44px] md:h-[52px] pl-9 md:pl-11 pr-3 md:pr-4 w-[150px] md:w-[180px] border border-gray-200 rounded-lg text-[13px] md:text-[14px] font-medium text-gray-800 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">Account Logo</h3>
                    <p className="text-[13px] text-gray-500 mb-4">Upload your account logo. Max 5MB (PNG, JPG, GIF recommended).</p>
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp" onChange={handleLogoUpload} className="hidden" />
                    <div className="relative inline-block w-full max-w-[300px] md:max-w-none md:w-auto">
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="w-full md:w-[400px] h-[140px] md:h-[180px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#1a73e8] hover:bg-blue-50/30 transition relative overflow-hidden">
                        {accountLogo ? <img src={accountLogo} alt="Account logo" className="w-full h-full object-contain p-4" /> : <p className="text-[14px] font-medium text-gray-500">Click to upload logo</p>}
                      </button>
                      {accountLogo && <button type="button" onClick={(e) => { e.stopPropagation(); removeAccountLogo(); }} className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition"><svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg></button>}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'integrations' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">InBody</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.inbody.enabled} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, enabled: e.target.checked } })} className="w-[18px] h-[18px] rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Username</label><input type="text" value={integrations.inbody.apiUsername} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, apiUsername: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Key</label><input type="text" value={integrations.inbody.apiKey} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, apiKey: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">Evolt</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.evolt.enabled} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, enabled: e.target.checked } })} className="w-[18px] h-[18px] rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Client ID</label><input type="text" value={integrations.evolt.clientId} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, clientId: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Client Secret</label><input type="text" value={integrations.evolt.clientSecret} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, clientSecret: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">Styku</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.styku.enabled} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, enabled: e.target.checked } })} className="w-[18px] h-[18px] rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Key</label><input type="text" value={integrations.styku.apiKey} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, apiKey: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Secret</label><input type="text" value={integrations.styku.apiSecret} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, apiSecret: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Body Fat Method</label>
                        <div className="relative">
                          <select value={integrations.styku.bodyFatMethod} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, bodyFatMethod: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                            <option value="BIA">BIA</option><option value="DEXA">DEXA</option><option value="Navy">Navy</option><option value="Skinfold">Skinfold</option><option value="3D Scan">3D Scan</option>
                          </select>
                          <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Circumference Measurement</label>
                        <div className="relative">
                          <select value={integrations.styku.circumferenceMeasurement} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, circumferenceMeasurement: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                            <option value="Left Side">Left Side</option><option value="Right Side">Right Side</option><option value="Average">Average</option>
                          </select>
                          <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={!isAdmin && settingsTab === 'privileges'}
                  className="px-4 md:px-6 h-[44px] text-[14px] font-semibold text-white bg-[#1a4db8] hover:bg-[#15409b] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {actionsConv && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setActionsConv(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 md:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Actions</h3>
              <button onClick={() => setActionsConv(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="space-y-3">
              <button onClick={handleViewConversation} className="w-full flex items-center gap-3 px-4 md:px-5 py-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium text-left transition">
                <svg className="w-5 h-5 text-[#1a73e8] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span className="font-semibold text-gray-900">View conversation</span>
              </button>
              <button onClick={handleOpenReassign} className="w-full flex items-center gap-3 px-4 md:px-5 py-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium text-left transition">
                <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                <span className="font-semibold text-gray-900">Reassign trainer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {viewConv && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 md:p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-4 md:px-7 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Conversation</h2>
                <p className="text-sm text-gray-500 mt-1">With {viewConv.profile}</p>
                <p className="text-xs text-gray-400 mt-1">Trainer: {viewConv.user} · Status: {viewConv.status}</p>
              </div>
              <button onClick={() => { setViewConv(null); setThreadMessages([]); setReplyText(''); }} className="text-gray-400 hover:text-gray-700 flex-shrink-0" aria-label="Close conversation">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto bg-[#f8fafc] px-4 md:px-7 py-5 space-y-4">
              {threadLoading && <p className="text-center text-sm text-gray-400 py-8">Loading conversation history...</p>}
              {!threadLoading && threadMessages.length === 0 && <p className="text-center text-sm text-gray-400 py-10">No messages in this conversation yet.</p>}
              {!threadLoading && threadMessages.map((message: any) => {
                const sender = message.senderName || 'Unknown';
                const isMe = Boolean(user?.name && sender.toLowerCase() === user.name.toLowerCase());
                return (
                  <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isMe ? 'bg-[#1a73e8] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                      <p className={`text-[11px] font-semibold mb-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>{sender}</p>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                      <p className={`text-[10px] mt-2 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                        {message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); void handleSendReply(); }} className="p-3 md:p-4 border-t border-gray-100 bg-white flex items-center gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 min-w-0 h-11 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-[#1a73e8] focus:bg-white"
                disabled={threadLoading || replySending}
              />
              <button type="submit" disabled={threadLoading || replySending || !replyText.trim()} className="px-5 h-11 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">
                {replySending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}

      {reassignConv && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeReassign} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 z-10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="px-4 md:px-7 pt-6 md:pt-7 pb-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4"><svg className="w-7 h-7 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg></div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Reassign Conversation</h2>
              <p className="text-sm text-gray-500">Reassign <span className="font-medium text-gray-700">{reassignConv.profile}</span>&apos;s conversation to a different user.</p>
            </div>
            <div className="px-4 md:px-7 pb-2">
              <p className="text-sm text-gray-600 mb-5">Current user: <span className="font-bold text-gray-900">{reassignConv.user}</span></p>
              <div className="relative" ref={reassignUserRef}>
                <label className="block text-sm font-semibold text-gray-800 mb-2">New User <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setReassignUserOpen(!reassignUserOpen)} className={`w-full h-11 px-4 border rounded-lg text-sm bg-white flex items-center justify-between outline-none transition ${reassignErrors.newUser ? 'border-red-400' : reassignUserOpen ? 'border-[#1a73e8] ring-4 ring-[#1a73e8]/10' : 'border-gray-300'}`}>
                  <span className={reassignForm.newUser ? 'text-gray-800' : 'text-gray-400'}>{staffOptions.find((s) => s.id === reassignForm.newUser)?.name || 'Select a user...'}</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${reassignUserOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {reassignUserOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                    {staffOptions.length === 0 ? <div className="px-4 py-4 text-sm text-gray-400 text-center">No users found</div> : (
                      staffOptions.map((t) => (
                        <button key={t.id} type="button" onClick={() => { setReassignForm({ ...reassignForm, newUser: t.id }); setReassignUserOpen(false); if (reassignErrors.newUser) setReassignErrors({ ...reassignErrors, newUser: '' }); }} className={`w-full text-left px-4 py-2.5 text-sm transition ${reassignForm.newUser === t.id ? 'bg-[#1a73e8] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{t.name}</button>
                      ))
                    )}
                  </div>
                )}
                {reassignErrors.newUser && <p className="text-xs text-red-500 mt-1.5">{reassignErrors.newUser}</p>}
              </div>
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Reason <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={3} placeholder="User leaving company, schedule change..." value={reassignForm.reason} onChange={(e) => setReassignForm({ ...reassignForm, reason: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-4 md:px-7 py-6">
              <button type="button" onClick={closeReassign} className="px-6 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              <button type="button" onClick={handleConfirmReassign} disabled={!reassignForm.newUser || reassignSaving} className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition ${!reassignForm.newUser || reassignSaving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{reassignSaving ? 'Reassigning...' : 'Reassign Thread'}</button>
            </div>
          </div>
        </div>
      )}

      {newConvModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative max-h-[90vh] flex flex-col">
            <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 z-10"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <div className="px-4 md:px-7 pt-6 md:pt-7 pb-4">
              <div className="flex items-center gap-3 mb-1"><svg className="w-6 h-6 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg><h2 className="text-xl md:text-2xl font-bold text-gray-900">New Conversation</h2></div>
              <p className="text-sm text-gray-500">Start a new message thread with a profile.</p>
            </div>
            <form onSubmit={handleStartConversation} className="flex-1 overflow-y-auto px-4 md:px-7 pb-4" noValidate>
              <div className="space-y-5">
                <div className="relative" ref={profileRef}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Profile <span className="text-red-500">*</span></label>
                  {formData.profileId ? (
                    <div className={`w-full h-11 px-4 border rounded-lg bg-[#eef4fd] flex items-center justify-between ${validationErrors.profileId ? 'border-red-400' : 'border-[#c9dcf5]'}`}>
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-sm text-gray-800 truncate">{selectedProfileObj?.name || 'Selected'}</span>
                        {selectedProfileObj?.email && <span className="text-xs text-gray-500 truncate">{selectedProfileObj.email}</span>}
                      </div>
                      <button type="button" onClick={clearSelectedProfile} className="text-gray-400 hover:text-gray-700 p-0.5 rounded flex-shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                  ) : (
                    <input type="text" placeholder="Search profiles..." value={profileSearch} onChange={(e) => { setProfileSearch(e.target.value); setProfileDropdownOpen(true); }} onFocus={() => setProfileDropdownOpen(true)} className={`w-full h-11 px-4 border rounded-lg text-sm outline-none transition ${validationErrors.profileId ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                  )}
                  {profileDropdownOpen && !formData.profileId && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
                      {filteredProfiles.length === 0 ? <div className="px-4 py-6 text-center text-sm text-gray-400">{profileOptions.length === 0 ? 'Loading profiles...' : 'No profiles found.'}</div> : (
                        filteredProfiles.map((p) => (
                          <button key={p.id} type="button" onClick={() => selectProfile(p)} className="w-full text-left px-4 py-3.5 transition flex items-baseline gap-2 hover:bg-gray-50">
                            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{p.name}</span><span className="text-sm text-gray-500 truncate">{p.email}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  {validationErrors.profileId && <p className="text-xs text-red-500 mt-1.5">{validationErrors.profileId}</p>}
                </div>

                <div className="relative" ref={trainerRef}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Trainer <span className="text-red-500">*</span></label>
                  <button type="button" onClick={() => setTrainerOpen(!trainerOpen)} className={`w-full h-11 px-4 border rounded-lg text-sm bg-white flex items-center justify-between outline-none transition ${validationErrors.trainerId ? 'border-red-400' : trainerOpen ? 'border-[#1a73e8] ring-4 ring-[#1a73e8]/10' : 'border-gray-300'}`}>
                    <span className={formData.trainerId ? 'text-gray-800' : 'text-gray-400'}>{selectedTrainerObj?.name || 'Select trainer...'}</span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${trainerOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {trainerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                      {staffOptions.length === 0 ? <div className="px-4 py-4 text-sm text-gray-400 text-center">No users found</div> : (
                        staffOptions.map((t) => (
                          <button key={t.id} type="button" onClick={() => { setFormData({ ...formData, trainerId: t.id }); setTrainerOpen(false); if (validationErrors.trainerId) setValidationErrors({ ...validationErrors, trainerId: '' }); }} className={`w-full text-left px-4 py-2.5 text-sm transition ${formData.trainerId === t.id ? 'bg-[#1a73e8] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{t.name}</button>
                        ))
                      )}
                    </div>
                  )}
                  {validationErrors.trainerId && <p className="text-xs text-red-500 mt-1.5">{validationErrors.trainerId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Message <span className="text-red-500">*</span></label>
                  <textarea rows={5} placeholder="Type your first message..." value={formData.message} onChange={(e) => { setFormData({ ...formData, message: e.target.value }); if (validationErrors.message) setValidationErrors({ ...validationErrors, message: '' }); }} className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition resize-none ${validationErrors.message ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                  {validationErrors.message && <p className="text-xs text-red-500 mt-1.5">{validationErrors.message}</p>}
                </div>
                <p className="text-xs text-gray-500">The client will see this message once they&apos;ve accepted their portal invite.</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100 sticky bottom-0 bg-white">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Starting...' : 'Start Conversation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== REUSABLE ==============
function NavLink({
  href,
  label,
  icon,
  active = false,
  badge = 0,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: number;
  onClick?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={`relative flex items-center gap-3 px-3 py-2.5 text-[13.5px] rounded-md ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-[#1a73e8] rounded-r"></span>}
      <span className="text-gray-500">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">{badge > 99 ? '99+' : badge}</span>}
    </Link>
  );
}

function MetricsSection({ title, rows, metricsData, setMetricsData }: { title: string; rows: { id: string; label: string }[]; metricsData: any; setMetricsData: any; }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>{title}
      </h3>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead><tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
          </tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                  <input type="text" value={metricsData[row.id]?.days ?? ''} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setMetricsData((prev: any) => ({ ...prev, [row.id]: { ...prev[row.id], days: val } })); }} placeholder="—" className="w-20 md:w-24 h-[34px] md:h-9 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                </td>
                <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                  <input type="checkbox" checked={metricsData[row.id]?.show ?? false} onChange={() => { setMetricsData((prev: any) => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } })); }} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TestingSection({ title, rows, testingData, setTestingData }: { title: string; rows: { id: string; label: string }[]; testingData: any; setTestingData: any; }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>{title}
      </h3>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead><tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
            {TESTING_COLUMNS.map(col => (
              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                <span className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full uppercase tracking-wider whitespace-nowrap inline-block">{col.label}</span>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                {TESTING_COLUMNS.map(col => (
                  <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                    <input type="checkbox" checked={testingData[row.id]?.[col.id] ?? false} onChange={() => { setTestingData((prev: any) => ({ ...prev, [row.id]: { ...prev[row.id], [col.id]: !prev[row.id]?.[col.id] } })); }} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ResultsSection({ title, rows, resultsData, setResultsData }: { title: string; rows: { id: string; label: string }[]; resultsData: any; setResultsData: any; }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>{title}
      </h3>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead><tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
          </tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                <td className="py-3 md:py-4 px-3 md:px-6">
                  <div className="relative">
                    <textarea value={resultsData[row.id] ?? ''} onChange={(e) => { setResultsData((prev: any) => ({ ...prev, [row.id]: e.target.value })); }} placeholder="Enter interpretation here..." rows={4} className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y" />
                    <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">{(resultsData[row.id] ?? '').length} / 1500</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconDashboard() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>; }
function IconTask() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }
function IconCalendar() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function IconMessage() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; }
function IconProfiles() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function IconUser() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function IconGroup() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; }
function IconBook() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>; }
function IconBolt() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; }
function IconActivity() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 12h3l3-9 4 18 3-9h5" /></svg>; }
function IconForm() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function IconChart() { return <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>; }
function IconList() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>; }
function IconGrid() { return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>; }
function IconDots() { return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>; }