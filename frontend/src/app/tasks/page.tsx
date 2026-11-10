'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, FormEvent, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = 'http://localhost:4000';

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

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>}>
      <TasksPageInner />
    </Suspense>
  );
}

function TasksPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [openSections, setOpenSections] = useState({
    home: true,
    organization: true,
    library: true,
    analytics: true,
  });

  const [view, setView] = useState<'tasks' | 'account-info' | 'account-settings'>('tasks');

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [unreadConversations, setUnreadConversations] = useState<any[]>([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deleteModalTask, setDeleteModalTask] = useState<any | null>(null);

  // ✅ sub-screen (not a modal) — clicking sidebar "Tasks" clears this
  const [viewingTask, setViewingTask] = useState<any | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    priority: 'NORMAL',
    description: '',
    assignees: [] as string[],
    profiles: [] as string[],
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const [assigneesOpen, setAssigneesOpen] = useState(false);
  const [profilesOpen, setProfilesOpen] = useState(false);
  const assigneesRef = useRef<HTMLDivElement>(null);
  const profilesRef = useRef<HTMLDivElement>(null);

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const [userFilter, setUserFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [userFilterOpen, setUserFilterOpen] = useState(false);
  const [groupFilterOpen, setGroupFilterOpen] = useState(false);
  const userFilterRef = useRef<HTMLDivElement>(null);
  const groupFilterRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [tasks, setTasks] = useState<any[]>([]);
  const [openActionsFor, setOpenActionsFor] = useState<string | null>(null);

  const [staffOptions, setStaffOptions] = useState<{ id: string; name: string }[]>([]);
  const [profileOptions, setProfileOptions] = useState<{ id: string; name: string }[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);

  const [activeTab, setActiveTab] = useState<'user' | 'business'>('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/');
      return;
    }

    let parsedUser: any = {};
    try { parsedUser = JSON.parse(storedUser); } catch { router.push('/'); return; }

    const safeName = parsedUser.name || `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || parsedUser.email || 'User';
    const safeUser = { ...parsedUser, name: safeName };
    setUser(safeUser);

    const parts = safeName.split(/\s+/).filter(Boolean);
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setEmail(parsedUser.email || '');

    const storedPhoto = localStorage.getItem('profile_photo');
    if (storedPhoto) setProfilePhoto(storedPhoto);

    const storedSettings = localStorage.getItem('account_settings');
    if (storedSettings) {
      try {
        const s = JSON.parse(storedSettings);
        if (s.primaryColor) setPrimaryColor(s.primaryColor);
        if (s.accountLogo) setAccountLogo(s.accountLogo);
        if (s.integrations) {
          setIntegrations((prev) => ({ ...prev, ...s.integrations, styku: { ...prev.styku, ...(s.integrations.styku || {}) } }));
        }
        if (s.privileges) setPrivileges((prev) => ({ ...prev, ...s.privileges }));
        if (s.measurementSystem) setMeasurementSystem(s.measurementSystem);
        if (s.metricsData) setMetricsData((prev) => ({ ...prev, ...s.metricsData }));
        if (s.testingData) setTestingData((prev) => ({ ...prev, ...s.testingData }));
        if (s.resultsData) setResultsData((prev) => ({ ...prev, ...s.resultsData }));
      } catch {}
    }

    const storedBiz = localStorage.getItem('business_info');
    if (storedBiz) {
      try {
        const b = JSON.parse(storedBiz);
        setCompanyName(b.companyName || ''); setPhone(b.phone || ''); setAddress(b.address || '');
        setCity(b.city || ''); setStateName(b.state || ''); setZipCode(b.zipCode || ''); setWebsite(b.website || '');
      } catch {}
    }

    fetchData(token);
  }, [router]);

  useEffect(() => {
    if (loading || tasks.length === 0) return;
    const highlight = searchParams?.get('highlight');
    if (!highlight) return;
    const idx = tasks.findIndex((t) => t.id === highlight);
    if (idx >= 0) {
      setViewingTask(tasks[idx]);
      setCurrentPage(Math.floor(idx / itemsPerPage) + 1);
    }
  }, [loading, tasks.length, searchParams]);

  const fetchData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [tasksRes, staffRes, profilesRes, groupsRes, messagesRes] = await Promise.all([
        fetch(`${API_URL}/tasks`, { headers }),
        fetch(`${API_URL}/auth/users`, { headers }),
        fetch(`${API_URL}/profiles`, { headers }),
        fetch(`${API_URL}/groups`, { headers }),
        fetch(`${API_URL}/messages`, { headers })
      ]);

      if (tasksRes.ok) { const d = await tasksRes.json(); setTasks(Array.isArray(d) ? d : []); }
      if (staffRes.ok) {
        const d = await staffRes.json();
        setStaffOptions((Array.isArray(d) ? d : []).map((u: any) => ({ id: u.id, name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email })));
      }
      if (profilesRes.ok) {
        const d = await profilesRes.json();
        setProfileOptions((Array.isArray(d) ? d : []).map((p: any) => ({ id: p.id, name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || 'Unnamed' })));
      }
      if (groupsRes.ok) {
        const d = await groupsRes.json();
        setGroups((Array.isArray(d) ? d : []).map((g: any) => ({ id: g.id, name: g.name || 'Unnamed group' })));
      }
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setUnreadConversations(messagesData.filter((c: any) => c.unread === true));
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivileges = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/privileges`, { headers: { Authorization: `Bearer ${token}` } });
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

  useEffect(() => {
    if (loading || !user) return;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) fetchPrivileges(token);
  }, [loading, user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(t)) setStatusDropdownOpen(false);
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(t)) setTypeDropdownOpen(false);
      if (assigneesRef.current && !assigneesRef.current.contains(t)) setAssigneesOpen(false);
      if (profilesRef.current && !profilesRef.current.contains(t)) setProfilesOpen(false);
      if (accountMenuRef.current && !accountMenuRef.current.contains(t)) setAccountMenuOpen(false);
      if (userFilterRef.current && !userFilterRef.current.contains(t)) setUserFilterOpen(false);
      if (groupFilterRef.current && !groupFilterRef.current.contains(t)) setGroupFilterOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(t)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const anyModalOpen = createModalOpen || openActionsFor !== null || !!deleteModalTask || isSidebarOpen;
    document.body.style.overflow = anyModalOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [createModalOpen, openActionsFor, deleteModalTask, isSidebarOpen]);

  useEffect(() => {
    if (toast) { const timer = setTimeout(() => setToast(null), 3000); return () => clearTimeout(timer); }
  }, [toast]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(/[.\s+_-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('user'); localStorage.removeItem('token');
    sessionStorage.removeItem('user'); sessionStorage.removeItem('token');
    router.push('/');
  };

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ✅ SIDEBAR "Tasks" navigates back to the main tasks list
  const goToTasks = () => {
    setAccountMenuOpen(false);
    setIsSidebarOpen(false);
    setViewingTask(null);
    setView('tasks');
    setOpenActionsFor(null);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
    setCurrentPage(1);
  };

  const clearTypes = () => { setSelectedTypes([]); setCurrentPage(1); };

  const closeModal = () => {
    setCreateModalOpen(false); setEditingTaskId(null);
    setFormData({ title: '', type: '', priority: 'NORMAL', description: '', assignees: [], profiles: [], dueDate: '' });
    setValidationErrors({}); setAssigneesOpen(false); setProfilesOpen(false);
  };

  const toggleAssignee = (staffId: string) => {
    setFormData((prev) => ({ ...prev, assignees: prev.assignees.includes(staffId) ? prev.assignees.filter((s) => s !== staffId) : [...prev.assignees, staffId] }));
    if (validationErrors.assignees) setValidationErrors({ ...validationErrors, assignees: '' });
  };

  const removeAssignee = (staffId: string) => setFormData((prev) => ({ ...prev, assignees: prev.assignees.filter((s) => s !== staffId) }));

  const toggleProfile = (profileId: string) => {
    setFormData((prev) => ({ ...prev, profiles: prev.profiles.includes(profileId) ? prev.profiles.filter((p) => p !== profileId) : [...prev.profiles, profileId] }));
    if (validationErrors.profiles) setValidationErrors({ ...validationErrors, profiles: '' });
  };

  const removeProfile = (profileId: string) => setFormData((prev) => ({ ...prev, profiles: prev.profiles.filter((p) => p !== profileId) }));

  const handleSaveTask = async (e: FormEvent) => {
    e.preventDefault();
    const errs: { [key: string]: string } = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.type) errs.type = 'Type is required';
    if (formData.assignees.length === 0) errs.assignees = 'Assignees is required';
    if (formData.profiles.length === 0) errs.profiles = 'Profile is required';
    if (!formData.dueDate) errs.dueDate = 'Due Date is required';
    if (Object.keys(errs).length > 0) { setValidationErrors(errs); return; }

    setValidationErrors({}); setSaving(true);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const payload = {
      title: formData.title,
      type: formData.type.toUpperCase(),
      priority: formData.priority.toUpperCase(),
      description: formData.description,
      assignees: formData.assignees,
      profiles: formData.profiles,
      dueDate: new Date(formData.dueDate).toISOString(),
    };

    try {
      const url = editingTaskId ? `${API_URL}/tasks/${editingTaskId}` : `${API_URL}/tasks`;
      const method = editingTaskId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.message || 'Failed to save task'); }
      setToast({ message: editingTaskId ? 'Task updated successfully' : 'Task created successfully', type: 'success' });
      closeModal();
      fetchData(token as string);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCompleted = async (taskId: string) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'COMPLETED', completedDate: new Date().toISOString() }),
      });
      if (res.ok) {
        setToast({ message: 'Task marked as completed', type: 'success' });
        await fetchData(token as string);
        setViewingTask((prev: any) => prev && prev.id === taskId ? { ...prev, status: 'COMPLETED', completedDate: new Date().toISOString() } : prev);
      }
    } catch { setToast({ message: 'Failed to update task', type: 'error' }); }
    setOpenActionsFor(null);
  };

  const handleReopen = async (taskId: string) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'OPEN', completedDate: null }),
      });
      if (res.ok) {
        setToast({ message: 'Task reopened', type: 'success' });
        await fetchData(token as string);
        setViewingTask((prev: any) => prev && prev.id === taskId ? { ...prev, status: 'OPEN', completedDate: null } : prev);
      }
    } catch { setToast({ message: 'Failed to reopen task', type: 'error' }); }
    setOpenActionsFor(null);
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTaskId(taskId);
      setFormData({
        title: task.title || '',
        type: task.type ? task.type.charAt(0) + task.type.slice(1).toLowerCase() : '',
        priority: task.priority || 'NORMAL',
        description: task.description || '',
        assignees: task.assignees || [],
        profiles: task.profiles || [],
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
      setOpenActionsFor(null);
      setCreateModalOpen(true);
    }
  };

  const openDeleteConfirm = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) { setDeleteModalTask(task); setOpenActionsFor(null); }
  };

  const handleViewTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) { setViewingTask(task); setOpenActionsFor(null); }
  };

  const confirmDeleteTask = async () => {
    if (deleteModalTask) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const res = await fetch(`${API_URL}/tasks/${deleteModalTask.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setToast({ message: 'Task deleted successfully', type: 'success' });
          if (viewingTask && viewingTask.id === deleteModalTask.id) setViewingTask(null);
          setDeleteModalTask(null);
          fetchData(token as string);
        }
      } catch { setToast({ message: 'Failed to delete task', type: 'error' }); }
    }
  };

  const handleSaveAccountInfo = async () => {
    const errs: { [key: string]: string } = {};
    if (activeTab === 'user') {
      if (!firstName.trim()) errs.firstName = 'First name is required';
      if (!lastName.trim()) errs.lastName = 'Last name is required';
      if (!email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
      if (newPassword && newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
      if (newPassword && newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (Object.keys(errs).length > 0) { setErrors(errs); setToast({ message: 'Please fix the highlighted fields', type: 'error' }); return; }
      setErrors({}); setSavingInfo(true);
      await new Promise((r) => setTimeout(r, 400));
      const updatedUser = { ...(user as any), name: `${firstName} ${lastName}`.trim(), email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (newPassword) localStorage.setItem('user_password', newPassword);
      setNewPassword(''); setConfirmPassword(''); setSavingInfo(false);
      setToast({ message: 'User info saved successfully', type: 'success' });
    } else {
      localStorage.setItem('business_info', JSON.stringify({
        companyName: companyName.trim(), phone: phone.trim(), address: address.trim(),
        city: city.trim(), state: stateName.trim(), zipCode: zipCode.trim(), website: website.trim(),
      }));
      setSavingInfo(false);
      setToast({ message: 'Business info saved successfully', type: 'success' });
    }
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfilePhoto(dataUrl);
      localStorage.setItem('profile_photo', dataUrl);
      setToast({ message: 'Profile photo updated', type: 'success' });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setToast({ message: 'Logo too large. Max 5MB.', type: 'error' }); e.target.value = ''; return; }
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
    reader.readAsDataURL(file);
    e.target.value = '';
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
    }));

    if (user?.role !== 'ADMIN') {
      setToast({ message: 'Settings saved', type: 'success' });
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

      setToast({ message: 'Privileges saved', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to save privileges', type: 'error' });
    }
  };

  const handleTogglePrivilege = (rowId: string, role: 'admin' | 'supervisor' | 'staff') => {
    setPrivileges((prev) => {
      const currentRow = prev[rowId];
      const newRow = { ...currentRow };

      if (role === 'admin') {
        newRow.admin = !currentRow.admin;
        if (!newRow.admin) {
          newRow.supervisor = false;
          newRow.staff = false;
          setToast({ message: 'Privilege removed for all roles', type: 'success' });
        } else {
          setToast({ message: 'Privilege added for Admin', type: 'success' });
        }
      } else {
        newRow[role] = !currentRow[role];
        if (newRow[role]) {
          setToast({ message: `Privilege added for ${role}`, type: 'success' });
        } else {
          setToast({ message: `Privilege removed for ${role}`, type: 'success' });
        }
      }

      return { ...prev, [rowId]: newRow };
    });
  };

  const can = (key: string): boolean => {
    if (!user) return false;
    const roleKey = (user.role || '').toLowerCase() as 'admin' | 'supervisor' | 'staff';
    return privileges?.[key]?.[roleKey] === true;
  };

  const filteredTasks = useMemo(() => {
    const statusMatch = (t: any) => (selectedStatus === 'Status' || selectedStatus === 'All' ? true : t.status === selectedStatus.toUpperCase());
    const typeMatch = (t: any) => {
      if (selectedTypes.length === 0) return true;
      const label = t.type ? t.type.charAt(0) + t.type.slice(1).toLowerCase() : '';
      return selectedTypes.includes(label);
    };
    const searchMatch = (t: any) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    };
    const userMatch = (t: any) => (userFilter === 'all' ? true : Array.isArray(t.assignees) && t.assignees.includes(userFilter));
    const groupMatch = (t: any) => (groupFilter === 'all' ? true : Array.isArray(t.profiles) && t.profiles.includes(groupFilter));
    return tasks.filter(statusMatch).filter(typeMatch).filter(searchMatch).filter(userMatch).filter(groupMatch);
  }, [tasks, selectedStatus, selectedTypes, searchQuery, userFilter, groupFilter]);

  const totalItems = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

  if (loading || !user) {
    return <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;
  }

  const actionTask = openActionsFor ? tasks.find((t) => t.id === openActionsFor) : null;
  const actionIsCompleted = actionTask?.status === 'COMPLETED';
  const unreadCount = unreadConversations.length;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#f5f6f8]">

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden bg-amber-600">
            {accountLogo ? (
              <img src={accountLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : !logoError ? (
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" onError={() => setLogoError(true)} />
            ) : (
              <span className="text-white text-sm font-bold">{getInitials(user.name)}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button className="hidden lg:block text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4v16M15 4v16" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3">
          <div className="mb-2">
            <button onClick={() => toggleSection('home')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">
              Home
              <svg className={`w-3 h-3 transition-transform ${openSections.home ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openSections.home && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/dashboard" label="Dashboard" icon={<IconDashboard />} />
                {/* ✅ Tasks link clears sub-screen and goes back to main tasks list */}
                <NavLink
                  href="/tasks"
                  label="Tasks"
                  active={view === 'tasks' && !viewingTask}
                  icon={<IconTask />}
                  onClick={(e: any) => { e.preventDefault(); goToTasks(); }}
                />
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

      <div className="lg:ml-64 flex flex-col h-screen">
        <header className="bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="text-gray-500 hover:text-gray-700 relative p-1 rounded-full hover:bg-gray-100 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">{unreadCount}</span>}
              </button>

              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-3 w-[290px] sm:w-[340px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
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
              <button onClick={() => setAccountMenuOpen(!accountMenuOpen)} className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-1.5 sm:px-2 py-1 transition">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold overflow-hidden">
                  {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : getInitials(user.name)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
                  <p className="text-[11px] text-gray-500 leading-none mt-1">{user.role}</p>
                </div>
              </button>

              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-[280px] sm:w-[320px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-[15px] font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[12.5px] text-gray-500 mt-0.5">{user.role}</p>
                  </div>
                  <div className="py-2">
                    <button onClick={() => { setAccountMenuOpen(false); goToTasks(); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" /></svg><span>Switch to Classic</span>
                    </button>
                    <button onClick={() => { setAccountMenuOpen(false); setView('account-info'); setViewingTask(null); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span>Account Info</span>
                    </button>
                    <button onClick={() => { setAccountMenuOpen(false); setView('account-settings'); setViewingTask(null); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span>Account Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-2">
                    <button onClick={() => { setAccountMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-red-600 hover:bg-red-50 transition text-left">
                      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg><span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================= TASKS LIST VIEW ================= */}
        {view === 'tasks' && !viewingTask && (
          <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto bg-[#f7f8fa]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Tasks</h1>
                <p className="text-sm text-gray-500">Track and manage your daily tasks.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative" ref={groupFilterRef}>
                  <button onClick={() => setGroupFilterOpen((v) => !v)} className="flex items-center justify-between sm:justify-start gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 bg-white font-medium w-full sm:w-auto">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      {groupFilter === 'all' ? 'All Groups' : groups.find((g) => g.id === groupFilter)?.name || 'All Groups'}
                    </div>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {groupFilterOpen && (
                    <div className="absolute right-0 sm:right-0 mt-2 w-full sm:w-56 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                      <button onClick={() => { setGroupFilter('all'); setGroupFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${groupFilter === 'all' ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>All Groups</button>
                      {groups.map((g) => (
                        <button key={g.id} onClick={() => { setGroupFilter(g.id); setGroupFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${groupFilter === g.id ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>{g.name}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative" ref={userFilterRef}>
                  <button onClick={() => setUserFilterOpen((v) => !v)} className="flex items-center justify-between sm:justify-start gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 bg-white font-medium w-full sm:w-auto">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      {userFilter === 'all' ? 'All Users' : staffOptions.find((s) => s.id === userFilter)?.name || 'All Users'}
                    </div>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {userFilterOpen && (
                    <div className="absolute right-0 mt-2 w-full sm:w-64 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                      <button onClick={() => { setUserFilter('all'); setUserFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${userFilter === 'all' ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>All Users</button>
                      {staffOptions.map((s) => (
                        <button key={s.id} onClick={() => { setUserFilter(s.id); setUserFilterOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${userFilter === s.id ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>{s.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-5 gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">All Tasks</h2>
                <button onClick={() => { setEditingTaskId(null); setFormData({ title: '', type: '', priority: 'NORMAL', description: '', assignees: [], profiles: [], dueDate: '' }); setCreateModalOpen(true); }} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm w-full sm:w-auto">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Create task
                </button>
              </div>

              <div className="px-4 sm:px-6 pb-4 sm:pb-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative" ref={statusDropdownRef}>
                    <button onClick={() => setStatusDropdownOpen(!statusDropdownOpen)} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      {selectedStatus}
                      <svg className={`w-3.5 h-3.5 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {statusDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                        {['All', 'Open', 'Completed', 'Overdue'].map((s) => (
                          <button key={s} onClick={() => { setSelectedStatus(s); setStatusDropdownOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedStatus === s ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>
                            {s}
                            {selectedStatus === s && (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={typeDropdownRef}>
                    <button onClick={() => setTypeDropdownOpen(!typeDropdownOpen)} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      Type {selectedTypes.length > 0 ? `(${selectedTypes.length})` : ''}
                      <svg className={`w-3.5 h-3.5 transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {typeDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
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

                <div className="relative flex-1 min-w-[140px] w-full sm:max-w-md">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-full w-full outline-none focus:border-blue-500" />
                </div>

                <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-gray-200 rounded-md px-3 py-2 outline-none bg-white font-medium w-full sm:w-auto">
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="overflow-x-auto -mx-0">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/40">
                      <th className="px-3 sm:px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Task Name</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Status</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Task Type</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Profile</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Task Date</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Completed Date</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Completed By</th>
                      <th className="px-3 sm:px-6 py-3 font-medium text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr><td colSpan={9} className="px-6 py-16 text-center text-gray-400 text-sm">No tasks yet.</td></tr>
                    ) : (
                      filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((t: any) => (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-gray-800">
                            <button onClick={() => handleViewTask(t.id)} className="hover:text-[#1a73e8] hover:underline text-left">{t.title}</button>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : t.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {t.status === 'COMPLETED' ? 'Completed' : t.status === 'OVERDUE' ? 'Overdue' : 'Open'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{t.type ? t.type.charAt(0) + t.type.slice(1).toLowerCase() : '—'}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 max-w-[160px] truncate">{t.profiles?.length > 0 ? `${t.profiles.length} profile(s)` : '—'}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{t.completedDate ? new Date(t.completedDate).toLocaleDateString() : '—'}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 max-w-[160px] truncate">{t.assignees?.length > 0 ? `${t.assignees.length} staff` : '—'}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button onClick={() => handleViewTask(t.id)} className="text-[#1a73e8] text-xs font-medium hover:underline px-2">View</button>
                              <button onClick={() => setOpenActionsFor(t.id)} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition inline-flex">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 border-t border-gray-100 gap-3">
                <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-700">{startItem}–{endItem}</span> of <span className="font-semibold text-gray-700">{totalItems}</span></p>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center gap-1 px-3 sm:px-4 py-2 text-sm rounded-lg border transition ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    Previous
                  </button>
                  <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages} className={`flex items-center gap-1 px-3 sm:px-4 py-2 text-sm rounded-lg border transition ${currentPage >= totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
                    Next
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TASK DETAILS SUB-SCREEN ================= */}
        {view === 'tasks' && viewingTask && (
          <div className="flex-1 overflow-y-auto bg-[#f7f8fa]">
            <div className="bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-2.5 flex items-center gap-2">
              <button
                onClick={() => setViewingTask(null)}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Tasks
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-[13px] text-gray-500 truncate max-w-[60%]">{viewingTask.title}</span>
            </div>

            <div className="px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
              <div className="max-w-[1100px] mx-auto space-y-4 sm:space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-1">Task Details</p>
                      <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-gray-900 break-words leading-tight">
                        {viewingTask.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${viewingTask.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : viewingTask.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                          }`}>
                          {viewingTask.status === 'COMPLETED' ? 'Completed' : viewingTask.status === 'OVERDUE' ? 'Overdue' : 'Open'}
                        </span>
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                          Priority: {(viewingTask.priority || 'normal').toLowerCase()}
                        </span>
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
                          {(viewingTask.type || '—').toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full lg:w-auto">
                      <button
                        onClick={() => handleEditTask(viewingTask.id)}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        Edit task
                      </button>
                      {viewingTask.status === 'COMPLETED' ? (
                        <button
                          onClick={() => handleReopen(viewingTask.id)}
                          className="px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
                        >
                          Reopen task
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkCompleted(viewingTask.id)}
                          className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition"
                        >
                          Mark as completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
                  <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Due date</p>
                      <p className="text-sm text-gray-800">
                        {viewingTask.dueDate ? new Date(viewingTask.dueDate).toLocaleString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Completed date</p>
                      <p className="text-sm text-gray-800">
                        {viewingTask.completedDate ? new Date(viewingTask.completedDate).toLocaleString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Created</p>
                      <p className="text-sm text-gray-800">
                        {viewingTask.createdAt ? new Date(viewingTask.createdAt).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>

                  {viewingTask.description && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingTask.description}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      Assignees
                    </h3>
                    {viewingTask.assignees && viewingTask.assignees.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {viewingTask.assignees.map((id: string) => {
                          const s = staffOptions.find((x) => x.id === id);
                          return (
                            <span key={id} className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-md">
                              {s?.name || 'Unknown user'}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">None</p>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
                    <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Profiles
                    </h3>
                    {viewingTask.profiles && viewingTask.profiles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {viewingTask.profiles.map((id: string) => {
                          const p = profileOptions.find((x) => x.id === id);
                          return (
                            <span key={id} className="inline-flex items-center bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1.5 rounded-md">
                              {p?.name || 'Unknown profile'}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">None</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'account-info' && (
          <div className="flex-1 overflow-y-auto bg-[#f7f8fa]">
            <div className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6">
              <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-tight mb-1">Account Info</h1>
              <p className="text-[13.5px] text-gray-500">Manage your personal profile and business details.</p>
            </div>
            <div className="px-4 sm:px-6 lg:px-10 pb-10">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-4 sm:px-8 pt-6 pb-5 border-b border-gray-100 overflow-x-auto">
                  <div className="inline-flex items-center gap-1 bg-gray-100 rounded-full p-1 min-w-max">
                    <button onClick={() => { setActiveTab('user'); setErrors({}); }} className={`px-4 sm:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeTab === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>User Info</button>
                    <button onClick={() => { setActiveTab('business'); setErrors({}); }} className={`px-4 sm:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeTab === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Business Info</button>
                  </div>
                </div>

                {activeTab === 'user' && (
                  <div className="p-4 sm:p-6 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-10">
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
                        <div className="border border-gray-200 rounded-2xl p-4 sm:p-6">
                          <p className="text-[11px] font-bold text-gray-500 tracking-[0.12em] uppercase mb-5">Change password — leave blank to keep current</p>
                          <div className="space-y-5">
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">New password</label>
                              <div className="relative">
                                <input type={showNewPassword ? 'text' : 'password'} placeholder="Min 8 chars, upper, lower, number, special" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full h-[48px] px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${errors.newPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                              </div>
                              {errors.newPassword && <p className="text-xs text-red-500 mt-1.5">{errors.newPassword}</p>}
                            </div>
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Confirm new password</label>
                              <div className="relative">
                                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full h-[48px] px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                              </div>
                              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword}</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-start pt-2">
                        <p className="text-[14px] font-semibold text-gray-800 mb-5">Profile Photo</p>
                        <input ref={profileInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleProfilePhotoUpload} className="hidden" />
                        <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full bg-gray-200 flex items-center justify-center mb-6 overflow-hidden">
                          {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-[42px] font-semibold text-gray-600">{getInitials(user.name)}</span>}
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2 mb-2 w-full sm:w-auto">
                          <button type="button" onClick={() => profileInputRef.current?.click()} className="px-6 h-[42px] border border-gray-300 rounded-full bg-white hover:bg-gray-50 text-[14px] font-medium text-gray-700 transition w-full sm:w-auto">Change photo</button>
                          {profilePhoto && <button type="button" onClick={() => { setProfilePhoto(null); localStorage.removeItem('profile_photo'); }} className="px-4 h-[42px] border border-red-200 rounded-full bg-white hover:bg-red-50 text-[14px] font-medium text-red-600 transition w-full sm:w-auto">Remove</button>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={goToTasks} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white w-full sm:w-auto">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={savingInfo} className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition w-full sm:w-auto ${savingInfo ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{savingInfo ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}

                {activeTab === 'business' && (
                  <div className="p-4 sm:p-6 lg:p-10">
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
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={goToTasks} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white w-full sm:w-auto">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={savingInfo} className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition w-full sm:w-auto ${savingInfo ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{savingInfo ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'account-settings' && (
          <div className="flex-1 overflow-y-auto bg-[#f7f8fa]">
            <div className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6">
              <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-tight mb-1">Account Settings</h1>
              <p className="text-[13.5px] text-gray-500">Manage branding, metrics, testing, integrations, and system configuration.</p>
            </div>

            <div className="px-4 sm:px-6 lg:px-10 pb-6 overflow-x-auto">
              <div className="inline-flex items-center gap-1 bg-[#eef1f7] rounded-full p-1.5 min-w-max">
                {(['privileges', 'metrics', 'testing', 'results', 'branding', 'integrations'] as const).map((tab) => (
                  <button key={tab} onClick={() => setSettingsTab(tab)} className={`px-3 sm:px-5 py-1.5 sm:py-2 text-[12px] sm:text-[14px] font-medium rounded-full transition capitalize ${settingsTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
                ))}
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-10 pb-10 max-w-[1400px]">
              {settingsTab === 'privileges' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-2">Privileges</h3>
                  <p className="text-[13px] text-gray-500 mb-6">
                    Manage role-based permissions for account members.
                    {!isAdmin && <span className="ml-1 text-amber-600">(Only ADMIN can change these.)</span>}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[560px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 sm:py-4 px-2 sm:px-4 text-[12px] sm:text-[13px] font-semibold text-gray-600 w-1/2">Privilege</th>
                          <th className="py-3 sm:py-4 px-2 sm:px-4 text-[12px] sm:text-[13px] font-semibold text-gray-600 text-center">Admin</th>
                          <th className="py-3 sm:py-4 px-2 sm:px-4 text-[12px] sm:text-[13px] font-semibold text-gray-600 text-center">Supervisor</th>
                          <th className="py-3 sm:py-4 px-2 sm:px-4 text-[12px] sm:text-[13px] font-semibold text-gray-600 text-center">Staff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PRIVILEGE_ROWS.map((row) => (
                          <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-[13px] sm:text-[14px] text-gray-800 font-medium">{row.label}</td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-center"><input type="checkbox" checked={privileges[row.id]?.admin ?? true} onChange={() => handleTogglePrivilege(row.id, 'admin')} disabled={!isAdmin} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" /></td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-center"><input type="checkbox" checked={privileges[row.id]?.supervisor ?? true} onChange={() => handleTogglePrivilege(row.id, 'supervisor')} disabled={!isAdmin || !privileges[row.id]?.admin} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" /></td>
                            <td className="py-3 sm:py-4 px-2 sm:px-4 text-center"><input type="checkbox" checked={privileges[row.id]?.staff ?? true} onChange={() => handleTogglePrivilege(row.id, 'staff')} disabled={!isAdmin || !privileges[row.id]?.admin} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {settingsTab === 'metrics' && (
                <div className="space-y-8">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
                      <label className="text-[14px] font-semibold text-gray-900">Measurement System</label>
                      <div className="relative inline-block w-full sm:w-auto">
                        <select value={measurementSystem} onChange={(e) => setMeasurementSystem(e.target.value as 'Imperial' | 'Metric')} className="h-10 pl-4 pr-10 border border-gray-300 rounded-lg text-[14px] bg-white outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none cursor-pointer w-full sm:w-auto">
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-[100px] h-[52px] rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                        <div className="w-full h-full rounded-md" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: primaryColor }} />
                        <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-[52px] pl-11 pr-4 w-full sm:w-[180px] border border-gray-200 rounded-lg text-[14px] font-medium text-gray-800 outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">Account Logo</h3>
                    <p className="text-[13px] text-gray-500 mb-4">Upload your account logo. Max 5MB. The logo appears in the sidebar immediately.</p>
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml,image/webp" onChange={handleLogoUpload} className="hidden" />
                    <div className="relative inline-block w-full sm:w-auto">
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="w-full sm:w-[400px] h-[160px] sm:h-[180px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#1a73e8] hover:bg-blue-50/30 transition relative overflow-hidden">
                        {accountLogo ? <img src={accountLogo} alt="Account logo" className="w-full h-full object-contain p-4" /> : <p className="text-[14px] font-medium text-gray-500">Click to upload logo</p>}
                      </button>
                      {accountLogo && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeAccountLogo(); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'integrations' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">InBody</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.inbody.enabled} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, enabled: e.target.checked } })} className="w-[18px] h-[18px] rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Username</label><input type="text" value={integrations.inbody.apiUsername} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, apiUsername: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Key</label><input type="text" value={integrations.inbody.apiKey} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, apiKey: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">Evolt</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.evolt.enabled} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, enabled: e.target.checked } })} className="w-[18px] h-[18px] rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Client ID</label><input type="text" value={integrations.evolt.clientId} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, clientId: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Client Secret</label><input type="text" value={integrations.evolt.clientSecret} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, clientSecret: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">Styku</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.styku.enabled} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, enabled: e.target.checked } })} className="w-[18px] h-[18px] rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Key</label><input type="text" value={integrations.styku.apiKey} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, apiKey: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div><label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Secret</label><input type="text" value={integrations.styku.apiSecret} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, apiSecret: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" /></div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Body Fat Method</label>
                        <div className="relative">
                          <select value={integrations.styku.bodyFatMethod} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, bodyFatMethod: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                            <option value="BIA">BIA</option><option value="DEXA">DEXA</option><option value="Navy">Navy</option><option value="Skinfold">Skinfold</option><option value="3D Scan">3D Scan</option>
                          </select>
                          <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Circumference Measurement</label>
                        <div className="relative">
                          <select value={integrations.styku.circumferenceMeasurement} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, circumferenceMeasurement: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                            <option value="Left Side">Left Side</option><option value="Right Side">Right Side</option><option value="Average">Average</option>
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
                  <button type="button" onClick={handleSaveSettings} className="px-6 h-[44px] text-[14px] font-semibold text-white bg-[#1a4db8] hover:bg-[#15409b] rounded-lg transition w-full sm:w-auto">Save settings</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ACTIONS MODAL */}
      {openActionsFor !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4" onClick={() => setOpenActionsFor(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Actions</h3>
              <button onClick={() => setOpenActionsFor(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-2">
              <button onClick={() => handleViewTask(openActionsFor)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium text-left transition">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View task
              </button>

              {actionIsCompleted ? (
                <button disabled className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed text-sm font-medium text-left">
                  <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Already completed
                </button>
              ) : (
                <button onClick={() => handleMarkCompleted(openActionsFor)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-50 text-sm font-medium text-left transition">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark as completed
                </button>
              )}

              {actionIsCompleted && (
                <button onClick={() => handleReopen(openActionsFor)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-amber-700 hover:bg-amber-50 text-sm font-medium text-left transition">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reopen task
                </button>
              )}

              <button onClick={() => handleEditTask(openActionsFor)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium text-left transition">
                <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit task
              </button>

              <button onClick={() => openDeleteConfirm(openActionsFor)} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-red-100 bg-red-50/70 text-[#b83232] hover:bg-red-50 text-sm font-medium text-left transition">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                </svg>
                Delete task
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative p-5 sm:p-7">
            <button onClick={() => setDeleteModalTask(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 pr-8">Delete &quot;{deleteModalTask.title}&quot;?</h2>
            <p className="text-[15px] text-gray-500 mb-7">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button onClick={() => setDeleteModalTask(null)} className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition w-full sm:w-auto">Cancel</button>
              <button onClick={confirmDeleteTask} className="px-6 py-3 text-sm font-semibold text-white bg-[#e51b48] hover:bg-[#c9173d] rounded-full transition w-full sm:w-auto">Delete</button>
            </div>
          </div>
        </div>
      )}

      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative max-h-[92vh] flex flex-col">
            <button onClick={closeModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 z-10">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="px-4 sm:px-7 pt-5 sm:pt-7 pb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#1a73e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {editingTaskId !== null ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
                  )}
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{editingTaskId !== null ? 'Update Task' : 'Create Task'}</h2>
              <p className="text-sm text-gray-500">{editingTaskId !== null ? 'Edit this task.' : 'Create a new task.'}</p>
            </div>

            <form onSubmit={handleSaveTask} className="flex-1 overflow-y-auto px-4 sm:px-7 pb-4" noValidate>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Title <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Task title" value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (validationErrors.title) setValidationErrors({ ...validationErrors, title: '' }); }} className={`w-full h-11 px-4 border rounded-lg text-sm outline-none transition ${validationErrors.title ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                  {validationErrors.title && <p className="text-xs text-red-500 mt-1.5">{validationErrors.title}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Type <span className="text-red-500">*</span></label>
                    <select value={formData.type} onChange={(e) => { setFormData({ ...formData, type: e.target.value }); if (validationErrors.type) setValidationErrors({ ...validationErrors, type: '' }); }} className={`w-full h-11 px-3 border rounded-lg text-sm outline-none transition bg-white appearance-none ${validationErrors.type ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`}>
                      <option value="">Select type...</option>
                      <option value="General">General</option>
                      <option value="Metrics">Metrics</option>
                      <option value="Forms">Forms</option>
                      <option value="Goals">Goals</option>
                      <option value="Contact">Contact</option>
                    </select>
                    {validationErrors.type && <p className="text-xs text-red-500 mt-1.5">Type is required</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Priority</label>
                    <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition bg-white appearance-none">
                      <option value="URGENT">Urgent</option>
                      <option value="HIGH">High</option>
                      <option value="NORMAL">Normal</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                  <textarea rows={4} placeholder="Optional description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 transition resize-none" />
                </div>

                <div className="relative" ref={assigneesRef}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Assignees <span className="text-red-500">*</span></label>
                  <div onClick={() => setAssigneesOpen(!assigneesOpen)} className={`w-full min-h-11 px-2 py-1.5 border rounded-lg text-sm bg-white cursor-pointer flex flex-wrap items-center gap-1.5 ${validationErrors.assignees ? 'border-red-400' : 'border-gray-300'}`}>
                    {formData.assignees.length === 0 ? (
                      <span className="text-gray-400 pl-2 py-1">Select staff...</span>
                    ) : (
                      formData.assignees.map((staffId) => {
                        const staff = staffOptions.find((s) => s.id === staffId);
                        return (
                          <span key={staffId} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-md">
                            {staff?.name || 'Unknown'}
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeAssignee(staffId); }} className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center transition">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </span>
                        );
                      })
                    )}
                    <svg className={`w-4 h-4 text-gray-500 ml-auto mr-1 transition-transform flex-shrink-0 ${assigneesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {assigneesOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 max-h-60 overflow-y-auto">
                      <div className="space-y-3">
                        {staffOptions.map((staff) => {
                          const checked = formData.assignees.includes(staff.id);
                          return (
                            <label key={staff.id} className="flex items-center gap-3 cursor-pointer select-none">
                              <span className={`w-5 h-5 flex items-center justify-center rounded border-2 transition ${checked ? 'bg-[#1a73e8] border-[#1a73e8]' : 'bg-white border-gray-300'}`}>
                                {checked && (<svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>)}
                              </span>
                              <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleAssignee(staff.id)} />
                              <span className="text-sm text-gray-800 font-medium">{staff.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {validationErrors.assignees && <p className="text-xs text-red-500 mt-1.5">{validationErrors.assignees}</p>}
                </div>

                <div className="relative" ref={profilesRef}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Profile(s) <span className="text-red-500">*</span></label>
                  <div onClick={() => setProfilesOpen(!profilesOpen)} className={`w-full min-h-11 px-2 py-1.5 border rounded-lg text-sm bg-white cursor-pointer flex flex-wrap items-center gap-1.5 ${validationErrors.profiles ? 'border-red-400' : 'border-gray-300'}`}>
                    {formData.profiles.length === 0 ? (
                      <span className="text-gray-400 pl-2 py-1">Select profile(s)...</span>
                    ) : (
                      formData.profiles.map((profileId) => {
                        const profile = profileOptions.find((p) => p.id === profileId);
                        return (
                          <span key={profileId} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-md">
                            {profile?.name || 'Unknown'}
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeProfile(profileId); }} className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center transition">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </span>
                        );
                      })
                    )}
                    <svg className={`w-4 h-4 text-gray-500 ml-auto mr-1 transition-transform flex-shrink-0 ${profilesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {profilesOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 max-h-60 overflow-y-auto">
                      <div className="space-y-3">
                        {profileOptions.map((profile) => {
                          const checked = formData.profiles.includes(profile.id);
                          return (
                            <label key={profile.id} className="flex items-center gap-3 cursor-pointer select-none">
                              <span className={`w-5 h-5 flex items-center justify-center rounded border-2 transition ${checked ? 'bg-[#1a73e8] border-[#1a73e8]' : 'bg-white border-gray-300'}`}>
                                {checked && (<svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>)}
                              </span>
                              <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleProfile(profile.id)} />
                              <span className="text-sm text-gray-800 font-medium">{profile.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {validationErrors.profiles && <p className="text-xs text-red-500 mt-1.5">{validationErrors.profiles}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Due Date <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.dueDate} onChange={(e) => { setFormData({ ...formData, dueDate: e.target.value }); if (validationErrors.dueDate) setValidationErrors({ ...validationErrors, dueDate: '' }); }} className={`w-full h-11 px-3 border rounded-lg text-sm outline-none transition bg-white ${validationErrors.dueDate ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                  {validationErrors.dueDate && <p className="text-xs text-red-500 mt-1.5">{validationErrors.dueDate}</p>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-100 sticky bottom-0 bg-white">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition order-2 sm:order-1">Cancel</button>
                <button type="submit" disabled={saving} className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg transition order-1 sm:order-2 ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Saving...' : editingTaskId !== null ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-3">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 py-3.5 px-4 sm:px-5 flex items-center gap-3 min-w-[280px] sm:min-w-[320px] max-w-[92vw]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'error' ? 'bg-red-50' : 'bg-emerald-50'}`}>
              {toast.type === 'error' ? (
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== REUSABLE COMPONENTS ==============

function NavLink({ href, label, icon, active = false, onClick, badge = 0 }: { href: string; label: string; icon: React.ReactNode; active?: boolean; onClick?: (e: any) => void; badge?: number; }) {
  return (
    <Link href={href} onClick={onClick} className={`relative flex items-center gap-3 px-3 py-2.5 text-[13.5px] rounded-md ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
      {active && (<span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-[#1a73e8] rounded-r"></span>)}
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
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
        {title}
      </h3>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-[12px] sm:text-[13px] font-semibold text-gray-600 w-1/2">Metric</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-[12px] sm:text-[13px] font-semibold text-gray-600 text-center">Days Between</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-[12px] sm:text-[13px] font-semibold text-gray-600 text-center w-24">Show</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-[13px] sm:text-[14px] text-gray-800 font-medium">{row.label}</td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                  <input
                    type="text"
                    value={metricsData[row.id]?.days ?? ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setMetricsData((prev: any) => ({ ...prev, [row.id]: { ...prev[row.id], days: val } }));
                    }}
                    placeholder="—"
                    className="w-20 sm:w-24 h-9 text-center border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10"
                  />
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
                  <input
                    type="checkbox"
                    checked={metricsData[row.id]?.show ?? false}
                    onChange={() => {
                      setMetricsData((prev: any) => ({ ...prev, [row.id]: { ...prev[row.id], show: !prev[row.id].show } }));
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
  );
}

function TestingSection({ title, rows, testingData, setTestingData }: { title: string; rows: { id: string; label: string }[]; testingData: any; setTestingData: any; }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
        {title}
      </h3>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-[12px] sm:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
              {TESTING_COLUMNS.map(col => (
                <th key={col.id} className="py-3 sm:py-4 px-2 sm:px-6 text-center">
                  <span className="px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full uppercase tracking-wider whitespace-nowrap inline-block">
                    {col.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-[13px] sm:text-[14px] text-gray-800 font-medium">{row.label}</td>
                {TESTING_COLUMNS.map(col => (
                  <td key={col.id} className="py-3 sm:py-4 px-2 sm:px-6 text-center">
                    <input
                      type="checkbox"
                      checked={testingData[row.id]?.[col.id] ?? false}
                      onChange={() => {
                        setTestingData((prev: any) => ({
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
  );
}

function ResultsSection({ title, rows, resultsData, setResultsData }: { title: string; rows: { id: string; label: string }[]; resultsData: any; setResultsData: any; }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
        {title}
      </h3>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-[12px] sm:text-[13px] font-semibold text-gray-600 w-1/4">Metric</th>
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-[12px] sm:text-[13px] font-semibold text-gray-600">Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-[13px] sm:text-[14px] text-gray-800 font-medium align-top pt-4 sm:pt-6">{row.label}</td>
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <div className="relative">
                    <textarea
                      value={resultsData[row.id] ?? ''}
                      onChange={(e) => {
                        setResultsData((prev: any) => ({ ...prev, [row.id]: e.target.value }));
                      }}
                      placeholder="Enter interpretation here..."
                      rows={4}
                      className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl text-[13px] sm:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y"
                    />
                    <div className="text-[10px] sm:text-[11px] text-gray-400 mt-1 text-right">
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