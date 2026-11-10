'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============ API CONFIG ============
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:4000';

// ============ TYPES (match backend) ============
type TaskStatus = 'OPEN' | 'COMPLETED' | 'OVERDUE';
type TaskPriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
type TaskType = 'GENERAL' | 'METRICS' | 'FORMS' | 'GOALS' | 'CONTACT';
type EventType = 'WORKOUT' | 'REST_DAY' | 'ASSESSMENT' | 'NOTE';

interface ApiTask {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate?: string | null;
  completedDate?: string | null;
  assignees?: string[];
  profiles?: string[];
  createdAt: string;
  updatedAt: string;
  creatorId?: string | null;
}

interface ApiEvent {
  id: string;
  title: string;
  type: EventType;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  note?: string | null;
  users?: string[];
  profiles?: string[];
  createdAt: string;
  updatedAt: string;
  creatorId?: string | null;
}

interface ApiGroup {
  id: string;
  name: string;
  description?: string | null;
}

interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// ============ HELPERS ============
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function apiGet<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GET ${path} failed (${res.status}) ${text}`);
  }
  return res.json();
}

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

// ============ TESTING CONFIG ============
const TESTING_COLUMNS = [
  { id: 'weight_lo', label: 'WEIGHT LO' },
  { id: 'stabilization', label: 'STABILIZATI' },
  { id: 'endurance', label: 'ENDURANC' },
  { id: 'strength', label: 'STRENGTH' },
  { id: 'power', label: 'POWER' },
];

// ============ RESULTS CONFIG ============
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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const [view, setView] = useState<'dashboard' | 'account-info' | 'account-settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [openSections, setOpenSections] = useState({
    home: true,
    organization: true,
    library: true,
    analytics: true,
  });

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // ====== NOTIFICATIONS ======
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [unreadConversations, setUnreadConversations] = useState<any[]>([]);

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'Open' | 'Completed' | 'Overdue' | 'All'>('Open');
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['General', 'Metrics', 'Forms']);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [stats, setStats] = useState({
    openTasks: 0,
    completedTasks: 0,
    openEvents: 0,
    completedEvents: 0,
  });

  // ============ DATA FROM BACKEND ============
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // dashboard filter buttons
  const [groupFilter, setGroupFilter] = useState<'All Groups' | string>('All Groups');
  const [userFilter, setUserFilter] = useState<'All Users' | string>('All Users');
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // events view mode + search
  const [eventsView, setEventsView] = useState<'agenda' | 'calendar'>('agenda');
  const [taskSearch, setTaskSearch] = useState('');

  const [activeTab, setActiveTab] = useState<'user' | 'business'>('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // profile photo (from localStorage 'profile_photo')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // account logo (from account_settings.accountLogo)
  const [accountLogo, setAccountLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [website, setWebsite] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  type SettingsTab = 'privileges' | 'metrics' | 'testing' | 'results' | 'branding' | 'integrations';
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('privileges');
  const [primaryColor, setPrimaryColor] = useState('#F59E0B');

  // ============ PRIVILEGES STATE ============
  const [privileges, setPrivileges] = useState<{ [key: string]: { admin: boolean; supervisor: boolean; staff: boolean } }>(() => {
    const defaultPrivileges: any = {};
    PRIVILEGE_ROWS.forEach((row) => {
      defaultPrivileges[row.id] = { admin: true, supervisor: true, staff: true };
    });
    return defaultPrivileges;
  });

  // ============ METRICS STATE ============
  const [measurementSystem, setMeasurementSystem] = useState<'Imperial' | 'Metric'>('Imperial');
  const [metricsData, setMetricsData] = useState<{
    [key: string]: { days: string; show: boolean }
  }>(() => {
    const initial: any = {};
    [
      ...METRICS_BASIC, 
      ...METRICS_HEALTH,
      ...METRICS_BODY_COMPOSITION, 
      ...METRICS_CARDIO, 
      ...METRICS_STRENGTH,
      ...METRICS_POWER,
      ...METRICS_BIOMECHANICS,
      ...METRICS_PROGRESS_PHOTO,
      ...METRICS_SENIOR
    ].forEach((m) => {
      initial[m.id] = { days: m.defaultDays, show: m.defaultShow };
    });
    return initial;
  });

  // ============ TESTING STATE ============
  const [testingData, setTestingData] = useState<{
    [key: string]: { [colId: string]: boolean }
  }>(() => {
    const initial: any = {};
    [
      ...METRICS_BASIC, 
      ...METRICS_HEALTH,
      ...METRICS_BODY_COMPOSITION, 
      ...METRICS_CARDIO, 
      ...METRICS_STRENGTH,
      ...METRICS_POWER,
      ...METRICS_BIOMECHANICS,
      ...METRICS_PROGRESS_PHOTO,
      ...METRICS_SENIOR
    ].forEach((m) => {
      initial[m.id] = {
        weight_lo: true,
        stabilization: true,
        endurance: true,
        strength: true,
        power: true,
      };
    });
    if (initial['weight']) {
        initial['weight'] = { weight_lo: true, stabilization: true, endurance: true, strength: true, power: true };
    }
    return initial;
  });

  // ============ RESULTS STATE ============
  const [resultsData, setResultsData] = useState<{
    [key: string]: string
  }>(() => {
    const initial: any = {};
    [
      ...METRICS_BASIC, 
      ...METRICS_HEALTH,
      ...METRICS_BODY_COMPOSITION, 
      ...METRICS_CARDIO, 
      ...METRICS_STRENGTH,
      ...METRICS_POWER,
      ...METRICS_BIOMECHANICS,
      ...METRICS_PROGRESS_PHOTO,
      ...METRICS_SENIOR
    ].forEach((m) => {
      initial[m.id] = INTERPRETATION_TEXT[m.id] || "";
    });
    
    if (initial['weight']) initial['weight'] = INTERPRETATION_TEXT.weight;
    if (initial['body_fat']) initial['body_fat'] = INTERPRETATION_TEXT.body_fat;
    if (initial['lean_mass']) initial['lean_mass'] = INTERPRETATION_TEXT.lean_mass;
    if (initial['bmi']) initial['bmi'] = INTERPRETATION_TEXT.bmi;
    if (initial['metabolic_inbody']) initial['metabolic_inbody'] = INTERPRETATION_TEXT.metabolic_rate;
    if (initial['metabolic_result']) initial['metabolic_result'] = INTERPRETATION_TEXT.metabolic_rate;
    if (initial['metabolic_harris']) initial['metabolic_harris'] = INTERPRETATION_TEXT.metabolic_rate;
    if (initial['vo2_1mile']) initial['vo2_1mile'] = INTERPRETATION_TEXT.vo2max;
    if (initial['vo2_ebbeling']) initial['vo2_ebbeling'] = INTERPRETATION_TEXT.vo2max;
    if (initial['vo2_3min']) initial['vo2_3min'] = INTERPRETATION_TEXT.vo2max;
    if (initial['vo2_12min']) initial['vo2_12min'] = INTERPRETATION_TEXT.vo2max;
    if (initial['vo2_15mile']) initial['vo2_15mile'] = INTERPRETATION_TEXT.vo2max;
    if (initial['vo2_cycle']) initial['vo2_cycle'] = INTERPRETATION_TEXT.vo2max;
    if (initial['vo2_bruce']) initial['vo2_bruce'] = INTERPRETATION_TEXT.vo2max;
    if (initial['vo2_result']) initial['vo2_result'] = INTERPRETATION_TEXT.vo2max;
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
  });

  const [integrations, setIntegrations] = useState({
    inbody: { enabled: false, apiUsername: '', apiKey: '' },
    evolt: { enabled: false, clientId: '', clientSecret: '' },
    styku: {
      enabled: false,
      apiKey: '',
      apiSecret: '',
      bodyFatMethod: 'BIA',
      circumferenceMeasurement: 'Left Side',
    },
  });

  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  // ===== LOAD USER FROM STORAGE =====
  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token || !stored) {
      router.push('/');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      const first = (parsed.firstName || '').trim();
      const last = (parsed.lastName || '').trim();
      if (first || last) {
        setFirstName(first);
        setLastName(last);
      } else if (parsed.name) {
        const parts = String(parsed.name).split(/\s+/).filter(Boolean);
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
      setEmail(parsed.email || '');
    } catch {
      router.push('/');
      return;
    }

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
      } catch (err) { console.error(err); }
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
            styku: { ...prev.styku, ...(s.integrations.styku || {}) },
          }));
        }
        if (s.privileges) {
          setPrivileges((prev) => ({ ...prev, ...s.privileges }));
        }
        if (s.measurementSystem) {
          setMeasurementSystem(s.measurementSystem);
        }
        if (s.metricsData) {
          setMetricsData((prev) => ({ ...prev, ...s.metricsData }));
        }
        if (s.testingData) {
          setTestingData((prev) => ({ ...prev, ...s.testingData }));
        }
        if (s.resultsData) {
          setResultsData((prev) => ({ ...prev, ...s.resultsData }));
        }
      } catch (err) { console.error(err); }
    }

    // profile photo has its own key
    const storedPhoto = localStorage.getItem('profile_photo');
    if (storedPhoto) setProfilePhoto(storedPhoto);

    setLoading(false);
  }, [router]);

  // ===== LOAD DATA FROM BACKEND =====
  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const [tasksRes, eventsRes, groupsRes, usersRes, messagesRes] = await Promise.allSettled([
        apiGet<ApiTask[]>('/tasks'),
        apiGet<ApiEvent[]>('/events'),
        apiGet<ApiGroup[]>('/groups'),
        apiGet<ApiUser[]>('/users'),
        apiGet<any[]>('/messages'),
      ]);

      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value || []);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value || []);
      if (groupsRes.status === 'fulfilled') setGroups(groupsRes.value || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value || []);
      if (messagesRes.status === 'fulfilled') {
        setUnreadConversations((messagesRes.value || []).filter((c: any) => c.unread === true));
      }

      const failed: string[] = [];
      if (tasksRes.status === 'rejected') failed.push('tasks');
      if (eventsRes.status === 'rejected') failed.push('events');
      if (groupsRes.status === 'rejected') failed.push('groups');
      if (usersRes.status === 'rejected') failed.push('users');
      if (failed.length) {
        setDataError(`Could not load: ${failed.join(', ')}. Check backend is running at ${API_URL}.`);
      }
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load dashboard data');
    } finally {
      setDataLoading(false);
    }
  }, []);

  // ===== FETCH PRIVILEGES FROM BACKEND =====
  const fetchPrivileges = useCallback(async () => {
    try {
      const res = await apiGet<{ [key: string]: { admin: boolean; supervisor: boolean; staff: boolean } }>('/privileges');
      if (res && typeof res === 'object') {
        setPrivileges((prev) => ({ ...prev, ...res }));
      }
    } catch (err) {
      // Non-fatal — dashboard still works with localStorage fallback
      console.error('Failed to load privileges from backend', err);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      loadDashboardData();
      fetchPrivileges();
    }
  }, [loading, user, loadDashboardData, fetchPrivileges]);

  // refetch on tab focus
  useEffect(() => {
    const onFocus = () => {
      const tk = getToken();
      if (tk && user) loadDashboardData();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [user, loadDashboardData]);

  // ===== COMPUTE STATS =====
  useEffect(() => {
    const openTasks = tasks.filter((t) => t.status === 'OPEN').length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openEvents = events.filter((e) => {
      if (!e.date) return true;
      return new Date(e.date).getTime() >= today.getTime();
    }).length;

    const completedEvents = events.filter((e) => {
      if (!e.date) return false;
      return new Date(e.date).getTime() < today.getTime();
    }).length;

    setStats({ openTasks, completedTasks, openEvents, completedEvents });
  }, [tasks, events]);

  // ===== CLICK OUTSIDE =====
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) setStatusDropdownOpen(false);
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(target)) setTypeDropdownOpen(false);
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) setAccountMenuOpen(false);
      if (groupMenuRef.current && !groupMenuRef.current.contains(target)) setGroupMenuOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ===== FILTERED TASKS =====
  const filteredTasks = useMemo(() => {
    const statusMap: Record<string, TaskStatus[]> = {
      Open: ['OPEN'],
      Completed: ['COMPLETED'],
      Overdue: ['OVERDUE'],
      All: ['OPEN', 'COMPLETED', 'OVERDUE'],
    };
    const typeMap: Record<string, TaskType> = {
      General: 'GENERAL',
      Metrics: 'METRICS',
      Forms: 'FORMS',
      Goals: 'GOALS',
      Contact: 'CONTACT',
    };

    return tasks
      .filter((t) => statusMap[selectedStatus]?.includes(t.status))
      .filter((t) =>
        selectedTypes.length === 0
          ? true
          : selectedTypes.some((label) => typeMap[label] === t.type),
      )
      .filter((t) => {
        if (userFilter === 'All Users') return true;
        return Array.isArray(t.assignees) && t.assignees.includes(userFilter);
      })
      .filter((t) => {
        if (groupFilter === 'All Groups') return true;
        return Array.isArray(t.profiles) && t.profiles.includes(groupFilter);
      })
      .filter((t) => {
        if (!taskSearch.trim()) return true;
        const q = taskSearch.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return ad - bd;
      });
  }, [tasks, selectedStatus, selectedTypes, userFilter, groupFilter, taskSearch]);

  useEffect(() => {
    setTotalItems(filteredTasks.length);
    const pages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
    if (currentPage > pages) setCurrentPage(pages);
  }, [filteredTasks, itemsPerPage, currentPage]);

  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(start, start + itemsPerPage);
  }, [filteredTasks, currentPage, itemsPerPage]);

  // ===== FILTERED EVENTS =====
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (userFilter === 'All Users') return true;
        return Array.isArray(e.users) && e.users.includes(userFilter);
      })
      .sort((a, b) => {
        const ad = a.date ? new Date(a.date).getTime() : Infinity;
        const bd = b.date ? new Date(b.date).getTime() : Infinity;
        return ad - bd;
      });
  }, [events, userFilter]);

  // ===== HELPERS =====
  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'U';
    const parts = name.split(/[.\s+_-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (name?: string) => {
    if (!name || typeof name !== 'string') return 'User';
    const parts = name.split(/[.\s+_-]+/).filter(Boolean);
    const nameOnly = parts.filter((p) => isNaN(Number(p)));
    return nameOnly.map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ') || 'User';
  };

  const getUserName = (u: any): string => {
    if (!u) return 'User';
    if (u.name && typeof u.name === 'string' && u.name.trim()) return u.name.trim();
    const first = (u.firstName || '').trim();
    const last = (u.lastName || '').trim();
    const combined = `${first} ${last}`.trim();
    return combined || u.email || 'User';
  };

  const getUserRole = (u: any): string => {
    if (!u) return '';
    const r = u.role || '';
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    router.push('/');
  };

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const clearTypes = () => setSelectedTypes([]);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const goTo = (next: 'dashboard' | 'account-info' | 'account-settings') => {
    setAccountMenuOpen(false);
    setIsSidebarOpen(false);
    setTimeout(() => setView(next), 0);
  };

  // ===== SAVE ACCOUNT INFO =====
  const handleSaveAccountInfo = async () => {
    const errs: { [key: string]: string } = {};

    if (activeTab === 'user') {
      if (!firstName.trim()) errs.firstName = 'First name is required';
      if (!lastName.trim()) errs.lastName = 'Last name is required';
      if (!email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
      if (newPassword && newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
      if (newPassword && newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setToast({ message: 'Please fix the highlighted fields', type: 'error' });
        return;
      }

      setErrors({});
      setSaving(true);
      await new Promise((r) => setTimeout(r, 400));

      const updatedUser = {
        ...(user || {}),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim().toLowerCase(),
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setNewPassword('');
      setConfirmPassword('');
      setSaving(false);
      setToast({
        message: newPassword ? 'Profile and password updated successfully' : 'Profile updated successfully',
        type: 'success',
      });
    } else {
      if (!companyName.trim()) errs.companyName = 'Company name is required';
      if (!phone.trim()) errs.phone = 'Phone is required';

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setToast({ message: 'Please fix the highlighted fields', type: 'error' });
        return;
      }

      setErrors({});
      setSaving(true);
      await new Promise((r) => setTimeout(r, 400));

      localStorage.setItem('business_info', JSON.stringify({
        companyName: companyName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        zipCode: zipCode.trim(),
        website: website.trim(),
      }));

      setSaving(false);
      setToast({ message: 'Business info saved successfully', type: 'success' });
    }
  };

  // ===== PRIVILEGES TOGGLE (with cascade: Admin ≥ Supervisor ≥ Staff) =====
  const handleTogglePrivilege = (rowId: string, role: 'admin' | 'supervisor' | 'staff') => {
    if (user?.role !== 'ADMIN') {
      setToast({ message: 'Only Admins can change privileges', type: 'error' });
      return;
    }

    setPrivileges((prev) => {
      const current = prev[rowId] || { admin: false, supervisor: false, staff: false };
      const next = { ...current };
      let changed = false;
      let added = false;

      if (role === 'admin') {
        next.admin = !current.admin;
        changed = true;
        added = next.admin;

        if (!next.admin) {
          next.supervisor = false;
          next.staff = false;
        }
      } else if (role === 'supervisor') {
        if (!current.admin && !current.supervisor) {
          setToast({ message: `Cannot enable Supervisor — Admin must be enabled first`, type: 'error' });
          return prev;
        }
        next.supervisor = !current.supervisor;
        changed = true;
        added = next.supervisor;
        if (!next.supervisor) {
          next.staff = false;
        }
      } else if (role === 'staff') {
        if (!current.supervisor && !current.staff) {
          setToast({ message: `Cannot enable Staff — Supervisor must be enabled first`, type: 'error' });
          return prev;
        }
        next.staff = !current.staff;
        changed = true;
        added = next.staff;
      }

      if (changed) {
        // THIS IS THE EXACT MESSAGE FORMAT YOU WANT
        setToast({
          message: added ? `Privilege added for ${role}` : `Privilege removed for ${role}`,
          type: 'success', // 'success' makes the checkmark green
        });
      }

      return { ...prev, [rowId]: next };
    });
  };

  // ✅ INLINE HELPER — check if the current user's role has a given privilege
  const can = (key: string): boolean => {
    if (!user) return false;
    const roleKey = (user.role || '').toLowerCase() as 'admin' | 'supervisor' | 'staff';
    return privileges?.[key]?.[roleKey] === true;
  };

  // ===== PROFILE PHOTO =====
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Photo too large. Max 5MB.', type: 'error' });
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please choose an image file.', type: 'error' });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      localStorage.setItem('profile_photo', dataUrl);
      setToast({ message: 'Profile photo updated', type: 'success' });
    };
    reader.onerror = () => setToast({ message: 'Failed to read image', type: 'error' });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    localStorage.removeItem('profile_photo');
    setToast({ message: 'Profile photo removed', type: 'success' });
  };

  // ===== ACCOUNT LOGO =====
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File too large. Max 5MB.', type: 'error' });
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please choose an image file.', type: 'error' });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAccountLogo(dataUrl);
      try {
        const s = JSON.parse(localStorage.getItem('account_settings') || '{}');
        s.accountLogo = dataUrl;
        localStorage.setItem('account_settings', JSON.stringify(s));
      } catch {}
      setToast({ message: 'Account logo updated', type: 'success' });
    };
    reader.onerror = () => setToast({ message: 'Failed to read image', type: 'error' });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAccountLogo = () => {
    setAccountLogo(null);
    try {
      const s = JSON.parse(localStorage.getItem('account_settings') || '{}');
      s.accountLogo = null;
      localStorage.setItem('account_settings', JSON.stringify(s));
    } catch {}
    setLogoError(false);
    setToast({ message: 'Account logo removed', type: 'success' });
  };

  // ✅ SAVE SETTINGS — persists privileges to backend (ADMIN only)
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
      setToast({ message: 'Settings saved locally. Only Admins can modify global privileges.', type: 'success' });
      return;
    }

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/privileges`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(privileges),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save privileges');
      }

      setToast({ message: 'Privileges saved to database successfully', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to save privileges', type: 'error' });
    }
  };

  const handleContinueWithGoogle = () => {
    setToast({
      message: 'Google sign-in is not configured yet. Add a Google OAuth client to enable it.',
      type: 'error',
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  const displayName = getDisplayName(getUserName(user));
  const userName = getUserName(user);
  const userRole = getUserRole(user);
  const unreadCount = unreadConversations.length;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex relative overflow-hidden">
      {/* 
        ========================================================
        THIS IS THE TOAST UI THAT MATCHES YOUR IMAGE EXACTLY
        ========================================================
      */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300]">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-3.5 px-5 flex items-center gap-4 min-w-[360px] max-w-md">
            {/* Green Checkmark Circle (or Red X for errors) */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-[#eefdf5] text-[#10b981]'}`}>
              {toast.type === 'error' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              )}
            </div>
            
            {/* Message Text */}
            <p className="text-[15px] font-medium text-gray-700 flex-1">{toast.message}</p>
            
            {/* Close (X) Button */}
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-full transition-transform duration-300 lg:translate-x-0 lg:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={() => goTo('dashboard')}
            title="Go to Dashboard"
            className="flex items-center gap-3 w-full text-left cursor-pointer"
          >
            <div className="h-10 flex-shrink-0 relative overflow-hidden">
              {accountLogo ? (
                <img src={accountLogo} alt="Logo" className="h-full w-auto object-contain" />
              ) : (
                <img 
                  src="/logo.jpeg" 
                  alt="Logo" 
                  className="h-full w-auto object-contain" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              )}
              <div className="hidden text-gray-400 font-bold text-lg">LOGO</div>
            </div>
            <div className="min-w-0 flex-1 hidden sm:block">
            </div>
          </button>

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
                <NavLink href="#" label="Dashboard" active={view === 'dashboard'} icon={<IconDashboard />} onClick={(e: any) => { e.preventDefault(); goTo('dashboard'); }} />
                <NavLink href="/tasks" label="Tasks" icon={<IconTask />} />
                <NavLink href="/calendar" label="Calendar" icon={<IconCalendar />} />
                <NavLink href="/messages" label="Messages" icon={<IconMessage />} badge={unreadCount} />
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
                <NavLink href="/profiles" label="Profiles" icon={<IconProfiles />} />
                <NavLink href="/users" label="Users" icon={<IconUser />} />
                <NavLink href="/groups" label="Groups" icon={<IconGroup />} />
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
                <NavLink href="/programs" label="Programs" icon={<IconBook />} />
                <NavLink href="/workouts" label="Workouts" icon={<IconBolt />} />
                <NavLink href="/exercises" label="Exercises" icon={<IconActivity />} />
                <NavLink href="/forms" label="Forms" icon={<IconForm />} />
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
                <NavLink href="/reports" label="Reports" icon={<IconChart />} />
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

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          
          {/* Mobile Menu Button */}
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
                <div className="absolute top-full right-0 mt-3 w-[300px] md:w-[340px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-[14px] font-semibold text-gray-900">Notifications {unreadCount > 0 && <span className="text-gray-500 font-normal">({unreadCount})</span>}</p>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {unreadConversations.length === 0 ? <div className="px-4 py-8 text-center text-sm text-gray-400">No unread messages</div> : (
                      unreadConversations.map((c) => (
                        <Link href="/messages" key={c.id} onClick={() => setNotificationsOpen(false)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition block">
                          <div className="flex items-start gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-semibold text-gray-900 truncate">{c.profile?.firstName} {c.profile?.lastName}</p>
                              <p className="text-[12px] text-gray-500 truncate">{c.lastMessage}</p>
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
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(userName)
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-none">{userName}</p>
                  <p className="text-[11px] text-gray-500 leading-none mt-1">{userRole}</p>
                </div>
              </button>

              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-[280px] md:w-[320px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-[15px] font-semibold text-gray-900">{userName}</p>
                    <p className="text-[12.5px] text-gray-500 mt-0.5">{userRole}</p>
                  </div>
                  <div className="py-2">
                    <button onClick={() => goTo('dashboard')} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
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

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#f7f8fa]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{getGreeting()}, {displayName} 👋</h1>
                <p className="text-sm text-gray-500">{getFormattedDate()}</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none" ref={groupMenuRef}>
                  <FilterButton label={groupFilter} onClick={() => setGroupMenuOpen((v) => !v)} />
                  {groupMenuOpen && (
                    <div className="absolute right-0 mt-2 w-full md:w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                      <button
                        onClick={() => { setGroupFilter('All Groups'); setGroupMenuOpen(false); setCurrentPage(1); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${groupFilter === 'All Groups' ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}
                      >
                        All Groups
                      </button>
                      {groups.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => { setGroupFilter(g.name); setGroupMenuOpen(false); setCurrentPage(1); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${groupFilter === g.name ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative flex-1 md:flex-none" ref={userMenuRef}>
                  <FilterButton label={userFilter === 'All Users' ? 'All Users' : (users.find(u => u.id === userFilter) ? `${users.find(u => u.id === userFilter)!.firstName} ${users.find(u => u.id === userFilter)!.lastName}` : 'All Users')} onClick={() => setUserMenuOpen((v) => !v)} />
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-full md:w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 max-h-72 overflow-y-auto">
                      <button
                        onClick={() => { setUserFilter('All Users'); setUserMenuOpen(false); setCurrentPage(1); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${userFilter === 'All Users' ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}
                      >
                        All Users
                      </button>
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => { setUserFilter(u.id); setUserMenuOpen(false); setCurrentPage(1); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${userFilter === u.id ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}
                        >
                          {u.firstName} {u.lastName}
                          <span className="ml-1 text-[11px] text-gray-400">({u.role})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {dataError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {dataError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard number={stats.openTasks} label="Open Tasks" />
              <StatCard number={stats.completedTasks} label="Completed Tasks" />
              <StatCard number={stats.openEvents} label="Open Events" />
              <StatCard number={stats.completedEvents} label="Completed Events" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* TASKS CARD */}
              <div className="bg-white border border-gray-200 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Tasks</h2>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 md:px-3 py-1 rounded-md font-medium">{totalItems} total</span>
                </div>
                <div className="px-4 md:px-6 pb-4 md:pb-5 flex flex-col md:flex-row items-start md:items-center gap-3 flex-wrap border-b border-gray-100">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none" ref={statusDropdownRef}>
                      <button onClick={() => setStatusDropdownOpen(!statusDropdownOpen)} className="w-full md:w-auto flex items-center justify-between md:justify-start gap-1.5 px-3 md:px-4 py-2 text-sm font-medium text-[#1a73e8] bg-blue-50 border border-blue-100 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        Status: {selectedStatus}
                        <svg className={`w-3.5 h-3.5 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {statusDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full md:w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                          {(['Open', 'Completed', 'Overdue', 'All'] as const).map((s) => (
                            <button key={s} onClick={() => { setSelectedStatus(s); setStatusDropdownOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedStatus === s ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>
                              {s}
                              {selectedStatus === s && (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="relative flex-1 md:flex-none" ref={typeDropdownRef}>
                      <button onClick={() => setTypeDropdownOpen(!typeDropdownOpen)} className="w-full md:w-auto flex items-center justify-between md:justify-start gap-1.5 px-3 md:px-4 py-2 text-sm font-medium text-[#1a73e8] bg-blue-50 border border-blue-100 rounded-full">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                        Type ({selectedTypes.length})
                        <svg className={`w-3.5 h-3.5 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {typeDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full md:w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                          <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-0.5">Filter by type</p>
                          <p className="text-xs text-gray-400 mb-4">Show tasks for any selected type</p>
                          <div className="space-y-3">
                            {['General', 'Metrics', 'Forms', 'Goals', 'Contact'].map((type) => {
                              const checked = selectedTypes.includes(type);
                              return (
                                <label key={type} className="flex items-center gap-3 cursor-pointer select-none">
                                  <span className={`w-5 h-5 flex items-center justify-center rounded border-2 transition ${checked ? 'bg-[#1a73e8] border-[#1a73e8]' : 'bg-white border-gray-300'}`}>
                                    {checked && (<svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>)}
                                  </span>
                                  <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleType(type)} />
                                  <span className="text-sm text-gray-800 font-medium">{type}</span>
                                </label>
                              );
                            })}
                          </div>
                          <button onClick={clearTypes} className="mt-5 text-sm text-gray-500 hover:text-gray-800">Clear filter</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative ml-auto w-full md:w-auto">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={taskSearch}
                      onChange={(e) => { setTaskSearch(e.target.value); setCurrentPage(1); }}
                      className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-full md:w-52 outline-none focus:border-blue-500"
                    />
                  </div>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-gray-200 rounded-md px-2 py-2 outline-none bg-white font-medium w-full md:w-auto">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/40">
                        <th className="px-4 md:px-6 py-3 font-medium text-xs">Task</th>
                        <th className="px-2 md:px-4 py-3 font-medium text-xs">Status</th>
                        <th className="px-2 md:px-4 py-3 font-medium text-xs">Type</th>
                        <th className="px-2 md:px-4 py-3 font-medium text-xs">Profile</th>
                        <th className="px-2 md:px-4 py-3 font-medium text-xs">Due</th>
                        <th className="px-4 md:px-6 py-3 font-medium text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataLoading ? (
                        <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">Loading tasks...</td></tr>
                      ) : pagedTasks.length === 0 ? (
                        <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-sm">No tasks yet.</td></tr>
                      ) : (
                        pagedTasks.map((t) => (
                          <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                            <td className="px-4 md:px-6 py-3 text-gray-800 font-medium">{t.title}</td>
                            <td className="px-2 md:px-4 py-3">
                              <StatusBadge status={t.status} />
                            </td>
                            <td className="px-2 md:px-4 py-3 text-gray-600 text-xs capitalize">{t.type.toLowerCase()}</td>
                            <td className="px-2 md:px-4 py-3 text-gray-600 text-xs">
                              {Array.isArray(t.profiles) && t.profiles.length > 0 ? `${t.profiles.length} profile(s)` : '—'}
                            </td>
                            <td className="px-2 md:px-4 py-3 text-gray-600 text-xs">
                              {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-4 md:px-6 py-3 text-right">
                              <Link href={`/tasks/${t.id}`} className="text-[#1a73e8] text-xs font-medium hover:underline">View</Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-4 border-t border-gray-100 mt-auto gap-3">
                  <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-700">{startItem}–{endItem}</span> of <span className="font-semibold text-gray-700">{totalItems}</span></p>
                  <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    <button onClick={handlePrevious} disabled={currentPage === 1} className={`flex items-center gap-1 px-3 md:px-4 py-2 text-sm rounded-lg border transition ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                      Previous
                    </button>
                    <button onClick={handleNext} disabled={currentPage >= totalPages} className={`flex items-center gap-1 px-3 md:px-4 py-2 text-sm rounded-lg border transition ${currentPage >= totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
                      Next
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* EVENTS CARD */}
              <div className="bg-white border border-gray-200 rounded-2xl">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Events</h2>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 md:px-3 py-1 rounded-md font-medium">{filteredEvents.length} total</span>
                </div>
                <div className="px-4 md:px-6 pb-4 md:pb-5 flex flex-col md:flex-row items-start md:items-center gap-2 border-b border-gray-100">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-full md:w-auto">
                    <button
                      onClick={() => setEventsView('agenda')}
                      className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md ${eventsView === 'agenda' ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-500'}`}
                    >
                      Agenda
                    </button>
                    <button
                      onClick={() => setEventsView('calendar')}
                      className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md ${eventsView === 'calendar' ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-500'}`}
                    >
                      Calendar
                    </button>
                  </div>
                  <div className="ml-auto flex items-center gap-2 w-full md:w-auto justify-end">
                    <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      Today
                    </button>
                  </div>
                </div>
                <div className="px-4 md:px-6 py-3 text-xs font-medium text-gray-500">{new Date().toISOString().split('T')[0]}</div>

                {dataLoading ? (
                  <div className="px-6 py-16 text-center text-gray-400 text-sm">Loading events...</div>
                ) : filteredEvents.length === 0 ? (
                  <div className="px-6 py-16 text-center text-gray-400 text-sm">No events yet.</div>
                ) : eventsView === 'agenda' ? (
                  <ul className="px-4 md:px-6 pb-5 divide-y divide-gray-50">
                    {filteredEvents.map((e) => (
                      <li key={e.id} className="py-3 flex items-start gap-3">
                        <div className="w-10 text-center text-[11px] text-gray-500 flex-shrink-0">
                          {e.date ? (
                            <>
                              <div className="font-bold text-gray-700 text-sm">
                                {new Date(e.date).getDate()}
                              </div>
                              <div>
                                {new Date(e.date).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-400">—</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{e.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize truncate">
                            {e.type.toLowerCase().replace('_', ' ')}
                            {e.startTime ? ` · ${e.startTime}` : ''}
                            {e.endTime ? `–${e.endTime}` : ''}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <CalendarView events={filteredEvents} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT INFO VIEW */}
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
                    <button onClick={() => { setActiveTab('user'); setErrors({}); }} className={`px-4 md:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeTab === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>User Info</button>
                    <button onClick={() => { setActiveTab('business'); setErrors({}); }} className={`px-4 md:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeTab === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Business Info</button>
                  </div>
                </div>

                {activeTab === 'user' && (
                  <div className="p-4 md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">First name <span className="text-red-500">*</span></label>
                            <input type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }} className={`w-full h-12 px-4 border rounded-lg text-[14px] outline-none transition ${errors.firstName ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                            {errors.firstName && <p className="text-xs text-red-500 mt-1.5">{errors.firstName}</p>}
                          </div>
                          <div>
                            <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Last name <span className="text-red-500">*</span></label>
                            <input type="text" value={lastName} onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }} className={`w-full h-12 px-4 border rounded-lg text-[14px] outline-none transition ${errors.lastName ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                            {errors.lastName && <p className="text-xs text-red-500 mt-1.5">{errors.lastName}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Email <span className="text-red-500">*</span></label>
                          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }} className={`w-full h-12 px-4 border rounded-lg text-[14px] outline-none transition ${errors.email ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                          {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
                        </div>
                        <div className="border border-gray-200 rounded-2xl p-4 md:p-6">
                          <p className="text-[11px] font-bold text-gray-500 tracking-[0.12em] uppercase mb-5">Change password — leave blank to keep current</p>
                          <div className="space-y-5">
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">New password</label>
                              <div className="relative">
                                <input type={showNewPassword ? 'text' : 'password'} placeholder="Min 8 chars, upper, lower, number, special" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full h-12 px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${errors.newPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showNewPassword ? 'Hide password' : 'Show password'}>
                                  {showNewPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  )}
                                </button>
                              </div>
                              {errors.newPassword && <p className="text-xs text-red-500 mt-1.5">{errors.newPassword}</p>}
                            </div>
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Confirm new password</label>
                              <div className="relative">
                                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full h-12 px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                                  {showConfirmPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                  ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  )}
                                </button>
                              </div>
                              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword}</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-start pt-2">
                        <p className="text-[14px] font-semibold text-gray-800 mb-5">Profile Photo</p>
                        <input                          ref={profileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                          onChange={handleProfilePhotoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => profileInputRef.current?.click()}
                          title={profilePhoto ? 'Change profile photo' : 'Upload profile photo'}
                          className="w-40 h-40 md:w-55 md:h-55 rounded-full bg-gray-200 flex items-center justify-center mb-6 overflow-hidden relative group ring-2 ring-transparent hover:ring-[#1a73e8] transition"
                        >
                          {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[42px] font-semibold text-gray-600">{getInitials(userName)}</span>
                          )}
                          <span className="absolute inset-0 bg-black/40 text-white text-[13px] font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            {profilePhoto ? 'Change photo' : 'Upload photo'}
                          </span>
                        </button>
                        <div className="flex items-center gap-2 mb-4">
                          <button type="button" onClick={() => profileInputRef.current?.click()} className="px-6 h-10.5 border border-gray-300 rounded-full bg-white hover:bg-gray-50 text-[14px] font-medium text-gray-700 transition">
                            {profilePhoto ? 'Change photo' : 'Upload photo'}
                          </button>
                          {profilePhoto && (
                            <button type="button" onClick={removeProfilePhoto} className="px-4 h-10.5 border border-red-200 rounded-full bg-white hover:bg-red-50 text-[14px] font-medium text-red-600 transition">
                              Remove
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleContinueWithGoogle}
                          className="w-full max-w-65 h-11 inline-flex items-center justify-center gap-2 border border-gray-300 rounded-full bg-white hover:bg-gray-50 text-[14px] font-medium text-gray-800 transition"
                        >
                          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.26 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0012 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.1A6.61 6.61 0 015.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A10.99 10.99 0 001 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
                          </svg>
                          Continue with Google
                        </button>
                        <p className="text-xs text-gray-500 mt-3 text-center max-w-65">
                          Link a Google account to sign in faster. JPG, PNG, GIF or WebP up to 5MB.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={() => setView('dashboard')} className="px-6 h-11 text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={saving} className={`px-6 h-11 text-[14px] font-semibold text-white rounded-lg transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{saving ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}

                {activeTab === 'business' && (
                  <div className="p-4 md:p-8 lg:p-10">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Company name <span className="text-red-500">*</span></label>
                          <input type="text" placeholder="e.g. TMQA" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Phone <span className="text-red-500">*</span></label>
                          <input type="tel" placeholder="+1 (234) 567-890" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Address</label>
                        <input type="text" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">City</label>
                          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">State</label>
                          <input type="text" placeholder="State" value={stateName} onChange={(e) => setStateName(e.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                        <div>
                          <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Zip code</label>
                          <input type="text" placeholder="Zip code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Website</label>
                        <input type="url" placeholder="https://yoursite.com" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={() => setView('dashboard')} className="px-6 h-11 text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={saving} className={`px-6 h-11 text-[14px] font-semibold text-white rounded-lg transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{saving ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT SETTINGS VIEW */}
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

            <div className="px-4 md:px-10 pb-10 max-w-350">
              {settingsTab === 'privileges' && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
                    <h3 className="text-[16px] font-bold text-gray-900 mb-2">Privileges</h3>
                    <p className="text-[13px] text-gray-500 mb-6">
                      Manage role-based permissions for account members.
                      {!isAdmin && <span className="ml-1 text-amber-600">(Only ADMIN can change these.)</span>}
                    </p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
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
                                
                                {/* Admin Checkbox */}
                                <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={adminOn}
                                    onChange={() => handleTogglePrivilege(row.id, 'admin')}
                                    disabled={!isAdmin}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                </td>
                                
                                {/* Supervisor Checkbox - Disabled if Admin is off */}
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
                                
                                {/* Staff Checkbox - Disabled if Supervisor is off */}
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
                </div>
              )}

              {settingsTab === 'metrics' && (
                <div className="space-y-8">
                  {/* Measurement System */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-2">
                      <label className="text-[14px] font-semibold text-gray-900">Measurement System</label>
                      <div className="relative inline-block w-full md:w-auto">
                        <select 
                          value={measurementSystem} 
                          onChange={(e) => setMeasurementSystem(e.target.value as 'Imperial' | 'Metric')}
                          className="w-full md:w-auto h-10 pl-4 pr-10 border border-gray-300 rounded-lg text-[14px] bg-white outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none cursor-pointer"
                        >
                          <option value="Imperial">Imperial</option>
                          <option value="Metric">Metric</option>
                        </select>
                        <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Basic Data Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Basic Data
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BASIC.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Internal Health Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Internal Health
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_HEALTH.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Body Composition Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Body Composition
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BODY_COMPOSITION.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cardiovascular Capacity Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Cardiovascular Capacity
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_CARDIO.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Strength Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Strength
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_STRENGTH.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Power Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Power
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_POWER.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Biomechanics Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Biomechanics
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BIOMECHANICS.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Progress Photo Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Progress Photo
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_PROGRESS_PHOTO.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Senior Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Senior
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-125">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_SENIOR.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="text"
                                  value={metricsData[row.id]?.days ?? ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                                  }}
                                  placeholder="—"
                                  className="w-20 md:w-24 h-8.5 md:h-9.5 text-center border border-gray-300 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                                />
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <input
                                  type="checkbox"
                                  checked={metricsData[row.id]?.show ?? false}
                                  onChange={() => {
                                    setMetricsData(prev => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
                                  }}
                                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'testing' && (
                <div className="space-y-8">
                  {/* Basic Data Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Basic Data
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BASIC.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Internal Health Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Internal Health
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_HEALTH.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Body Composition Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Body Composition
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BODY_COMPOSITION.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cardiovascular Capacity Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Cardiovascular Capacity
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_CARDIO.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Strength Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Strength
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_STRENGTH.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Power Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Power
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_POWER.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Biomechanics Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Biomechanics
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BIOMECHANICS.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Progress Photo Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Progress Photo
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_PROGRESS_PHOTO.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Senior Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Senior
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-175">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
                            {TESTING_COLUMNS.map(col => (
                              <th key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                <button className="px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 uppercase tracking-wider whitespace-nowrap">
                                  {col.label}
                                </button>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_SENIOR.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              {TESTING_COLUMNS.map(col => (
                                <td key={col.id} className="py-3 md:py-4 px-3 md:px-6 text-center">
                                  <input
                                    type="checkbox"
                                    checked={testingData[row.id]?.[col.id] ?? false}
                                    onChange={() => {
                                      setTestingData(prev => ({
                                        ...prev,
                                        [row.id]: {
                                          ...prev[row.id],
                                          [col.id]: !prev[row.id]?.[col.id]
                                        }
                                      }));
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'results' && (
                <div className="space-y-8">
                  {/* Basic Data Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Basic Data
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BASIC.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Internal Health Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Internal Health
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_HEALTH.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Body Composition Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Body Composition
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BODY_COMPOSITION.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Cardiovascular Capacity Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Cardiovascular Capacity
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_CARDIO.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Strength Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Strength
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_STRENGTH.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Power Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Power
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_POWER.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Biomechanics Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Biomechanics
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_BIOMECHANICS.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Progress Photo Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Progress Photo
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_PROGRESS_PHOTO.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Senior Section */}
                  <div>
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Senior
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-150">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
                            <th className="py-3 md:py-4 px-3 md:px-6 text-[12px] md:text-[13px] font-semibold text-gray-600">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {METRICS_SENIOR.map((row) => (
                            <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-800 font-medium align-top pt-4 md:pt-6">{row.label}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="relative">
                                  <textarea
                                    value={resultsData[row.id] ?? ''}
                                    onChange={(e) => {
                                      setResultsData(prev => ({ ...prev, [row.id]: e.target.value }));
                                    }}
                                    placeholder="Enter interpretation here..."
                                    rows={4}
                                    className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                                  />
                                  <div className="text-[10px] md:text-[11px] text-gray-400 mt-1 text-right">
                                    {(resultsData[row.id] ?? '').length} / 1500
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ BRANDING TAB ============ */}
              {settingsTab === 'branding' && (
                <div className="space-y-10">
                  {/* Primary Color */}
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">Primary Color</h3>
                    <p className="text-[13px] text-gray-500 mb-4">Sets the main accent color for the account.</p>
                    <div className="flex items-center gap-4">
                      <div className="w-20 md:w-25 h-11 md:h-13 rounded-lg border border-gray-200 bg-white p-1.5 md:p-2 shadow-sm">
                        <div className="w-full h-full rounded-md" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 rounded-full border border-gray-200" style={{ backgroundColor: primaryColor }} />
                        <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-11 md:h-13 pl-9 md:pl-11 pr-3 md:pr-4 w-37.5 md:w-45 border border-gray-200 rounded-lg text-[13px] md:text-[14px] font-medium text-gray-800 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Account Logo */}
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">Account Logo</h3>
                    <p className="text-[13px] text-gray-500 mb-4">
                      Upload your account logo. Max 5MB (PNG, JPG, GIF recommended).
                    </p>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        title="Click to change logo"
                        className="w-full max-w-75 md:w-100 h-35 md:h-45 flex items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-[#1a73e8] hover:bg-blue-50/30 transition group relative overflow-hidden"
                      >
                        <img
                          src={accountLogo || '/logo.jpeg'}
                          alt="Account logo"
                          className="max-w-[90%] max-h-[90%] object-contain"
                          onError={() => setLogoError(true)}
                        />
                        
                        <span className="absolute inset-0 bg-black/40 text-white text-[13px] font-medium flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          Click to change logo
                        </span>
                      </button>

                      {accountLogo && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeAccountLogo(); }}
                          title="Remove logo"
                          className="absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition"
                        >
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                          </svg>
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
                      <input type="checkbox" checked={integrations.inbody.enabled} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, enabled: e.target.checked } })} className="w-4.5 h-4.5 rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Username</label>
                        <input type="text" value={integrations.inbody.apiUsername} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, apiUsername: e.target.value } })} className="w-full h-11 md:h-12 px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Key</label>
                        <input type="text" value={integrations.inbody.apiKey} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, apiKey: e.target.value } })} className="w-full h-11 md:h-12 px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">Evolt</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.evolt.enabled} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, enabled: e.target.checked } })} className="w-4.5 h-4.5 rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Client ID</label>
                        <input type="text" value={integrations.evolt.clientId} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, clientId: e.target.value } })} className="w-full h-11 md:h-12 px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Client Secret</label>
                        <input type="text" value={integrations.evolt.clientSecret} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, clientSecret: e.target.value } })} className="w-full h-11 md:h-12 px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">Styku</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.styku.enabled} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, enabled: e.target.checked } })} className="w-4.5 h-4.5 rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Key</label>
                        <input type="text" value={integrations.styku.apiKey} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, apiKey: e.target.value } })} className="w-full h-11 md:h-12 px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Secret</label>
                        <input type="text" value={integrations.styku.apiSecret} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, apiSecret: e.target.value } })} className="w-full h-11 md:h-12 px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Body Fat Method</label>
                        <div className="relative">
                          <select value={integrations.styku.bodyFatMethod} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, bodyFatMethod: e.target.value } })} className="w-full h-11 md:h-12 px-4 border border-gray-200 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
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
                          <select value={integrations.styku.circumferenceMeasurement} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, circumferenceMeasurement: e.target.value } })} className="w-full h-11 md:h-12 px-4 border border-gray-200 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
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

              {(settingsTab === 'privileges' || settingsTab === 'metrics' || settingsTab === 'testing' || settingsTab === 'results' || settingsTab === 'branding' || settingsTab === 'integrations') && (
                <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                  <button type="button" onClick={handleSaveSettings} disabled={!isAdmin && settingsTab === 'privileges'} className="px-4 md:px-6 h-11 text-[14px] font-semibold text-white bg-[#1a4db8] hover:bg-[#15409b] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">Save settings</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ============== REUSABLE ==============

function NavLink({ href, label, icon, active = false, onClick, badge = 0 }: { href: string; label: string; icon: React.ReactNode; active?: boolean; onClick?: (e: any) => void; badge?: number; }) {
  return (
    <Link href={href} onClick={onClick} className={`relative flex items-center gap-3 px-3 py-2.5 text-[13.5px] rounded-md ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
      {active && (<span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.75 bg-[#1a73e8] rounded-r"></span>)}
      <span className="text-gray-500">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && <span className="min-w-4.5 h-4.5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">{badge > 99 ? '99+' : badge}</span>}
    </Link>
  );
}

function StatCard({ number, label }: { number: number; label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 md:px-6 py-4 md:py-5">
      <div className="flex items-baseline gap-2 md:gap-3">
        <span className="text-2xl md:text-3xl font-bold text-gray-900">{number}</span>
        <span className="text-[13px] md:text-[15px] text-gray-700 font-medium">{label}</span>
      </div>
    </div>
  );
}

function FilterButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-[13px] md:text-sm border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 bg-white font-medium w-full md:w-auto justify-between md:justify-start">
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        {label}
      </div>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </button>
  );
}

function StatusBadge({ status }: { status: 'OPEN' | 'COMPLETED' | 'OVERDUE' }) {
  const map = {
    OPEN: 'bg-blue-50 text-blue-700 border-blue-100',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    OVERDUE: 'bg-red-50 text-red-700 border-red-100',
  } as const;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${map[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function CalendarView({ events }: { events: ApiEvent[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ day: number | null; events: ApiEvent[] }> = [];

  for (let i = 0; i < startDay; i++) cells.push({ day: null, events: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvents = events.filter((e) => {
      if (!e.date) return false;
      const dt = new Date(e.date);
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d;
    });
    cells.push({ day: d, events: dayEvents });
  }

  return (
    <div className="px-4 md:px-6 pb-6">
      <div className="grid grid-cols-7 gap-1 text-[9px] md:text-[10px] font-semibold text-gray-400 uppercase mb-2">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="text-center py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => (
          <div key={i} className={`min-h-12.5 md:min-h-15 rounded-md border ${c.day ? 'border-gray-100 bg-white' : 'border-transparent'} p-1`}>
            {c.day && (
              <>
                <div className="text-[10px] md:text-[11px] text-gray-600 font-medium">{c.day}</div>
                {c.events.slice(0, 2).map((e) => (
                  <div key={e.id} className="mt-0.5 text-[8px] md:text-[9px] bg-blue-50 text-blue-700 rounded px-1 truncate">
                    {e.title}
                  </div>
                ))}
                {c.events.length > 2 && (
                  <div className="text-[8px] md:text-[9px] text-gray-400">+{c.events.length - 2}</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function IconDashboard() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>; }
function IconTask() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>; }
function IconCalendar() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>; }
function IconMessage() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; }
function IconProfiles() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function IconUser() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>; }
function IconGroup() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; }
function IconBook() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>; }
function IconBolt() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>; }
function IconActivity() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 12h3l3-9 4 18 3-9h5" /></svg>; }
function IconForm() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function IconChart() { return <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>; }