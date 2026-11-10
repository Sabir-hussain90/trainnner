'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const ROLE_OPTIONS = ['ADMIN', 'SUPERVISOR', 'STAFF'] as const;
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] as const;
const titleCase = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : s);

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

async function api<T = any>(
  path: string,
  options: { method?: string; body?: any; token?: string | null } = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return data as T;
}

export default function UsersPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string; name: string; email: string; role: string;
    firstName: string; lastName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [view, setView] = useState<'list' | 'create' | 'edit' | 'account-info' | 'account-settings'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // ====== NOTIFICATIONS ======
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [unreadConversations, setUnreadConversations] = useState<any[]>([]);

  const [openSections, setOpenSections] = useState({ home: true, organization: true, library: true, analytics: true });

  // ====== TABS & FILTERS ======
  const [activeTab, setActiveTab] = useState('All');
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);

  const [groupFilters, setGroupFilters] = useState<string[]>([]);
  const [groupFilterOpen, setGroupFilterOpen] = useState(false);
  const groupFilterRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    role: '', group: '', status: 'ACTIVE',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const typeRef = useRef<HTMLDivElement>(null);

  const [actionsUser, setActionsUser] = useState<any | null>(null);
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // ACCOUNT INFO
  const [activeInfoTab, setActiveInfoTab] = useState<'user' | 'business'>('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [accountPhoto, setAccountPhoto] = useState<string | null>(null);
  const accountPhotoInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [website, setWebsite] = useState('');

  const [infoErrors, setInfoErrors] = useState<{ [key: string]: string }>({});
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

  const loadUsers = useCallback(async (tk: string) => {
    try {
      const data = await api<any[]>('/users', { token: tk });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load users', type: 'error' });
    }
  }, []);

  const loadGroups = useCallback(async (tk: string) => {
    try {
      const data = await api<any[]>('/groups', { token: tk });
      setAvailableGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  }, []);

  const fetchUnreadMessages = useCallback(async (tk: string) => {
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const unread = data.filter((c: any) => c.unread === true || (typeof c.unreadCount === 'number' && c.unreadCount > 0));
        setUnreadConversations(unread);
      }
    } catch (err) {
      console.error('[fetchUnreadMessages]', err);
    }
  }, []);

  const fetchPrivileges = useCallback(async (tk: string) => {
    try {
      const res = await fetch(`${API_URL}/privileges`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setPrivileges((prev) => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('Failed to load privileges', err);
    }
  }, []);

  useEffect(() => {
    const tk = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || localStorage.getItem('access_token'))
      : null;

    if (!tk) { router.push('/'); return; }
    setToken(tk);

    (async () => {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      let parsed: any = {};
      try { parsed = storedUser ? JSON.parse(storedUser) : {}; } catch {}

      const safeUser = {
        id: parsed.id || '',
        name: parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || parsed.email || 'User',
        email: parsed.email || '',
        role: parsed.role || 'USER',
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
      };
      setUser(safeUser);
      setFirstName(safeUser.firstName);
      setLastName(safeUser.lastName);
      setEmail(safeUser.email);

      const storedPhoto = localStorage.getItem('account_profile_photo');
      if (storedPhoto) setAccountPhoto(storedPhoto);

      const storedBiz = localStorage.getItem('business_info');
      if (storedBiz) {
        try {
          const biz = JSON.parse(storedBiz);
          setCompanyName(biz.companyName || '');
          setPhone(biz.phone || '');
          setAddress(biz.address || '');
          setCity(biz.city || '');
          setStateName(biz.state || '');
          setZipCode(biz.zipCode || '');
          setWebsite(biz.website || '');
        } catch {}
      }

      const storedSettings = localStorage.getItem('account_settings');
      if (storedSettings) {
        try {
          const s = JSON.parse(storedSettings);
          setPrimaryColor(s.primaryColor || '#F59E0B');
          setAccountLogo(s.accountLogo || null);
          if (s.integrations) {
            setIntegrations((prev) => ({
              ...prev,
              ...s.integrations,
              inbody: { ...prev.inbody, ...(s.integrations.inbody || {}) },
              evolt: { ...prev.evolt, ...(s.integrations.evolt || {}) },
              styku: { ...prev.styku, ...(s.integrations.styku || {}) },
            }));
          }
          if (s.privileges) setPrivileges((prev) => ({ ...prev, ...s.privileges }));
          if (s.measurementSystem) setMeasurementSystem(s.measurementSystem);
          if (s.metricsData) setMetricsData((prev) => ({ ...prev, ...s.metricsData }));
          if (s.testingData) setTestingData((prev) => ({ ...prev, ...s.testingData }));
          if (s.resultsData) setResultsData((prev) => ({ ...prev, ...s.resultsData }));
        } catch {}
      }

      await loadUsers(tk);
      await loadGroups(tk);
      await fetchUnreadMessages(tk);
      await fetchPrivileges(tk);
      setLoading(false);
    })();

    const interval = setInterval(() => {
      if (tk) fetchUnreadMessages(tk);
    }, 30000);
    return () => clearInterval(interval);
  }, [router, loadUsers, loadGroups, fetchUnreadMessages, fetchPrivileges]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (typeRef.current && !typeRef.current.contains(t)) setTypeOpen(false);
      if (accountMenuRef.current && !accountMenuRef.current.contains(t)) setAccountMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(t)) setNotificationsOpen(false);
      if (groupFilterRef.current && !groupFilterRef.current.contains(t)) setGroupFilterOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (deleteUser || actionsUser) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [deleteUser, actionsUser]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const getInitials = (name: string) => {
    const parts = (name || '').split(/[.\s+_-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (name || 'U').slice(0, 2).toUpperCase();
  };

  const getUserInitials = (u: any) => {
    const first = (u.firstName || '').trim();
    const last = (u.lastName || '').trim();
    if (first && last) return (first[0] + last[0]).toUpperCase();
    if (first) return first.slice(0, 2).toUpperCase();
    if (u.email) return u.email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    router.push('/');
  };

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const goTo = (next: 'list' | 'create' | 'edit' | 'account-info' | 'account-settings') => {
    setAccountMenuOpen(false);
    setIsSidebarOpen(false);
    setTimeout(() => setView(next), 0);
  };

  const openCreateForm = () => {
    setForm({ email: '', firstName: '', lastName: '', role: '', group: '', status: 'ACTIVE', password: '' });
    setErrors({});
    setEditingId(null);
    setIsSidebarOpen(false);
    setView('create');
  };

  const openEditForm = (u: any) => {
    setForm({
      email: u.email || '',
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      role: u.role || '',
      group: u.group || '',
      status: u.status || 'ACTIVE',
      password: '',
    });
    setErrors({});
    setEditingId(u.id);
    setActionsUser(null);
    setIsSidebarOpen(false);
    setView('edit');
  };

  const closeForm = () => { setView('list'); setEditingId(null); };

  const handleSaveUser = async () => {
    const errs: { [key: string]: string } = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.role) errs.role = 'Please select a role';
    if (!editingId && !form.password) errs.password = 'Password is required';
    if (form.password && form.password.length < 8) errs.password = 'Password must be at least 8 characters';

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!token) return;

    setSaving(true);
    try {
      if (editingId) {
        const body: any = {
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          status: form.status,
        };
        if (form.password) body.password = form.password;
        await api(`/users/${editingId}`, { method: 'PATCH', token, body });
        setToast({ message: 'User updated successfully', type: 'success' });
      } else {
        await api('/users', {
          method: 'POST',
          token,
          body: {
            email: form.email,
            firstName: form.firstName,
            lastName: form.lastName,
            role: form.role,
            status: form.status,
            password: form.password,
          },
        });
        setToast({ message: 'User created successfully', type: 'success' });
      }
      await loadUsers(token);
      setView('list');
      setEditingId(null);
    } catch (err: any) {
      setToast({ message: err.message || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditFromActions = () => { if (actionsUser) openEditForm(actionsUser); };

  const handleToggleStatus = async () => {
    if (!actionsUser || !token) return;
    const newStatus = actionsUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api(`/users/${actionsUser.id}`, { method: 'PATCH', token, body: { status: newStatus } });
      setToast({ message: `User marked as ${titleCase(newStatus)}`, type: 'success' });
      await loadUsers(token);
      setActionsUser(null);
    } catch (err: any) {
      setToast({ message: err.message || 'Status change failed', type: 'error' });
    }
  };

  const handleOpenDelete = () => { if (actionsUser) { setDeleteUser(actionsUser); setActionsUser(null); } };

  const confirmDeleteUser = async () => {
    if (!deleteUser || !token) return;
    try {
      await api(`/users/${deleteUser.id}`, { method: 'DELETE', token });
      setToast({ message: 'User deleted successfully', type: 'success' });
      await loadUsers(token);
      setDeleteUser(null);
    } catch (err: any) {
      setToast({ message: err.message || 'Delete failed', type: 'error' });
    }
  };

  const handleAccountPhotoClick = () => accountPhotoInputRef.current?.click();

  const handleAccountPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { setToast({ message: 'File too large. Max 6MB.', type: 'error' }); return; }
    if (!file.type.startsWith('image/')) { setToast({ message: 'Please select an image file.', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAccountPhoto(dataUrl);
      try {
        localStorage.setItem('account_profile_photo', dataUrl);
        setToast({ message: 'Profile photo updated', type: 'success' });
      } catch {
        setToast({ message: 'Failed to save photo (storage full?)', type: 'error' });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAccountPhoto = () => {
    setAccountPhoto(null);
    localStorage.removeItem('account_profile_photo');
    setToast({ message: 'Profile photo removed', type: 'success' });
  };

  const handleContinueWithGoogle = () => {
    setToast({ message: 'Google sign-in is not configured yet. Add a Google OAuth client to enable it.', type: 'error' });
  };

  const handleSaveAccountInfo = async () => {
    if (!token || !user) return;
    const errs: { [key: string]: string } = {};

    if (activeInfoTab === 'user') {
      if (!firstName.trim()) errs.firstName = 'First name is required';
      if (!lastName.trim()) errs.lastName = 'Last name is required';
      if (!email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
      if (newPassword && newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
      if (newPassword && newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

      if (Object.keys(errs).length > 0) {
        setInfoErrors(errs);
        setToast({ message: 'Please fix the highlighted fields', type: 'error' });
        return;
      }

      setInfoErrors({});
      setSavingInfo(true);
      try {
        const body: any = { firstName, lastName, email };
        if (newPassword) body.password = newPassword;

        await api(`/users/${user.id}`, { method: 'PATCH', token, body });

        const updatedUser = { ...user, firstName, lastName, email, name: `${firstName} ${lastName}`.trim() };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        setNewPassword('');
        setConfirmPassword('');
        setToast({ message: 'User info saved successfully', type: 'success' });

        await loadUsers(token);
      } catch (err: any) {
        setToast({ message: err.message || 'Save failed', type: 'error' });
      } finally {
        setSavingInfo(false);
      }
    } else {
      if (!companyName.trim()) errs.companyName = 'Company name is required';
      if (!phone.trim()) errs.phone = 'Phone is required';
      if (Object.keys(errs).length > 0) {
        setInfoErrors(errs);
        setToast({ message: 'Please fix the highlighted fields', type: 'error' });
        return;
      }
      setInfoErrors({});
      setSavingInfo(true);
      try {
        await api('/settings/me', {
          method: 'PATCH',
          token,
          body: {
            businessInfo: {
              companyName: companyName.trim(),
              phone: phone.trim(),
              address: address.trim(),
              city: city.trim(),
              state: stateName.trim(),
              zipCode: zipCode.trim(),
              website: website.trim(),
            },
          },
        });
        localStorage.setItem('business_info', JSON.stringify({
          companyName: companyName.trim(), phone: phone.trim(), address: address.trim(),
          city: city.trim(), state: stateName.trim(), zipCode: zipCode.trim(), website: website.trim(),
        }));
        setToast({ message: 'Business info saved successfully', type: 'success' });
      } catch (err: any) {
        localStorage.setItem('business_info', JSON.stringify({
          companyName: companyName.trim(), phone: phone.trim(), address: address.trim(),
          city: city.trim(), state: stateName.trim(), zipCode: zipCode.trim(), website: website.trim(),
        }));
        setToast({ message: 'Business info saved locally', type: 'success' });
      } finally {
        setSavingInfo(false);
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setToast({ message: 'File too large. Max 5MB.', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAccountLogo(dataUrl);
      const stored = localStorage.getItem('account_settings');
      let current: any = {};
      if (stored) { try { current = JSON.parse(stored); } catch {} }
      localStorage.setItem('account_settings', JSON.stringify({ ...current, primaryColor, accountLogo: dataUrl, integrations, privileges, measurementSystem, metricsData, testingData, resultsData }));
    };
    reader.readAsDataURL(file);
  };

  const removeAccountLogo = () => {
    setAccountLogo(null);
    const stored = localStorage.getItem('account_settings');
    let current: any = {};
    if (stored) { try { current = JSON.parse(stored); } catch {} }
    localStorage.setItem('account_settings', JSON.stringify({ ...current, primaryColor, accountLogo: null, integrations }));
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
    }));

    if (user?.role !== 'ADMIN') {
      setToast({ message: 'Settings saved', type: 'success' });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/privileges`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  // Cascade + toasts for privileges
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

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = paginatedUsers.map((u) => u.id);
    const allSelected = visibleIds.every((id) => selectedUsers.includes(id));

    if (allSelected) {
      setSelectedUsers((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedUsers((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleGroupFilter = (groupId: string) => {
    setGroupFilters((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
    setCurrentPage(1);
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === 'Admin' && u.role !== 'ADMIN') return false;
    if (activeTab === 'Supervisors' && u.role !== 'SUPERVISOR') return false;
    if (activeTab === 'Staff' && u.role !== 'STAFF') return false;

    if (groupFilters.length > 0) {
      const isInAnySelectedGroup = groupFilters.some((groupId) => {
        const selectedGroup = availableGroups.find(g => g.id === groupId);
        if (!selectedGroup) return false;
        return (
          (selectedGroup.staff && selectedGroup.staff.includes(u.id)) ||
          (selectedGroup.supervisors && selectedGroup.supervisors.includes(u.id))
        );
      });
      if (!isInAnySelectedGroup) return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      return fullName.includes(q) || (u.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const unreadCount = unreadConversations.length;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUSPENDED': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[calc(100vw-2rem)] sm:w-auto flex justify-center">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3.5 px-5 flex items-center gap-3 w-full sm:w-auto sm:min-w-[320px]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'error' ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {toast.type === 'error' ? (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              )}
            </div>
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
          <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden bg-white">
            {!logoError ? (
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain" onError={() => setLogoError(true)} />
            ) : (
              <span className="text-white text-sm font-bold bg-amber-600 w-full h-full flex items-center justify-center">{getInitials(user.name)}</span>
            )}
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 lg:hidden ml-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button className="hidden lg:block text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4v16M15 4v16" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <div className="mb-2">
            <button onClick={() => toggleSection('home')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">
              Home
              <svg className={`w-3 h-3 transition-transform ${openSections.home ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openSections.home && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/dashboard" label="Dashboard" icon={<IconDashboard />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/tasks" label="Tasks" icon={<IconTask />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/calendar" label="Calendar" icon={<IconCalendar />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/messages" label="Messages" icon={<IconMessage />} badge={unreadCount} onClick={() => setIsSidebarOpen(false)} />
              </nav>
            )}
          </div>

          <div className="mb-2">
            <button onClick={() => toggleSection('organization')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">
              Organization
              <svg className={`w-3 h-3 transition-transform ${openSections.organization ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openSections.organization && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/profiles" label="Profiles" icon={<IconProfiles />} onClick={() => setIsSidebarOpen(false)} />
                {/* ✅ FIX: intercept the Users nav click while on this page so it resets the view to the list instead of triggering a Next.js remount that keeps whatever subpage state was there. */}
                <NavLink
                  href="/users"
                  label="Users"
                  active
                  icon={<IconUser />}
                  onClick={(e?: any) => {
                    e?.preventDefault?.();
                    goTo('list');
                  }}
                />
                <NavLink href="/groups" label="Groups" icon={<IconGroup />} onClick={() => setIsSidebarOpen(false)} />
              </nav>
            )}
          </div>

          <div className="mb-2">
            <button onClick={() => toggleSection('library')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">
              Library
              <svg className={`w-3 h-3 transition-transform ${openSections.library ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
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
            <button onClick={() => toggleSection('analytics')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">
              Analytics
              <svg className={`w-3 h-3 transition-transform ${openSections.analytics ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openSections.analytics && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/reports" label="Reports" icon={<IconChart />} onClick={() => setIsSidebarOpen(false)} />
              </nav>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] text-gray-600 font-medium">Online</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-800 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden h-screen min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 lg:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen((v) => !v)}
                className="text-gray-500 hover:text-gray-700 relative p-1 rounded-full hover:bg-gray-100 transition"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] max-w-[340px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-[14px] font-semibold text-gray-900">
                      Notifications {unreadCount > 0 && <span className="text-gray-500 font-normal">({unreadCount})</span>}
                    </p>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {unreadConversations.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">No unread messages</div>
                    ) : (
                      unreadConversations.map((c) => (
                        <Link
                          href="/messages"
                          key={c.id}
                          onClick={() => setNotificationsOpen(false)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition block"
                        >
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-gray-900 truncate">
                                {c.profile?.firstName || c.firstName || ''} {c.profile?.lastName || c.lastName || ''}
                              </p>
                              <p className="text-[12px] text-gray-500 truncate">
                                {c.lastMessage || c.message || 'New message'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={accountMenuRef}>
              <button onClick={() => setAccountMenuOpen(!accountMenuOpen)} className="flex items-center gap-3 pl-2 md:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-2 py-1 transition">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold overflow-hidden">
                  {accountPhoto ? <img src={accountPhoto} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
                  <p className="text-[11px] text-gray-500 leading-none mt-1">{user.role}</p>
                </div>
              </button>

              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] max-w-[320px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold overflow-hidden flex-shrink-0">
                      {accountPhoto ? <img src={accountPhoto} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-[12.5px] text-gray-500 mt-0.5 truncate">{user.role}</p>
                    </div>
                  </div>
                  <div className="py-2">
                    <button onClick={() => goTo('list')} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" /></svg>
                      <span>Switch to Classic</span>
                    </button>
                    <button onClick={() => goTo('account-info')} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span>Account Info</span>
                    </button>
                    <button onClick={() => goTo('account-settings')} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span>Account Settings</span>
                    </button>
                    <button onClick={() => setAccountMenuOpen(false)} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      <span>Billing</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-2">
                    <button onClick={() => { setAccountMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-red-600 hover:bg-red-50 transition text-left">
                      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {view === 'list' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-white">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Users</h1>
                <p className="text-sm text-gray-500">Manage your organization&apos;s users and roles.</p>
              </div>
              <button onClick={openCreateForm} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                Create User
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 md:px-6 py-4 flex items-center gap-3 flex-wrap border-b border-gray-100">
                <div className="flex items-center gap-1 flex-shrink-0 bg-gray-100 rounded-full p-1 overflow-x-auto max-w-full">
                  {['All', 'Admin', 'Supervisors', 'Staff'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                      className={`px-3 md:px-5 py-2 text-sm font-medium rounded-full transition whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative flex-shrink-0 md:ml-2" ref={groupFilterRef}>
                  <button onClick={() => setGroupFilterOpen(!groupFilterOpen)} className={`flex items-center gap-2 px-3 md:px-4 py-2 text-sm border rounded-full font-medium whitespace-nowrap transition ${groupFilters.length > 0 ? 'border-[#1a73e8] text-[#1a73e8] bg-blue-50' : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Group {groupFilters.length > 0 ? `(${groupFilters.length})` : ''}
                    <svg className={`w-3.5 h-3.5 transition-transform ${groupFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {groupFilterOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3 max-h-72 overflow-y-auto">
                      {availableGroups.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">No groups found</p>
                      ) : (
                        availableGroups.map((g) => {
                          const checked = groupFilters.includes(g.id);
                          return (
                            <label key={g.id} className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded-md cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleGroupFilter(g.id)}
                                className="rounded border-gray-300 w-4 h-4 text-[#1a73e8] focus:ring-[#1a73e8] cursor-pointer"
                              />
                              <span className="text-[13.5px] text-gray-800 flex-1 truncate">{g.name}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <div className="ml-auto flex items-center gap-2 md:gap-3 flex-shrink-0 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-full md:w-64 outline-none focus:border-[#1a73e8]" />
                  </div>

                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0">
                    <button type="button" onClick={() => setViewMode('list')} title="List view" className={`w-7 h-7 flex items-center justify-center rounded transition ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </button>
                    <button type="button" onClick={() => setViewMode('grid')} title="Grid view" className={`w-7 h-7 flex items-center justify-center rounded transition ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                  </div>

                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-gray-200 rounded-lg px-2 md:px-3 py-2 outline-none bg-white font-medium text-gray-700">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {paginatedUsers.length === 0 ? (
                <div className="px-6 py-16 text-center text-gray-400 text-sm">
                  No users found. Click{' '}
                  <button onClick={openCreateForm} className="font-medium text-[#1a73e8] hover:underline">Create User</button>{' '}
                  to get started.
                </div>
              ) : viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[800px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/40">
                        <th className="px-4 md:px-6 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.includes(u.id))}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 font-medium text-xs">Name</th>
                        <th className="px-4 py-3 font-medium text-xs">Email</th>
                        <th className="px-4 py-3 font-medium text-xs">Type</th>
                        <th className="px-4 py-3 font-medium text-xs">Status</th>
                        <th className="px-4 py-3 font-medium text-xs">Created By</th>
                        <th className="px-4 md:px-6 py-3 font-medium text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((u: any) => (
                        <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 md:px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(u.id)}
                              onChange={() => toggleUserSelection(u.id)}
                              className="rounded border-gray-300 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">{getUserInitials(u)}</div>
                              <span className="font-medium text-gray-800">{u.firstName} {u.lastName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{u.email || '—'}</td>
                          <td className="px-4 py-4 text-gray-600">{u.role || '—'}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-medium border ${statusColor(u.status)}`}>{titleCase(u.status)}</span>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{u.createdBy ? `${u.createdBy.firstName} ${u.createdBy.lastName}` : '—'}</td>
                          <td className="px-4 md:px-6 py-4 text-right">
                            <button onClick={() => setActionsUser(u)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 inline-flex">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedUsers.map((u: any) => (
                    <div key={u.id} className={`group relative border rounded-2xl bg-white hover:shadow-md transition flex flex-col ${selectedUsers.includes(u.id) ? 'border-[#1a73e8] ring-1 ring-[#1a73e8]/20' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="absolute top-4 left-4 z-10">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={() => toggleUserSelection(u.id)}
                          className="rounded border-gray-300 w-4 h-4 cursor-pointer shadow-sm"
                        />
                      </div>

                      <div className="p-5 pl-12 flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 text-sm font-semibold flex-shrink-0">
                          {getUserInitials(u)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[15px] font-semibold text-gray-900 truncate">{u.firstName} {u.lastName}</h3>
                          <p className="text-[12px] text-gray-500 truncate mt-0.5">{u.email || '—'}</p>
                        </div>
                        <button onClick={() => setActionsUser(u)} className="opacity-0 group-hover:opacity-100 transition p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Actions">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                        </button>
                      </div>

                      <div className="px-5 pb-4 flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {u.role && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                              {u.role}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium border ${statusColor(u.status)}`}>
                            {titleCase(u.status)}
                          </span>
                        </div>
                        {u.createdBy && (
                          <p className="text-[12px] text-gray-500 truncate">
                            Created by {u.createdBy.firstName} {u.createdBy.lastName}
                          </p>
                        )}
                      </div>

                      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                        <button onClick={() => openEditForm(u)} className="text-[12.5px] font-medium text-[#1a73e8] hover:underline">Edit</button>
                        <button onClick={() => setActionsUser(u)} className="text-[12.5px] font-medium text-gray-500 hover:text-gray-800">More</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-4 border-t border-gray-100 gap-3">
                <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-700">{startItem}–{endItem}</span> of <span className="font-semibold text-gray-700">{totalItems}</span></p>
                <div className="flex items-center gap-2">
                  <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center gap-1 px-3 md:px-4 py-2 text-sm rounded-lg border transition ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    Previous
                  </button>
                  <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className={`flex items-center gap-1 px-3 md:px-4 py-2 text-sm rounded-lg border transition ${currentPage >= totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
                    Next
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(view === 'create' || view === 'edit') && (
          <div className="flex-1 overflow-y-auto bg-[#f5f6f8]">
            <div className="bg-white px-4 md:px-8 pt-6 md:pt-7 pb-4 md:pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <button onClick={closeForm} className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center flex-shrink-0 transition">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                  <h1 className="text-[19px] font-bold text-gray-900 leading-tight">{view === 'edit' ? 'Edit User' : 'Create User'}</h1>
                  <p className="text-[13px] text-gray-500 leading-tight mt-0.5">{view === 'edit' ? 'Update the user details below.' : 'Fill in the details below.'}</p>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8 max-w-[720px] mx-auto">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8 shadow-sm space-y-6">
                <div>
                  <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Email <span className="text-red-500">*</span></label>
                  <input type="email" autoFocus placeholder="user@example.com" value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: '' }); }}
                    disabled={!!editingId}
                    className={`w-full h-[46px] px-4 border rounded-lg text-[14px] outline-none transition ${editingId ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${errors.email ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                  {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">First name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="First name" value={form.firstName}
                    onChange={(e) => { setForm({ ...form, firstName: e.target.value }); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }}
                    className={`w-full h-[46px] px-4 border rounded-lg text-[14px] outline-none transition ${errors.firstName ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                  {errors.firstName && <p className="text-xs text-red-500 mt-1.5">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Last name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Last name" value={form.lastName}
                    onChange={(e) => { setForm({ ...form, lastName: e.target.value }); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }}
                    className={`w-full h-[46px] px-4 border rounded-lg text-[14px] outline-none transition ${errors.lastName ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                  {errors.lastName && <p className="text-xs text-red-500 mt-1.5">{errors.lastName}</p>}
                </div>

                <div className="relative" ref={typeRef}>
                  <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Type <span className="text-red-500">*</span></label>
                  <button type="button" onClick={() => setTypeOpen(!typeOpen)} className={`w-full h-[46px] px-4 border rounded-lg text-[14px] bg-white flex items-center justify-between outline-none transition ${errors.role ? 'border-red-400' : typeOpen ? 'border-[#1a73e8] ring-4 ring-[#1a73e8]/10' : 'border-gray-300 hover:border-gray-400'}`}>
                    <span className={form.role ? 'text-gray-800' : 'text-gray-400'}>{form.role || 'Select type...'}</span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${typeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {typeOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden">
                      <button type="button" onClick={() => { setForm({ ...form, role: '' }); setTypeOpen(false); if (errors.role) setErrors({ ...errors, role: '' }); }} className={`w-full text-left px-4 py-3 text-[14px] transition ${form.role === '' ? 'bg-[#1a73e8] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Select type...</button>
                      {ROLE_OPTIONS.map((r) => (
                        <button key={r} type="button" onClick={() => { setForm({ ...form, role: r }); setTypeOpen(false); if (errors.role) setErrors({ ...errors, role: '' }); }} className={`w-full text-left px-4 py-3 text-[14px] transition border-t border-gray-100 ${form.role === r ? 'bg-[#1a73e8] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{r}</button>
                      ))}
                    </div>
                  )}
                  {errors.role && <p className="text-xs text-red-500 mt-1.5">{errors.role}</p>}
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">
                    Password {editingId ? <span className="text-gray-400 font-normal">(leave blank to keep current)</span> : <span className="text-red-500">*</span>}
                  </label>
                  <input type="password" placeholder={editingId ? 'Leave blank to keep current' : 'Min 8 characters'} value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: '' }); }}
                    className={`w-full h-[46px] px-4 border rounded-lg text-[14px] outline-none transition ${errors.password ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                  {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Group <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" placeholder="Select at least one group..." value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className="w-full h-[46px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Status</label>
                  <div className="relative">
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-[46px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
                    </select>
                    <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeForm} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">Cancel</button>
                  <button type="button" onClick={handleSaveUser} disabled={saving} className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>
                    {saving ? (view === 'edit' ? 'Saving...' : 'Creating...') : (view === 'edit' ? 'Save' : 'Create')}
                  </button>
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
                    <button onClick={() => { setActiveInfoTab('user'); setInfoErrors({}); }} className={`px-4 md:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeInfoTab === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>User Info</button>
                    <button onClick={() => { setActiveInfoTab('business'); setInfoErrors({}); }} className={`px-4 md:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeInfoTab === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Business Info</button>
                  </div>
                </div>

                {activeInfoTab === 'user' && (
                  <div className="p-4 md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">First name <span className="text-red-500">*</span></label>
                            <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (infoErrors.firstName) setInfoErrors({ ...infoErrors, firstName: '' }); }} className={`w-full h-[48px] px-4 border rounded-lg text-[14px] outline-none transition ${infoErrors.firstName ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                            {infoErrors.firstName && <p className="text-xs text-red-500 mt-1.5">{infoErrors.firstName}</p>}
                          </div>
                          <div>
                            <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Last name <span className="text-red-500">*</span></label>
                            <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); if (infoErrors.lastName) setInfoErrors({ ...infoErrors, lastName: '' }); }} className={`w-full h-[48px] px-4 border rounded-lg text-[14px] outline-none transition ${infoErrors.lastName ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                            {infoErrors.lastName && <p className="text-xs text-red-500 mt-1.5">{infoErrors.lastName}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Email <span className="text-red-500">*</span></label>
                          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (infoErrors.email) setInfoErrors({ ...infoErrors, email: '' }); }} className={`w-full h-[48px] px-4 border rounded-lg text-[14px] outline-none transition ${infoErrors.email ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                          {infoErrors.email && <p className="text-xs text-red-500 mt-1.5">{infoErrors.email}</p>}
                        </div>
                        <div className="border border-gray-200 rounded-2xl p-4 md:p-6">
                          <p className="text-[11px] font-bold text-gray-500 tracking-[0.12em] uppercase mb-5">Change password — leave blank to keep current</p>
                          <div className="space-y-5">
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">New password</label>
                              <div className="relative">
                                <input type={showNewPassword ? 'text' : 'password'} placeholder="Min 8 chars" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full h-[48px] px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${infoErrors.newPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                              </div>
                              {infoErrors.newPassword && <p className="text-xs text-red-500 mt-1.5">{infoErrors.newPassword}</p>}
                            </div>
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Confirm new password</label>
                              <div className="relative">
                                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full h-[48px] px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${infoErrors.confirmPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                              </div>
                              {infoErrors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{infoErrors.confirmPassword}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-start pt-2">
                        <p className="text-[14px] font-semibold text-gray-800 mb-5">Profile Photo</p>
                        <input ref={accountPhotoInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/webp" className="hidden" onChange={handleAccountPhotoChange} />
                        <div className="relative w-[160px] h-[160px] md:w-[220px] md:h-[220px] mb-6">
                          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {accountPhoto ? <img src={accountPhoto} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-[42px] font-semibold text-gray-600">{getInitials(user.name)}</span>}
                          </div>
                          {accountPhoto && (
                            <button type="button" onClick={handleRemoveAccountPhoto} title="Remove photo" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <button type="button" onClick={handleAccountPhotoClick} className="px-6 h-[42px] border border-gray-300 rounded-full bg-white hover:bg-gray-50 text-[14px] font-medium text-gray-700 transition">{accountPhoto ? 'Change photo' : 'Upload photo'}</button>
                          {accountPhoto && (
                            <button type="button" onClick={handleRemoveAccountPhoto} className="px-4 h-[42px] border border-red-200 rounded-full bg-white hover:bg-red-50 text-[14px] font-medium text-red-600 transition">Remove</button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-4">JPG, PNG, GIF or WebP. Max 6MB.</p>

                        <div className="w-full border-t border-gray-100 my-4"></div>

                        <button
                          type="button"
                          onClick={handleContinueWithGoogle}
                          className="w-full flex items-center justify-center gap-3 h-[52px] border border-gray-200 rounded-full bg-white hover:bg-gray-50 text-[14.5px] font-medium text-gray-800 transition"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24c0,2.209,1.791,4,4,4h8c-1.657,2.372-4.354,4-7.5,4c-4.971,0-9-4.029-9-9s4.029-9,9-9 c2.293,0,4.403,0.866,5.982,2.284l5.658-5.658C35.68,3.5,30.151,2,24,2C11.85,2,2,11.85,2,24s9.85,22,22,22c11.046,0,20.62-8.134,21.773-18.916 C45.937,25.023,45.5,22.5,45.5,20C45.5,19.566,45.451,19.145,45.354,18.738L43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c2.293,0,4.403,0.866,5.982,2.284l5.658-5.658 C35.68,3.5,30.151,2,24,2C16.318,2,9.656,6.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,46c5.152,0,9.861-1.971,13.409-5.192l-6.19-5.238C29.145,36.091,26.705,37,24,37 c-3.184,0-5.905-1.616-7.5-4.145l-6.531,5.027C13.18,42.317,18.223,46,24,46z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24c0,2.209,1.791,4,4,4h8c-0.796,1.14-1.848,2.084-3.076,2.774 c0.001-0.001,6.192,5.238,6.192,5.238C36.971,34.174,46,28,46,20C46,19.653,45.973,19.312,45.921,18.983L43.611,20.083z" />
                          </svg>
                          Continue with Google
                        </button>
                        <p className="text-xs text-gray-500 mt-3 text-center">Link a Google account to sign in faster.</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={() => goTo('list')} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={savingInfo} className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition ${savingInfo ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{savingInfo ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}

                {activeInfoTab === 'business' && (
                  <div className="p-4 md:p-8 lg:p-10">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Company name <span className="text-red-500">*</span></label>
                          <input type="text" placeholder="e.g. TMQA" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Phone <span className="text-red-500">*</span></label>
                          <input type="tel" placeholder="+1 (234) 567-890" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Address</label>
                        <input type="text" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">City</label>
                          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">State</label>
                          <input type="text" placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Zip code</label>
                          <input type="text" placeholder="Zip code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Website</label>
                        <input type="url" placeholder="https://yoursite.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={() => goTo('list')} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">Cancel</button>
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
                          <option value="Imperial">Imperial</option><option value="Metric">Metric</option>
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
                      <div className="w-[80px] md:w-[100px] h-[44px] md:h-[52px] rounded-lg border border-gray-200 bg-white p-1.5 md:p-2 shadow-sm">
                        <div className="w-full h-full rounded-md" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 rounded-full border border-gray-200" style={{ backgroundColor: primaryColor }} />
                        <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-[44px] md:h-[52px] pl-9 md:pl-11 pr-3 md:pr-4 w-[150px] md:w-[180px] border border-gray-200 rounded-lg text-[13px] md:text-[14px] font-medium text-gray-800 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">Account Logo</h3>
                    <p className="text-[13px] text-gray-500 mb-4">Upload your account logo. Max 5MB (PNG, JPG, GIF recommended).</p>
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml" onChange={handleLogoUpload} className="hidden" />

                    <div className="relative inline-block w-full max-w-[300px] md:max-w-none md:w-auto">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full md:w-[400px] h-[140px] md:h-[200px] bg-white border border-gray-200 shadow-sm rounded-xl flex flex-col items-center justify-center hover:border-[#1a73e8] transition relative overflow-hidden group"
                      >
                        {accountLogo ? (
                          <>
                            <img src={accountLogo} alt="Account logo" className="w-full h-full object-contain p-4" />
                            <span className="absolute inset-0 bg-black/40 text-white text-[13px] font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                              Click to change logo
                            </span>
                          </>
                        ) : (
                          <p className="text-[14px] font-medium text-gray-400">Click to upload logo</p>
                        )}
                      </button>

                      {accountLogo && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeAccountLogo(); }}
                          className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition"
                        >
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                        </button>
                      )}
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
                            <option value="BIA">BIA</option>
                            <option value="DEXA">DEXA</option>
                            <option value="Navy">Navy</option>
                            <option value="Skinfold">Skinfold</option>
                            <option value="3D Scan">3D Scan</option>
                          </select>
                          <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Circumference Measurement</label>
                        <div className="relative">
                          <select value={integrations.styku.circumferenceMeasurement} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, circumferenceMeasurement: e.target.value } })} className="w-full h-[44px] md:h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                            <option value="Left Side">Left Side</option>
                            <option value="Right Side">Right Side</option>
                            <option value="Average">Average</option>
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

      {actionsUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setActionsUser(null)}>
          <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl p-5 md:p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-[20px] md:text-[22px] font-bold text-gray-900 leading-tight">User actions</h3>
              <button onClick={() => setActionsUser(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 -mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <button onClick={handleEditFromActions} className="w-full flex items-center gap-3.5 px-4 md:px-5 py-[14px] md:py-[16px] rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition">
                <svg className="w-[20px] h-[20px] text-[#1a73e8] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                <span className="text-[15px] font-semibold text-gray-900">Edit user</span>
              </button>
              <button onClick={handleToggleStatus} className="w-full flex items-center gap-3.5 px-4 md:px-5 py-[14px] md:py-[16px] rounded-xl border border-gray-200 hover:bg-gray-50 text-left transition">
                <svg className="w-[20px] h-[20px] text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                <span className="text-[15px] font-semibold text-gray-900">{actionsUser.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}</span>
              </button>
              <button onClick={handleOpenDelete} className="w-full flex items-center gap-3.5 px-4 md:px-5 py-[14px] md:py-[16px] rounded-xl border border-red-200 bg-red-50/50 text-[#b83232] hover:bg-red-50 text-left transition">
                <svg className="w-[20px] h-[20px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                <span className="text-[15px] font-semibold">Delete user</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative p-5 md:p-7">
            <button onClick={() => setDeleteUser(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 pr-8">Delete &quot;{deleteUser.firstName} {deleteUser.lastName}&quot;?</h2>
            <p className="text-[15px] text-gray-500 mb-7">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteUser(null)} className="px-4 md:px-6 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition">Cancel</button>
              <button onClick={confirmDeleteUser} className="px-4 md:px-6 py-3 text-sm font-semibold text-white bg-[#e51b48] hover:bg-[#c9173d] rounded-full transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== REUSABLE COMPONENTS ==============

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
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 text-[13.5px] rounded-md transition ${active ? 'bg-[#eef2fb] text-[#1a73e8] font-medium' : 'text-gray-600 hover:bg-[#f4f6fb] font-medium'}`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-[#1a73e8] rounded-r"></span>}
      <span className={active ? 'text-[#1a73e8]' : 'text-gray-500'}>{icon}</span>
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
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
              <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
              <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
            </tr>
          </thead>
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
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
              {TESTING_COLUMNS.map(col => (
                <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                  <span className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full uppercase tracking-wider whitespace-nowrap inline-block">{col.label}</span>
                </th>
              ))}
            </tr>
          </thead>
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
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
              <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
            </tr>
          </thead>
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