'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const TABS = [
  { id: 'profile-info', label: 'Profile Info', type: 'info' },
  { id: 'parq', label: 'PAR-Q', type: 'form' },
  { id: 'custom-1', label: 'Aut et fuga Perfere', type: 'form' },
  { id: 'custom-2', label: 'amplify_form_1', type: 'form' },
  { id: 'custom-3', label: 'Fitness Assessment', type: 'form' },
  { id: 'custom-4', label: 'Thousand', type: 'form' },
  { id: 'custom-5', label: '1101', type: 'form' },
  { id: 'custom-6', label: 'sajid test', type: 'form' },
  { id: 'custom-7', label: 'New', type: 'form' },
  { id: 'custom-8', label: 'sdf1234', type: 'form' },
  { id: 'custom-9', label: 'sabir', type: 'form' },
  { id: 'custom-10', label: 'Today', type: 'form' },
  { id: 'custom-11', label: 'Notepad', type: 'form' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

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
  { id: 'bf_3site', label: 'Body Fat %: 3 Site Skinfold', defaultDays: '', defaultShow: true },
  { id: 'bf_4site_jp', label: 'Body Fat %: 4 Site Skinfold', defaultDays: '', defaultShow: true },
  { id: 'bf_4site_dw', label: 'Body Fat %: 4 Site Skinfold', defaultDays: '', defaultShow: true },
  { id: 'bf_7site', label: 'Body Fat %: 7 Site Skinfold', defaultDays: '', defaultShow: true },
  { id: 'bf_whole_body', label: 'Body Fat %: Whole-Body', defaultDays: '', defaultShow: true },
  { id: 'bf_styku', label: 'Body Fat %: Styku', defaultDays: '', defaultShow: true },
  { id: 'bf_inbody', label: 'Body Fat %: InBody', defaultDays: '', defaultShow: true },
  { id: 'bf_evolt', label: 'Body Fat %: Evolt', defaultDays: '', defaultShow: true },
  { id: 'bf_bioimpedance', label: 'Body Fat %: Bioelectrical', defaultDays: '', defaultShow: true },
  { id: 'bf_birth', label: 'Body Fat %: Body Girth', defaultDays: '', defaultShow: true },
  { id: 'bm_lean', label: 'Body Mass: Lean Mass', defaultDays: '', defaultShow: true },
  { id: 'bm_fat', label: 'Body Mass: Fat Mass', defaultDays: '', defaultShow: true },
  { id: 'circ_whr', label: 'Circumference: Waist-to-Hip', defaultDays: '', defaultShow: true },
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
  { id: 'vo2_ebbeling', label: 'VO2Max: Ebbeling', defaultDays: '', defaultShow: true },
  { id: 'vo2_3min', label: 'VO2Max: 3 Minutes', defaultDays: '', defaultShow: true },
  { id: 'vo2_12min', label: 'VO2Max: 12-Minute Run', defaultDays: '', defaultShow: true },
  { id: 'vo2_15mile', label: 'VO2Max: 1.5 Mile Run', defaultDays: '', defaultShow: true },
  { id: 'vo2_cycle', label: 'VO2Max: Cycle Ergometer', defaultDays: '', defaultShow: true },
  { id: 'vo2_bruce', label: 'VO2Max: Bruce', defaultDays: '', defaultShow: true },
  { id: 'vo2_result', label: 'VO2Max: Result', defaultDays: '', defaultShow: true },
  { id: 'resting_hr', label: 'Resting Heart Rate', defaultDays: '', defaultShow: true },
  { id: 'row_500m', label: '500m Row', defaultDays: '', defaultShow: true },
  { id: 'airbike_60', label: '60-Second Airbike', defaultDays: '', defaultShow: true },
  { id: 'step_ymca', label: 'Step Test', defaultDays: '', defaultShow: true },
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
  { id: 'med_ball', label: 'Overhead Medicine Ball', defaultDays: '', defaultShow: true },
];
const METRICS_BIOMECHANICS = [
  { id: 'ymca_sit', label: 'YMCA Sit & Reach', defaultDays: '', defaultShow: true },
  { id: 'trunk_lift', label: 'Trunk Lift', defaultDays: '', defaultShow: true },
  { id: 'move_overhead', label: 'Overhead Squat', defaultDays: '', defaultShow: true },
  { id: 'move_bend', label: 'Bend and Lift', defaultDays: '', defaultShow: true },
  { id: 'move_hurdle', label: 'Hurdle Step', defaultDays: '', defaultShow: true },
  { id: 'move_t_spine', label: 'Thoracic Spine', defaultDays: '', defaultShow: true },
  { id: 'screen_aslr', label: 'Active Straight-Leg', defaultDays: '', defaultShow: true },
  { id: 'screen_shoulder', label: 'Shoulder Mobility', defaultDays: '', defaultShow: true },
  { id: 'screen_rotary', label: 'Rotary Stability', defaultDays: '', defaultShow: true },
  { id: 'screen_inline', label: 'Inline Lunge', defaultDays: '', defaultShow: true },
  { id: 'screen_hurdle', label: 'Hurdle Step', defaultDays: '', defaultShow: true },
  { id: 'screen_trunk', label: 'Trunk Stability', defaultDays: '', defaultShow: true },
  { id: 'screen_squat', label: 'Deep Squat', defaultDays: '', defaultShow: true },
];
const METRICS_PROGRESS_PHOTO = [{ id: 'progress_photo', label: 'Progress photo', defaultDays: '', defaultShow: true }];
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
  return initial;
}

// ===== EXTERNAL PRINT HELPERS =====
function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReportPrintHtml(report: any, profileName: string): string {
  const reportName = report?.name || 'Report';
  const reportType = report?.type || 'metrics';
  const created = report?.createdAt ? new Date(report.createdAt).toLocaleString() : '';
  const period =
    report?.periodStart && report?.periodEnd
      ? `${new Date(report.periodStart).toLocaleDateString()} – ${new Date(report.periodEnd).toLocaleDateString()}`
      : '';

  const d = report?.data || {};
  const summary = d.summary || {};
  const summaryRows = Object.entries(summary)
    .map(
      ([k, v]) =>
        `<tr><td class="k">${escapeHtml(k)}</td><td class="v">${escapeHtml(
          typeof v === 'object' ? JSON.stringify(v) : String(v),
        )}</td></tr>`,
    )
    .join('');

  const rows: any[] = Array.isArray(d.rows) ? d.rows : [];
  const rowHeader = ['Name', 'Email', 'Age', 'Gender', d.summary?.metric || 'Value'];
  const rowHtml = rows.length
    ? `<table class="grid"><thead><tr>${rowHeader
        .map((h) => `<th>${escapeHtml(String(h))}</th>`)
        .join('')}</tr></thead><tbody>${rows
        .map(
          (r: any) =>
            `<tr><td>${escapeHtml(String(r.name ?? ''))}</td><td>${escapeHtml(
              String(r.email ?? ''),
            )}</td><td>${escapeHtml(String(r.age ?? ''))}</td><td>${escapeHtml(
              String(r.gender ?? ''),
            )}</td><td class="strong">${escapeHtml(String(r.value ?? ''))}</td></tr>`,
        )
        .join('')}</tbody></table>`
    : '<p>No rows in this report.</p>';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(reportName)} — ${escapeHtml(profileName)}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:32px;font-size:13px}
  h1{font-size:22px;margin:0 0 4px}
  h2{font-size:14px;font-weight:500;color:#555;margin:0 0 18px}
  .meta{font-size:12px;color:#555;margin-bottom:24px}
  .meta span{display:inline-block;margin-right:16px}
  h3{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#555;margin:24px 0 8px}
  table{border-collapse:collapse;width:100%}
  table.kv td{border:1px solid #ddd;padding:8px 10px;vertical-align:top}
  table.kv td.k{width:35%;background:#f7f8fa;font-weight:600}
  table.grid th,table.grid td{border:1px solid #ddd;padding:8px 10px;text-align:left;font-size:12.5px}
  table.grid th{background:#f7f8fa;font-weight:600}
  td.strong{font-weight:600}
  .footer{margin-top:28px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:8px}
  @media print{body{margin:16mm}}
</style>
</head>
<body>
  <h1>${escapeHtml(reportName)}</h1>
  <h2>${escapeHtml(profileName)} — ${escapeHtml(reportType)}</h2>
  <div class="meta">
    ${created ? `<span><b>Created:</b> ${escapeHtml(created)}</span>` : ''}
    ${period ? `<span><b>Period:</b> ${escapeHtml(period)}</span>` : ''}
  </div>

  ${summaryRows ? `<h3>Summary</h3><table class="kv"><tbody>${summaryRows}</tbody></table>` : ''}

  <h3>Details</h3>
  ${rowHtml}

  <div class="footer">Generated ${escapeHtml(new Date().toLocaleString())}</div>
  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 200); };
  </script>
</body>
</html>`;
}

type UIProfile = {
  id: string; name: string; firstName: string; lastName: string;
  email: string; phone: string; age: string; sex: string;
  measurementSystem: string; birthday: string; heightFt: string; heightIn: string;
  staff: string; staffId: string; groups: string[]; clientAccess: string;
  parq: string; lastTested: string; nextGoal: string; overdueMetrics: number;
  profilePhoto: string; createdAt: string; status: string;
};
type StaffOption = { id: string; name: string; email: string };
type ProgramOption = { id: string; name: string };
type WorkoutOption = { id: string; name: string };
type ChatMessage = { id: string; senderName: string; body: string; createdAt: string };

export default function ProfilesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState<string[]>([]);
  const [logoError, setLogoError] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ home: true, organization: true, library: true, analytics: true });
  const [view, setView] = useState<'profiles' | 'account-info' | 'account-settings'>('profiles');

  // Header menus
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [unreadConversations, setUnreadConversations] = useState<any[]>([]);
  const [stats] = useState({ missingParq: 0, noMetrics: 0, overdueMetrics: 0, noGoals: 0 });

  // Profiles list
  const [activeTab, setActiveTab] = useState('Active');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [profiles, setProfiles] = useState<UIProfile[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [staffMenuOpen, setStaffMenuOpen] = useState(false);
  const groupMenuRef = useRef<HTMLDivElement>(null);
  const staffMenuRef = useRef<HTMLDivElement>(null);

  // Create profile modal
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalTab, setModalTab] = useState('profile-info');

  // Single profile detail view
  const [selectedProfile, setSelectedProfile] = useState<UIProfile | null>(null);
  const [profileTab, setProfileTab] = useState('Overview');

  // Progress photos
  const [progressPhotos, setProgressPhotos] = useState<{ url: string; date: string }[]>([]);
  const addPhotoInputRef = useRef<HTMLInputElement>(null);

  // Calendar
  const [calendarView, setCalendarView] = useState<'Calendar' | 'Agenda'>('Calendar');
  const [calendarMode, setCalendarMode] = useState<'Day' | 'Week'>('Week');
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventData, setEventData] = useState({
    name: '', date: '2026-11-03', startTime: '12:00 am', endTime: '12:00 pm',
    users: '', profiles: [] as string[], metrics: '', workout: 'None', note: ''
  });

  // Tasks
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskData, setTaskData] = useState({ title: '', type: '', priority: 'Normal', description: '', assignees: '', profiles: [] as string[], dueDate: '' });
  const [taskError, setTaskError] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);

  // Messages
  const [activeChatProfile, setActiveChatProfile] = useState<UIProfile | null>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [messagesSearch, setMessagesSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Reports
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Notes
  const [notesTab, setNotesTab] = useState<'Notepad' | 'Journal'>('Notepad');
  const [notepadText, setNotepadText] = useState('');
  const [journalNotes, setJournalNotes] = useState<any[]>([]);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');

  // Files
  const [fileTab, setFileTab] = useState<'Photos' | 'Videos' | 'Docs'>('Photos');
  const [files, setFiles] = useState<{ name: string; type: string; date: string; url?: string }[]>([
    { name: 'progress 1.png', type: 'png', date: '10/10/2026', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=100&auto=format&fit=crop' }
  ]);
  const [fileActionOpen, setFileActionOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  // Programs
  const [programsTab, setProgramsTab] = useState<'Activities' | 'Reference'>('Activities');
  const [programView, setProgramView] = useState<'Grid' | 'List' | 'Table'>('Grid');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [assignProgramOpen, setAssignProgramOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [createWorkoutOpen, setCreateWorkoutOpen] = useState(false);
  const [workoutData, setWorkoutData] = useState({ name: '', duration: '', date: '', note: '' });
  const [programTypeFilter, setProgramTypeFilter] = useState('all');
  const [programTypeMenuOpen, setProgramTypeMenuOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);
  const [activityFilter] = useState('11/02/2026 – 11/29/2026');
  const [droppedElements, setDroppedElements] = useState<{ id: string; type: string; label: string }[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [programsList, setProgramsList] = useState<ProgramOption[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [workoutsList, setWorkoutsList] = useState<WorkoutOption[]>([]);
  const [selectedActivityWorkoutIds, setSelectedActivityWorkoutIds] = useState<string[]>([]);

  // Metrics / Testing
  const [metricsTab, setMetricsTab] = useState('Basic Data');
  const [testingTab, setTestingTab] = useState('Weight Loss');
  const [testingDateOpen, setTestingDateOpen] = useState(false);
  const [testingDate, setTestingDate] = useState('11/03/2026');
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [updateMetricsOpen, setUpdateMetricsOpen] = useState(false);
  const [updateMetricsSelection, setUpdateMetricsSelection] = useState<string[]>(['weight', 'systolic_inbody', 'systolic_result', 'diastolic_inbody', 'diastolic_result']);
  const [createTestNoteOpen, setCreateTestNoteOpen] = useState(false);
  const [testNoteData, setTestNoteData] = useState({ date: '2026-11-03', metric: 'General', exercise: 'None', text: '', visibility: 'Shared to Users and Profiles' });
  const [selectedMetricForNote, setSelectedMetricForNote] = useState('');
  const [noteDateOpen, setNoteDateOpen] = useState(false);
  const [noteDateText, setNoteDateText] = useState('2026-11-03');
  const [goalDates, setGoalDates] = useState<{ [key: string]: string }>({ weight: '', metabolic: '', metabolic_harris: '' });
  const [goalDatePickerOpen, setGoalDatePickerOpen] = useState<string | null>(null);

  // Info edit
  const [infoData, setInfoData] = useState({
    firstName: '', lastName: '', sex: 'Male', measurementSystem: 'Metric',
    birthMonth: '01', birthDay: '15', birthYear: '1950', heightM: '3', email: '', phone: '',
    groups: [] as string[], primaryGroup: '', staff: '', profileAccess: true
  });

  // Profile action menu + related modals
  const [actionMenuProfileId, setActionMenuProfileId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [assignStaffOpen, setAssignStaffOpen] = useState(false);
  const [assignStaffSelected, setAssignStaffSelected] = useState<string>('');
  const [sendFormOpen, setSendFormOpen] = useState(false);
  const [sendFormType, setSendFormType] = useState('PARQ');
  const [assignGroupOpen, setAssignGroupOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Create-profile form state
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', sex: '', measurementSystem: 'Imperial',
    birthMonth: '', birthDay: '', birthYear: '', heightFt: '', heightIn: '',
    email: '', phone: '', groups: [] as string[], staff: '', staffId: '',
    clientAccess: 'deny', profilePhoto: '' as string | null,
  });
  const [parqData, setParqData] = useState({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', notes: '', signature: '' });
  const [custom1Data, setCustom1Data] = useState({ mcs: '' });
  const [custom3Data, setCustom3Data] = useState({ name: '' });
  const [custom6Data, setCustom6Data] = useState({ mcqSingle: '', mcqMulti: [] as string[], paragraph: '' });
  const [notepadData, setNotepadData] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [availableGroups, setAvailableGroups] = useState<{ id: string; name: string }[]>([]);
  const groupsRef = useRef<HTMLDivElement>(null);
  const staffRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account info
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [savingInfo, setSavingInfo] = useState(false);

  // Account settings
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

  // Signature
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureTab, setSignatureTab] = useState<'type' | 'draw' | 'upload'>('type');
  const [signatureName, setSignatureName] = useState('');
  const [signatureStyle, setSignatureStyle] = useState('1');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ====== HELPERS ======
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
  const computeAge = (birthday: string | Date | null | undefined): string => {
    if (!birthday) return '';
    try {
      const d = new Date(birthday);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      let age = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      return age > 0 ? String(age) : '';
    } catch { return ''; }
  };
  const normalizeProfile = (p: any): UIProfile => {
    const name = nameOf(p, 'Unnamed Profile');
    return {
      id: p.id, name, firstName: p.firstName || '', lastName: p.lastName || '',
      email: p.email || '', phone: p.phone || '', age: computeAge(p.birthday),
      sex: p.sex || '', measurementSystem: p.measurementSystem || 'Imperial',
      birthday: p.birthday ? new Date(p.birthday).toLocaleDateString() : '',
      heightFt: p.heightFt != null ? String(p.heightFt) : '',
      heightIn: p.heightIn != null ? String(p.heightIn) : '',
      staff: p.staff ? nameOf(p.staff, '') : '', staffId: p.staff?.id || p.staffId || '',
      groups: Array.isArray(p.groups) ? p.groups : [],
      clientAccess: p.clientAccess || 'deny',
      parq: p.parqStatus === 'COMPLETE' || p.parqStatus === 'Complete' ? 'Complete' : 'Incomplete',
      lastTested: p.lastTested ? new Date(p.lastTested).toLocaleDateString() : 'Never',
      nextGoal: p.nextGoal || '—', overdueMetrics: p.overdueMetrics || 0,
      profilePhoto: p.profilePhoto || '',
      createdAt: p.createdAt || new Date().toISOString(),
      status: p.status || 'ACTIVE',
    };
  };

  // ====== FETCH ======
  const fetchProfiles = async () => {
    setDataLoading(true);
    try {
      const res = await fetch(`${API_URL}/profiles`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setProfiles(data.map(normalizeProfile));
    } catch (err: any) {
      console.error('[fetchProfiles]', err);
      setToast({ message: `Failed to load profiles: ${err.message}`, type: 'error' });
    } finally { setDataLoading(false); }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Unable to load staff (HTTP ${res.status})`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setStaffOptions(data.map((u: any) => ({
          id: u.id,
          name: nameOf(u, u.email || 'Unnamed User'),
          email: u.email || '',
        })).filter((u: StaffOption) => Boolean(u.id)));
      } else {
        setStaffOptions([]);
      }
    } catch (err) {
      console.error('[fetchStaff]', err);
      setStaffOptions([]);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (Array.isArray(data)) setAvailableGroups(data);
    } catch (err) {
      console.warn("Could not load groups from backend, using fallback.");
      setAvailableGroups([
        { id: 'grp-1', name: 'Amplify Group 1' },
        { id: 'grp-2', name: 'Big Muscle Fitness Centre' },
        { id: 'grp-3', name: 'Cross-fit' },
      ]);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${API_URL}/programs`, { headers: authHeaders() });
      if (!res.ok) {
        console.warn('[fetchPrograms] HTTP', res.status);
        return;
      }
      const data = await res.json();
      const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setProgramsList(list.map((p: any) => ({ id: p.id, name: p.name })));
    } catch (err) {
      console.error('[fetchPrograms]', err);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const res = await fetch(`${API_URL}/workouts`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      setWorkoutsList(list.map((w: any) => ({ id: w.id, name: w.name })));
    } catch (err) {
      console.error('[fetchWorkouts]', err);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setUnreadConversations(data.filter((c: any) => c.unread === true));
    } catch (err) { }
  };

  const fetchPrivileges = async () => {
    try {
      const res = await fetch(`${API_URL}/privileges`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') setPrivileges((prev) => ({ ...prev, ...data }));
      }
    } catch (err) { }
  };

  const fetchReportsForProfile = async (_profileId: string) => {
    setLoadingReports(true);
    try {
      const res = await fetch(`${API_URL}/reports`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

      list.sort((a: any, b: any) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });

      setReportsList(list);
    } catch (err) {
      console.error('[fetchReportsForProfile]', err);
      setReportsList([]);
      setToast({ message: 'Failed to load reports', type: 'error' });
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchProgressPhotos = async (profileId: string) => {
    try {
      const res = await fetch(`${API_URL}/profiles/${profileId}/photos`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProgressPhotos(Array.isArray(data) ? data.map((p: any) => ({ url: p.url, date: new Date(p.createdAt).toLocaleDateString() })) : []);
      }
    } catch { setProgressPhotos([]); }
  };

  const fetchFiles = async (profileId: string) => {
    try {
      const res = await fetch(`${API_URL}/profiles/${profileId}/files`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data.map((f: any) => ({ name: f.name, type: f.type, date: new Date(f.createdAt).toLocaleDateString(), url: f.url })) : []);
      }
    } catch { console.warn('Could not load files'); }
  };

  const fetchNotes = async (profileId: string) => {
    try {
      const res = await fetch(`${API_URL}/profiles/${profileId}/notes`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setJournalNotes(Array.isArray(data) ? data.map((n: any) => ({ text: n.text, date: new Date(n.createdAt).toLocaleDateString() })) : []);
      }
    } catch { console.warn('Could not load notes'); }
  };

  // ====== BOOT ======
  useEffect(() => {
    const now = new Date();
    setYears(Array.from({ length: 100 }, (_, i) => String(now.getFullYear() - i)));
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    setCurrentWeekStart(weekStart);

    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const token = getToken();
    if (!storedUser || !token) { router.push('/'); return; }
    let parsed: any = {};
    try { parsed = JSON.parse(storedUser); } catch { router.push('/'); return; }
    const safeName = parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || parsed.email || 'User';
    setUser({ ...parsed, name: safeName, role: parsed.role || 'User', id: parsed.id });
    const parts = safeName.split(/\s+/).filter(Boolean);
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setEmail(parsed.email || '');

    const storedPhoto = localStorage.getItem('account_profile_photo');
    if (storedPhoto) setAccountPhoto(storedPhoto);

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
        setPrimaryColor(s.primaryColor || '#F59E0B');
        setAccountLogo(s.accountLogo || null);
        if (s.integrations) setIntegrations((prev) => ({ ...prev, ...s.integrations, styku: { ...prev.styku, ...(s.integrations.styku || {}) } }));
        if (s.privileges) setPrivileges((prev) => ({ ...prev, ...s.privileges }));
        if (s.measurementSystem) setMeasurementSystem(s.measurementSystem);
        if (s.metricsData) setMetricsData((prev) => ({ ...prev, ...s.metricsData }));
        if (s.testingData) setTestingData((prev) => ({ ...prev, ...s.testingData }));
        if (s.resultsData) setResultsData((prev) => ({ ...prev, ...s.resultsData }));
      } catch {}
    }

    setLoading(false);
    fetchProfiles();
    fetchStaff();
    fetchGroups();
    fetchPrograms();
    fetchWorkouts();
    fetchUnreadMessages();
    fetchPrivileges();
  }, [router]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatProfile]);

  // Refresh the active thread so replies from the Messages page appear here too.
  useEffect(() => {
    if (!currentConversationId) return;
    let cancelled = false;
    const refreshActiveThread = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/${encodeURIComponent(currentConversationId)}`, {
          method: 'GET',
          headers: authHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data?.messages)) return;
        const sorted = [...data.messages].sort(
          (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        setChatMessages(sorted);
        await fetch(`${API_URL}/messages/${encodeURIComponent(currentConversationId)}/read`, {
          method: 'PATCH',
          headers: authHeaders(),
        });
      } catch (err) {
        console.warn('[refreshActiveThread]', err);
      }
    };
    const intervalId = window.setInterval(refreshActiveThread, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [currentConversationId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (groupsRef.current && !groupsRef.current.contains(t)) setGroupsOpen(false);
      if (staffRef.current && !staffRef.current.contains(t)) setStaffOpen(false);
      if (accountMenuRef.current && !accountMenuRef.current.contains(t)) setAccountMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(t)) setNotificationsOpen(false);
      if (groupMenuRef.current && !groupMenuRef.current.contains(t)) setGroupMenuOpen(false);
      if (staffMenuRef.current && !staffMenuRef.current.contains(t)) setStaffMenuOpen(false);
      if (actionMenuRef.current && !actionMenuRef.current.contains(t)) setActionMenuProfileId(null);
      if (addMenuOpen && !(t.closest('.add-menu-container'))) setAddMenuOpen(false);
      if (testingDateOpen && !(t.closest('.testing-date-container'))) setTestingDateOpen(false);
      if (printMenuOpen && !(t.closest('.print-menu-container'))) setPrintMenuOpen(false);
      if (noteDateOpen && !(t.closest('.note-date-container'))) setNoteDateOpen(false);
      if (goalDatePickerOpen && !(t.closest('.goal-date-container'))) setGoalDatePickerOpen(null);
      if (statusMenuOpen && !(t.closest('.status-menu-container'))) setStatusMenuOpen(false);
      if (typeMenuOpen && !(t.closest('.type-menu-container'))) setTypeMenuOpen(false);
      if (programTypeMenuOpen && !(t.closest('.program-type-container'))) setProgramTypeMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addMenuOpen, testingDateOpen, printMenuOpen, noteDateOpen, goalDatePickerOpen, statusMenuOpen, typeMenuOpen, programTypeMenuOpen]);

  useEffect(() => {
    const anyOpen = createOpen || createEventOpen || createTaskOpen || createNoteOpen || fileActionOpen || assignProgramOpen || addActivityOpen || createTestNoteOpen || updateMetricsOpen || signatureModalOpen || !!actionMenuProfileId;
    document.body.style.overflow = anyOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [createOpen, createEventOpen, createTaskOpen, createNoteOpen, fileActionOpen, assignProgramOpen, addActivityOpen, createTestNoteOpen, updateMetricsOpen, signatureModalOpen, actionMenuProfileId]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  // Auto-load reports whenever the Reports tab is opened
  useEffect(() => {
    if (profileTab === 'Reports' && selectedProfile) {
      fetchReportsForProfile(selectedProfile.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileTab, selectedProfile?.id]);

  // ====== SMALL HELPERS ======
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(/[.\s+_-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };
  const handleLogout = () => {
    localStorage.removeItem('user'); localStorage.removeItem('token'); localStorage.removeItem('access_token');
    sessionStorage.removeItem('user'); sessionStorage.removeItem('token'); sessionStorage.removeItem('access_token');
    router.push('/');
  };
  const toggleSection = (key: keyof typeof openSections) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const selectProfile = async (p: UIProfile) => {
    setSelectedProfile(p);
    setProfileTab('Overview');
    setInfoData({
      firstName: p.firstName, lastName: p.lastName, sex: p.sex,
      measurementSystem: p.measurementSystem,
      birthMonth: '01', birthDay: '15', birthYear: '1950', heightM: '3',
      email: p.email, phone: p.phone, groups: p.groups, primaryGroup: '', staff: p.staff, profileAccess: true,
    });
    await Promise.all([
      fetchReportsForProfile(p.id),
      fetchProgressPhotos(p.id),
      fetchFiles(p.id),
      fetchNotes(p.id),
    ]);
    const savedNotepad = localStorage.getItem(`notepad_${p.id}`);
    if (savedNotepad) setNotepadText(savedNotepad);
  };

  const openActionMenu = (profileId: string) => {
    setSelectedProfileId(profileId);
    setActionMenuProfileId(profileId);
  };
  const closeActionMenu = () => { setActionMenuProfileId(null); };

  // ====== MESSAGES LOGIC (WhatsApp-style alignment) ======
  const openChatForProfile = async (p: UIProfile) => {
    setActiveChatProfile(p);
    setCurrentConversationId(null);
    setChatMessages([]);
    setNewMessageText('');

    const trainerId = p.staffId || user?.id;
    if (!trainerId) {
      setToast({ message: 'Cannot open this conversation: no trainer is assigned and the logged-in user ID is unavailable.', type: 'error' });
      return;
    }

    setIsSendingMsg(true);
    try {
      const res = await fetch(`${API_URL}/messages/${encodeURIComponent(p.id)}/${encodeURIComponent(trainerId)}`, {
        method: 'GET',
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
        throw new Error(message || `Could not load conversation (HTTP ${res.status})`);
      }
      if (!data?.id) throw new Error('The server did not return a conversation ID.');
      setCurrentConversationId(data.id);
      const sorted = Array.isArray(data.messages)
        ? [...data.messages].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : [];
      setChatMessages(sorted);
    } catch (err: any) {
      setCurrentConversationId(null);
      setChatMessages([]);
      setToast({ message: err?.message || 'Could not load conversation.', type: 'error' });
    } finally {
      setIsSendingMsg(false);
    }
  };

  const sendMessageToActiveChat = async () => {
    const textToSend = newMessageText.trim();
    if (!currentConversationId || !textToSend || !user?.name || isSendingMsg) return;

    setIsSendingMsg(true);
    try {
      const res = await fetch(`${API_URL}/messages/${encodeURIComponent(currentConversationId)}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ senderName: user.name, body: textToSend }),
      });
      const savedMsg = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(savedMsg?.message) ? savedMsg.message.join(', ') : savedMsg?.message;
        throw new Error(message || `Message could not be saved (HTTP ${res.status})`);
      }
      if (!savedMsg?.id) throw new Error('The server did not confirm that the message was saved.');
      setChatMessages((prev) => [...prev, savedMsg]);
      setNewMessageText('');
    } catch (err: any) {
      setToast({ message: err?.message || 'Message could not be sent.', type: 'error' });
    } finally {
      setIsSendingMsg(false);
    }
  };

  // ====== PRINT REPORT (external window, PDF = report only) ======
  const printReportExternal = (report: any) => {
    const html = buildReportPrintHtml(report, selectedProfile?.name || 'Profile');
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) {
      setToast({ message: 'Please allow pop-ups to print the report.', type: 'error' });
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  // ====== OPEN CREATE PROFILE ======
  const openCreateModal = () => {
    setModalTab('profile-info');
    setFormData({ firstName: '', lastName: '', sex: '', measurementSystem: 'Imperial', birthMonth: '', birthDay: '', birthYear: '', heightFt: '', heightIn: '', email: '', phone: '', groups: [], staff: '', staffId: '', clientAccess: 'deny', profilePhoto: '' });
    setParqData({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', notes: '', signature: '' });
    setCustom1Data({ mcs: '' });
    setCustom3Data({ name: '' });
    setCustom6Data({ mcqSingle: '', mcqMulti: [], paragraph: '' });
    setNotepadData('');
    setValidationErrors({});
    setCreateOpen(true);
  };

  // ====== PHOTO / FILE HANDLERS ======
  const handleAddPhotoClick = () => addPhotoInputRef.current?.click();
  const handleAddPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProfile) return;
    if (!file.type.startsWith('image/')) { setToast({ message: 'Please select an image file.', type: 'error' }); return; }
    if (file.size > 6 * 1024 * 1024) { setToast({ message: 'File too large. Max 6MB.', type: 'error' }); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`${API_URL}/profiles/${selectedProfile.id}/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const saved = await res.json();
      setProgressPhotos([...progressPhotos, { url: saved.url, date: new Date().toLocaleDateString() }]);
      setToast({ message: 'Photo added successfully', type: 'success' });
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newUrl = ev.target?.result as string;
        const newDate = new Date().toLocaleDateString();
        setProgressPhotos([...progressPhotos, { url: newUrl, date: newDate }]);
        setFiles([...files, { name: file.name, type: file.name.split('.').pop() || 'png', date: newDate, url: newUrl }]);
        setToast({ message: 'Photo added (local)', type: 'success' });
      };
      reader.readAsDataURL(file);
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleFileUploadClick = () => fileUploadInputRef.current?.click();
  const handleFileUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProfile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/profiles/${selectedProfile.id}/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const saved = await res.json();
      setFiles([...files, { name: saved.name || file.name, type: saved.type || file.name.split('.').pop() || '', date: new Date().toLocaleDateString(), url: saved.url }]);
      setToast({ message: 'File uploaded successfully', type: 'success' });
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newUrl = ev.target?.result as string;
        const ext = file.name.split('.').pop() || '';
        const type = ['jpg', 'jpeg', 'png', 'gif'].includes(ext.toLowerCase()) ? 'png' : ext.toLowerCase();
        setFiles([...files, { name: file.name, type, date: new Date().toLocaleDateString(), url: newUrl }]);
        setToast({ message: 'File added (local)', type: 'success' });
      };
      reader.readAsDataURL(file);
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleFileAction = (file: any) => { setSelectedFile(file); setFileActionOpen(true); };
  const handleDeleteFile = async () => {
    if (!selectedFile || !selectedProfile) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/profiles/${selectedProfile.id}/files/${encodeURIComponent(selectedFile.name)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch {}
    setFiles(files.filter(f => f.name !== selectedFile.name));
    setFileActionOpen(false);
    setToast({ message: 'File deleted successfully', type: 'success' });
    setSaving(false);
  };

  const handlePhotoClick = () => fileInputRef.current?.click();
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { setToast({ message: 'Please select an image file.', type: 'error' }); e.target.value = ''; return; }
    if (file.size > 6 * 1024 * 1024) { setToast({ message: 'File too large. Max 6MB.', type: 'error' }); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (ev) => setFormData({ ...formData, profilePhoto: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const removePhoto = (e: React.MouseEvent) => { e.stopPropagation(); setFormData({ ...formData, profilePhoto: '' }); };

  const handleAccountPhotoClick = () => accountPhotoInputRef.current?.click();
  const handleAccountPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 6 * 1024 * 1024) { setToast({ message: 'File too large. Max 6MB.', type: 'error' }); e.target.value = ''; return; }
    if (!file.type.startsWith('image/')) { setToast({ message: 'Please select an image file.', type: 'error' }); e.target.value = ''; return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAccountPhoto(dataUrl);
      try { localStorage.setItem('account_profile_photo', dataUrl); setToast({ message: 'Profile photo updated successfully', type: 'success' }); }
      catch { setToast({ message: 'Failed to save photo (storage full?)', type: 'error' }); }
    };
    reader.onerror = () => setToast({ message: 'Failed to read image file', type: 'error' });
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const handleRemoveAccountPhoto = () => {
    setAccountPhoto(null);
    localStorage.removeItem('account_profile_photo');
    setToast({ message: 'Profile photo removed', type: 'success' });
  };
  const handleContinueWithGoogle = () => setToast({ message: 'Google sign-in is not configured yet.', type: 'error' });

  const toggleGroup = (g: string) => {
    setFormData((prev) => ({ ...prev, groups: prev.groups.includes(g) ? prev.groups.filter((x) => x !== g) : [...prev.groups, g] }));
  };
  const removeGroup = (g: string) => setFormData((prev) => ({ ...prev, groups: prev.groups.filter((x) => x !== g) }));

  const handleNext = () => {
    const idx = TABS.findIndex((t) => t.id === modalTab);
    if (idx < TABS.length - 1) setModalTab(TABS[idx + 1].id);
  };

  // ====== SIGNATURE CANVAS ======
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    setIsDrawing(true); ctx.beginPath();
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let clientX, clientY;
    if ('touches' in e) { e.preventDefault(); clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };
  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  const handleSaveSignature = () => {
    let finalSignature = '';
    if (signatureTab === 'type') finalSignature = `Signed by: ${signatureName || 'Client'}`;
    else if (signatureTab === 'draw') { const canvas = canvasRef.current; if (canvas) finalSignature = canvas.toDataURL('image/png'); }
    else if (signatureTab === 'upload' && signatureImage) finalSignature = signatureImage;
    setParqData({ ...parqData, signature: finalSignature || 'Signed' });
    setSignatureModalOpen(false);
  };
  const handleSignatureImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => setSignatureImage(ev.target?.result as string); reader.readAsDataURL(file); }
  };

  // ====== SAVE PROFILE ======
  const handleSaveProfile = async () => {
    const errs: { [key: string]: string } = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.sex) errs.sex = 'Sex is required';
    if (!formData.birthMonth || !formData.birthDay || !formData.birthYear) errs.birthday = 'Birthday is required';
    if (!formData.heightFt) errs.heightFt = 'Height (ft) is required';
    if (!formData.heightIn) errs.heightIn = 'Height (in) is required';
    if (Object.keys(errs).length > 0) { setValidationErrors(errs); setModalTab('profile-info'); return; }
    setValidationErrors({}); setSaving(true);
    try {
      const monthIdx = MONTHS.indexOf(formData.birthMonth);
      const birthdayISO = new Date(Number(formData.birthYear), monthIdx >= 0 ? monthIdx : 0, Number(formData.birthDay)).toISOString();
      
      // Update with PAR-Q completeness status
      const hasAnyParq = Object.keys(parqData).some(k => k.startsWith('q') && parqData[k as keyof typeof parqData]);
      
      const body = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        sex: formData.sex,
        birthday: birthdayISO,
        heightFt: formData.heightFt ? Number(formData.heightFt) : null,
        heightIn: formData.heightIn ? Number(formData.heightIn) : null,
        profilePhoto: formData.profilePhoto || undefined,
        measurementSystem: formData.measurementSystem || 'Imperial',
        clientAccess: formData.clientAccess || 'deny',
        groups: formData.groups || [],
        parqStatus: hasAnyParq ? 'COMPLETE' : 'INCOMPLETE',
      };
      
      const res = await fetch(`${API_URL}/profiles`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) { const errBody = await res.json().catch(() => ({})); throw new Error(errBody.message || `Failed to create profile (${res.status})`); }
      setCreateOpen(false); setSignatureModalOpen(false);
      setToast({ message: 'Profile created successfully', type: 'success' });
      await fetchProfiles();
    } catch (err: any) {
      console.error('[createProfile]', err);
      setToast({ message: err.message || 'Failed to create profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ====== ACTION HANDLERS ======
  const handleAssignStaff = async () => {
    if (!selectedProfileId || !assignStaffSelected) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${selectedProfileId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ staffId: assignStaffSelected }) });
      if (!res.ok) throw new Error('Failed to assign staff');
      setToast({ message: 'Staff assigned successfully', type: 'success' });
      setAssignStaffOpen(false); setAssignStaffSelected(''); await fetchProfiles();
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleAssignGroup = async (groupId: string) => {
    if (!selectedProfileId || !groupId) return;
    setSaving(true);
    try {
      const groupObj = availableGroups.find(g => g.id === groupId);
      if (!groupObj) throw new Error('Group not found');
      const pRes = await fetch(`${API_URL}/profiles/${selectedProfileId}`, { headers: authHeaders() });
      if (!pRes.ok) throw new Error('Failed to fetch profile');
      const profileData = await pRes.json();
      const currentGroups = Array.isArray(profileData.groups) ? profileData.groups : [];
      if (!currentGroups.includes(groupObj.name)) currentGroups.push(groupObj.name);
      const res = await fetch(`${API_URL}/profiles/${selectedProfileId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ groups: currentGroups }) });
      if (!res.ok) throw new Error('Failed to assign group');
      setToast({ message: 'Group assigned successfully', type: 'success' });
      setAssignGroupOpen(false); await fetchProfiles();
    } catch (err: any) { setToast({ message: err.message, type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleArchiveProfile = async () => {
    if (!selectedProfileId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${selectedProfileId}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status: 'ARCHIVED' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: 'Profile archived successfully', type: 'success' });
      setArchiveOpen(false); closeActionMenu();
      await fetchProfiles();
    } catch (err: any) { setToast({ message: err.message || 'Archive failed', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfileId) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${selectedProfileId}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: 'Profile deleted successfully', type: 'success' });
      setDeleteOpen(false); closeActionMenu();
      await fetchProfiles();
    } catch (err: any) { setToast({ message: err.message || 'Delete failed', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleSaveInfo = async () => {
    if (!selectedProfile) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${selectedProfile.id}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({
          firstName: infoData.firstName, lastName: infoData.lastName,
          sex: infoData.sex, measurementSystem: infoData.measurementSystem,
          email: infoData.email, phone: infoData.phone,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: 'Profile info updated', type: 'success' });
      await fetchProfiles();
    } catch (err: any) { setToast({ message: err.message || 'Update failed', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleCreateEvent = async () => {
    if (!eventData.name.trim()) { setToast({ message: 'Event name is required', type: 'error' }); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          title: eventData.name.trim(), type: 'WORKOUT',
          date: eventData.date ? new Date(eventData.date).toISOString() : null,
          startTime: eventData.startTime, endTime: eventData.endTime,
          profiles: selectedProfile ? [selectedProfile.id] : [],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: 'Event created successfully', type: 'success' });
      setCreateEventOpen(false);
      setEventData({ name: '', date: '2026-11-03', startTime: '12:00 am', endTime: '12:00 pm', users: '', profiles: [], metrics: '', workout: 'None', note: '' });
    } catch (err: any) { setToast({ message: err.message || 'Failed to create event', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleCreateTask = async () => {
    if (!taskData.title.trim()) { setTaskError('Title is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          title: taskData.title.trim(),
          type: (taskData.type || 'general').toUpperCase(),
          priority: (taskData.priority || 'normal').toUpperCase(),
          description: taskData.description || '',
          assignees: [], profiles: selectedProfile ? [selectedProfile.id] : [],
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: 'Task created successfully', type: 'success' });
      setCreateTaskOpen(false);
      setTaskData({ title: '', type: '', priority: 'Normal', description: '', assignees: '', profiles: [], dueDate: '' });
      setTaskError('');
    } catch (err: any) { setToast({ message: err.message || 'Failed to create task', type: 'error' }); }
    finally { setSaving(false); }
  };

  const handleCreateWorkout = async () => {
    if (!workoutData.name.trim()) { setToast({ message: 'Workout name is required', type: 'error' }); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/workouts`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          name: workoutData.name.trim(),
          duration: workoutData.duration ? String(workoutData.duration) : null,
          access: 'MYSELF', note: workoutData.note || '', programName: null,
          items: droppedElements.map((el, i) => ({
            kind: el.type === 'section' ? 'section' : 'exercise',
            data: { id: Date.now() + i, name: el.label },
          })),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: 'Workout created successfully', type: 'success' });
      setCreateWorkoutOpen(false);
      setWorkoutData({ name: '', duration: '', date: '', note: '' });
      setDroppedElements([]);
    } catch (err: any) { setToast({ message: err.message || 'Failed to create workout', type: 'error' }); }
    finally { setSaving(false); }
  };

  // ============================================================
  // Assign Program
  // ============================================================
  const handleAssignProgram = async () => {
    if (!selectedProfileId) {
      setToast({ message: 'Please select a profile first.', type: 'error' });
      return;
    }
    if (!selectedProgramId) {
      setToast({ message: 'Please select a program.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${selectedProfileId}/programs`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          programId: selectedProgramId,
          startDate: new Date().toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
        throw new Error(message || `Failed to assign program (HTTP ${res.status})`);
      }
      setToast({ message: 'Program assigned successfully', type: 'success' });
      setAssignProgramOpen(false);
      setSelectedProgramId('');
    } catch (err: any) {
      console.error('[assignProgram]', err);
      setToast({ message: err.message || 'Failed to assign program', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Send Form
  // ============================================================
  const handleSendForm = async () => {
    if (!selectedProfileId) {
      setToast({ message: 'Please select a profile first.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${selectedProfileId}/send-form`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ formType: sendFormType || 'PARQ' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
        throw new Error(message || `Failed to send form (HTTP ${res.status})`);
      }
      setToast({ message: 'Form sent successfully', type: 'success' });
      setSendFormOpen(false);
    } catch (err: any) {
      console.error('[sendForm]', err);
      setToast({ message: err.message || 'Failed to send form', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddActivity = async () => {
    if (!selectedProfileId) return;
    if (selectedActivityWorkoutIds.length === 0) {
      setToast({ message: 'Please select at least one workout.', type: 'error' });
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${selectedProfileId}/activities`, {
        method: 'POST', 
        headers: authHeaders(),
        body: JSON.stringify({ 
          type: 'WORKOUT', 
          date: new Date().toISOString(),
          workoutIds: selectedActivityWorkoutIds,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to add activity');
      }
      
      setToast({ message: 'Activity added successfully', type: 'success' });
      setAddActivityOpen(false);
      setSelectedActivityWorkoutIds([]); // Clear selection
    } catch (err: any) { 
      setToast({ message: err.message || 'Failed to add activity', type: 'error' }); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleSaveNotepad = async () => {
    if (!selectedProfile) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/profiles/${selectedProfile.id}/notepad`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ text: notepadText }),
      });
      setToast({ message: 'Notepad saved successfully', type: 'success' });
    } catch {
      localStorage.setItem(`notepad_${selectedProfile.id}`, notepadText);
      setToast({ message: 'Notepad saved locally', type: 'success' });
    } finally { setSaving(false); }
  };

  const handleCreateNote = async () => {
    if (!newNoteText.trim() || !selectedProfile) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profiles/${selectedProfile.id}/notes`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ text: newNoteText.trim() }),
      });
      if (res.ok) {
        const saved = await res.json();
        setJournalNotes([...journalNotes, { text: saved.text, date: new Date().toLocaleDateString() }]);
      } else {
        setJournalNotes([...journalNotes, { text: newNoteText, date: new Date().toLocaleDateString() }]);
      }
      setToast({ message: 'Note created successfully', type: 'success' });
    } catch {
      setJournalNotes([...journalNotes, { text: newNoteText, date: new Date().toLocaleDateString() }]);
      setToast({ message: 'Note saved locally', type: 'success' });
    } finally { setCreateNoteOpen(false); setNewNoteText(''); setSaving(false); }
  };

  // ====== ACCOUNT SAVE ======
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
      setErrors({}); setSavingInfo(true);
      await new Promise((r) => setTimeout(r, 400));
      const updatedUser = { ...(user as any), name: `${firstName} ${lastName}`.trim(), email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (newPassword) localStorage.setItem('user_password', newPassword);
      setNewPassword(''); setConfirmPassword(''); setSavingInfo(false);
      setToast({ message: 'User info saved successfully', type: 'success' });
    } else {
      if (!companyName.trim()) errs.companyName = 'Company name is required';
      if (!phone.trim()) errs.phone = 'Phone is required';
      if (Object.keys(errs).length > 0) { setErrors(errs); setToast({ message: 'Please fix the highlighted fields', type: 'error' }); return; }
      setErrors({}); setSavingInfo(true);
      await new Promise((r) => setTimeout(r, 400));
      localStorage.setItem('business_info', JSON.stringify({ companyName: companyName.trim(), phone: phone.trim(), address: address.trim(), city: city.trim(), state: stateName.trim(), zipCode: zipCode.trim(), website: website.trim() }));
      setSavingInfo(false);
      setToast({ message: 'Business info saved successfully', type: 'success' });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setToast({ message: 'File too large. Max 5MB.', type: 'error' }); return; }
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
    localStorage.setItem('account_settings', JSON.stringify({ primaryColor, accountLogo, integrations, measurementSystem, metricsData, testingData, resultsData }));
    if (user?.role !== 'ADMIN') { setToast({ message: 'Settings saved', type: 'success' }); return; }
    try {
      const res = await fetch(`${API_URL}/privileges`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(privileges) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || 'Failed to save privileges'); }
      setToast({ message: 'Privileges saved', type: 'success' });
    } catch (err: any) { setToast({ message: err.message || 'Failed to save privileges', type: 'error' }); }
  };
  const handleTogglePrivilege = (rowId: string, role: 'admin' | 'supervisor' | 'staff') => {
    setPrivileges((prev) => {
      const currentRow = prev[rowId];
      const newRow = { ...currentRow };
      if (role === 'admin') {
        newRow.admin = !currentRow.admin;
        if (!newRow.admin) { newRow.supervisor = false; newRow.staff = false; setToast({ message: 'Privilege removed for all roles', type: 'success' }); }
        else setToast({ message: 'Privilege added for Admin', type: 'success' });
      } else {
        newRow[role] = !currentRow[role];
        setToast({ message: newRow[role] ? `Privilege added for ${role}` : `Privilege removed for ${role}`, type: 'success' });
      }
      return { ...prev, [rowId]: newRow };
    });
  };
  const can = (key: string): boolean => {
    if (!user) return false;
    const roleKey = (user.role || '').toLowerCase() as 'admin' | 'supervisor' | 'staff';
    return privileges?.[key]?.[roleKey] === true;
  };

  // ====== FILTERING ======
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (activeTab === 'Active' && p.status !== 'ACTIVE') return false;
      if (activeTab === 'Unassigned' && p.status !== 'UNASSIGNED') return false;
      if (activeTab === 'Archived' && p.status !== 'ARCHIVED') return false;
      if (activeTab === 'Template' && p.status !== 'TEMPLATE') return false;
      if (groupFilter !== 'all' && (!p.groups || !p.groups.includes(groupFilter))) return false;
      if (staffFilter !== 'all' && p.staffId !== staffFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [profiles, activeTab, groupFilter, staffFilter, searchQuery]);

  const totalItems = filteredProfiles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedProfiles = filteredProfiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const unreadCount = unreadConversations.length;

  const filteredMessageProfiles = useMemo(() => {
    if (!messagesSearch.trim()) return profiles;
    const q = messagesSearch.toLowerCase();
    return profiles.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  }, [profiles, messagesSearch]);

  // ====== DRAG & DROP ======
  const handleDragStart = (e: React.DragEvent, type: string, label: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, label }));
    e.dataTransfer.effectAllowed = 'copy';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDraggingOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDraggingOver(false);
    const dataStr = e.dataTransfer.getData('text/plain');
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        setDroppedElements(prev => [...prev, { id: Math.random().toString(36).slice(2, 11), type: data.type, label: data.label }]);
        setToast({ message: `${data.label} added to workout`, type: 'success' });
      } catch {}
    }
  };

  // ====== RENDER GUARD ======
  if (loading || !user || !currentWeekStart) {
    return <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;
  }
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex relative overflow-hidden">
      {/* TOAST */}
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

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col h-screen transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden bg-amber-600">
            {accountLogo ? <img src={accountLogo} alt="Logo" className="w-full h-full object-cover" /> : !logoError ? <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" onError={() => setLogoError(true)} /> : <span className="text-white text-sm font-bold">{getInitials(user.name)}</span>}
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
            <button onClick={() => toggleSection('home')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">Home<svg className={`w-3 h-3 transition-transform ${openSections.home ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
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
            <button onClick={() => toggleSection('organization')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">Organization<svg className={`w-3 h-3 transition-transform ${openSections.organization ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
            {openSections.organization && (
              <nav className="px-3 pt-1 space-y-0.5">
                <NavLink href="/profiles" label="Profiles" active icon={<IconProfiles />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/users" label="Users" icon={<IconUser />} onClick={() => setIsSidebarOpen(false)} />
                <NavLink href="/groups" label="Groups" icon={<IconGroup />} onClick={() => setIsSidebarOpen(false)} />
              </nav>
            )}
          </div>
          <div className="mb-2">
            <button onClick={() => toggleSection('library')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">Library<svg className={`w-3 h-3 transition-transform ${openSections.library ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
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
            <button onClick={() => toggleSection('analytics')} className="w-full flex items-center justify-between px-6 py-1.5 text-[10px] font-bold text-gray-400 tracking-wider uppercase hover:text-gray-600">Analytics<svg className={`w-3 h-3 transition-transform ${openSections.analytics ? '' : '-rotate-90'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg></button>
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

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden h-screen min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-500 hover:text-gray-700 lg:hidden" aria-label="Open menu">
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
                    <button onClick={() => { setAccountMenuOpen(false); setView('profiles'); setSelectedProfile(null); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" /></svg>
                      <span>Switch to Classic</span>
                    </button>
                    <button onClick={() => { setAccountMenuOpen(false); setView('account-info'); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span>Account Info</span>
                    </button>
                    <button onClick={() => { setAccountMenuOpen(false); setView('account-settings'); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
                      <svg className="w-[18px] h-[18px] text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span>Account Settings</span>
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

        {/* PROFILES LIST VIEW */}
        {view === 'profiles' && !selectedProfile && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard number={stats.missingParq} label="Missing PAR-Q" />
              <StatCard number={stats.noMetrics} label="No Metrics" />
              <StatCard number={stats.overdueMetrics} label="Overdue Metrics" />
              <StatCard number={stats.noGoals} label="No Goals" />
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Profiles</h1>
                <p className="text-sm text-gray-500">Manage and track your member profiles and progress.</p>
              </div>
              {can('create_profiles') && (
                <button onClick={openCreateModal} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Create Profile
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mt-6">
              <div className="px-4 md:px-6 py-4 flex items-center gap-3 overflow-x-auto border-b border-gray-100">
                <div className="flex items-center gap-1 flex-shrink-0">
                  {['Active', 'Unassigned', 'Archived', 'Template', 'All'].map((tab) => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                      className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap ${activeTab === tab ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                  <div className="relative" ref={groupMenuRef}>
                    <button onClick={() => setGroupMenuOpen(!groupMenuOpen)} className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-sm border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 bg-white font-medium whitespace-nowrap">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      {groupFilter === 'all' ? 'Group' : groupFilter}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {groupMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                        <button onClick={() => { setGroupFilter('all'); setGroupMenuOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${groupFilter === 'all' ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>All Groups</button>
                        {availableGroups.map((g) => (
                          <button key={g.id} onClick={() => { setGroupFilter(g.name); setGroupMenuOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${groupFilter === g.name ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>{g.name}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={staffMenuRef}>
                    <button onClick={() => setStaffMenuOpen(!staffMenuOpen)} className="flex items-center gap-1.5 px-3 md:px-4 py-2 text-sm border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 bg-white font-medium whitespace-nowrap">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      {staffFilter === 'all' ? 'Staff' : (staffOptions.find(s => s.id === staffFilter)?.name || 'Staff')}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {staffMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                        <button onClick={() => { setStaffFilter('all'); setStaffMenuOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${staffFilter === 'all' ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>All Staff</button>
                        {staffOptions.map((s) => (
                          <button key={s.id} onClick={() => { setStaffFilter(s.id); setStaffMenuOpen(false); setCurrentPage(1); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${staffFilter === s.id ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>{s.name}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-40 md:w-64 outline-none focus:border-[#1a73e8]" />
                  </div>

                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-gray-200 rounded-md px-2 md:px-3 py-2 outline-none bg-white font-medium">
                    <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/40">
                      <th className="px-4 md:px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></th>
                      <th className="px-4 py-3 font-medium text-xs">Name <span className="text-[#1a73e8]">▲</span></th>
                      <th className="px-4 py-3 font-medium text-xs">Age</th>
                      <th className="px-4 py-3 font-medium text-xs">Staff</th>
                      <th className="px-4 py-3 font-medium text-xs">PAR-Q</th>
                      <th className="px-4 py-3 font-medium text-xs">Last Tested</th>
                      <th className="px-4 py-3 font-medium text-xs">Next Goal</th>
                      <th className="px-4 py-3 font-medium text-xs">Overdue</th>
                      <th className="px-4 py-3 font-medium text-xs">Email</th>
                      <th className="px-4 md:px-6 py-3 font-medium text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading && profiles.length === 0 ? (
                      <tr><td colSpan={10} className="px-6 py-16 text-center text-gray-400 text-sm">Loading profiles...</td></tr>
                    ) : paginatedProfiles.length === 0 ? (
                      <tr><td colSpan={10} className="px-6 py-16 text-center text-gray-400 text-sm">No profiles found matching your filters.</td></tr>
                    ) : (
                      paginatedProfiles.map((p) => (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 md:px-6 py-4"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => selectProfile(p)}>
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0 overflow-hidden">
                                {p.profilePhoto ? <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover" /> : getInitials(p.name)}
                              </div>
                              <span className="font-medium text-[#1a73e8] hover:underline">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{p.age || '—'}</td>
                          <td className="px-4 py-4 text-gray-600">{p.staff || '—'}</td>
                          <td className="px-4 py-4">
                            {p.parq === 'Complete' ? (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Complete</span>
                            ) : (
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">Incomplete</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-gray-600">{p.lastTested || 'Never'}</td>
                          <td className="px-4 py-4 text-gray-600">{p.nextGoal || '—'}</td>
                          <td className="px-4 py-4 text-gray-600 text-center">{p.overdueMetrics ?? 0}</td>
                          <td className="px-4 py-4 text-gray-500 text-xs max-w-[200px] truncate">{p.email || '—'}</td>
                          <td className="px-4 md:px-6 py-4 text-right">
                            <div className="relative inline-block">
                              <button onClick={() => openActionMenu(p.id)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

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

        {/* SINGLE PROFILE VIEW */}
        {view === 'profiles' && selectedProfile && (
          <div className="flex-1 overflow-y-auto bg-[#f7f8fa]">
            <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4 md:pb-6 bg-white border-b border-gray-200">
              <div className="flex items-start gap-3 md:gap-4">
                <button onClick={() => setSelectedProfile(null)} className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition flex-shrink-0 mt-1 md:mt-2">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center min-w-0">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-lg md:text-2xl font-semibold overflow-hidden flex-shrink-0">
                      {selectedProfile.profilePhoto ? <img src={selectedProfile.profilePhoto} className="w-full h-full object-cover" alt="" /> : getInitials(selectedProfile.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                        <h1 className="text-xl md:text-[28px] font-bold text-gray-900 truncate">{selectedProfile.name}</h1>
                        <span className="text-[10px] md:text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{selectedProfile.status}</span>
                      </div>
                      <p className="text-[13px] md:text-[15px] text-gray-600">{selectedProfile.sex} {selectedProfile.age ? `Age: ${selectedProfile.age}` : ''}</p>
                      <p className="text-[12px] md:text-[13px] text-gray-500 truncate">{selectedProfile.email}</p>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full min-w-0">
                    <div className="bg-white rounded-xl border border-gray-200 px-3 md:px-5 py-3 md:py-4 flex flex-col justify-center">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">23.0</p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5 md:mt-1">Kg Weight</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-3 md:px-5 py-3 md:py-4 flex flex-col justify-center">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">—</p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5 md:mt-1">% Body Fat</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-3 md:px-5 py-3 md:py-4 flex flex-col justify-center">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">—</p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5 md:mt-1">Vo2max</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-3 md:px-5 py-3 md:py-4 flex flex-col justify-center">
                      <p className="text-lg md:text-2xl font-bold text-gray-900">—</p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5 md:mt-1">Squat Deviations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-8 py-3 md:py-4 bg-white border-b border-gray-200">
              <div className="bg-gray-50 rounded-lg px-3 md:px-4 py-2 md:py-3 text-[12px] md:text-sm text-gray-700 flex items-center gap-2 font-medium mb-3 md:mb-4">
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Take the tour
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {['Overview', 'Testing', 'Goals', 'Metrics', 'Programs', 'Reports', 'Calendar', 'Tasks', 'Messages', 'Notes', 'Files', 'Info'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setProfileTab(tab)}
                    className={`px-4 md:px-5 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium rounded-full transition whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${profileTab === tab ? 'bg-[#1a73e8] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 md:p-8 max-w-7xl mx-auto">
              {/* ===== OVERVIEW ===== */}
              {profileTab === 'Overview' && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 flex flex-col">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <h3 className="text-[15px] md:text-[16px] font-semibold text-gray-900">Progress Photos</h3>
                        </div>
                        <input type="file" accept="image/*" ref={addPhotoInputRef} onChange={handleAddPhotoChange} className="hidden" />
                        <button onClick={handleAddPhotoClick} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 md:py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap">
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                          Add Photo
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 flex-1">
                        {progressPhotos.length > 0 ? (
                          progressPhotos.map((photo, index) => (
                            <div key={index} className="bg-gray-100 rounded-xl overflow-hidden relative" style={{ minHeight: '240px' }}>
                              <img src={photo.url} className="w-full h-full object-cover" alt="Progress" />
                              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{photo.date}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-gray-100 rounded-xl overflow-hidden relative" style={{ minHeight: '240px' }}>
                            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=300&auto=format&fit=crop" className="w-full h-full object-cover" alt="Progress" />
                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">10/10/2026</div>
                          </div>
                        )}
                        <div className="bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition" onClick={handleAddPhotoClick} style={{ minHeight: '240px' }}>
                          <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
                      <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        <h3 className="text-[15px] md:text-[16px] font-semibold text-gray-900">Profile Checklist</h3>
                      </div>
                      <div className="space-y-2.5 md:space-y-3">
                        {['Create New Profile', 'Add First Measurements', 'Add First Progress Photo'].map((item) => (
                          <div key={item} className="flex items-center justify-between p-3 md:p-4 bg-emerald-50 rounded-xl text-emerald-800 font-medium text-xs md:text-sm">
                            {item}
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        ))}
                        <div className="flex items-center justify-between p-3 md:p-4 bg-red-50 rounded-xl text-red-600 font-medium text-xs md:text-sm border border-red-100">
                          Add First Goal
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <div className="flex items-center justify-between p-3 md:p-4 bg-emerald-50 rounded-xl text-emerald-800 font-medium text-xs md:text-sm">
                          Print First Report
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 mt-6 md:mt-8">
                    <div className="bg-[#eff5ff] border border-[#dbeafe] rounded-xl p-3 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-[13px] md:text-[15px] text-[#1e3a8a] font-medium">Viewing metrics. To enter or update measurement data, go to the Testing tab.</p>
                      <button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs md:text-sm font-medium px-4 md:px-6 py-2 md:py-2.5 rounded-lg transition whitespace-nowrap" onClick={() => setProfileTab('Testing')}>Go to Testing</button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8">
                      <div className="flex gap-4 md:gap-6 border-b border-gray-200 pb-3 md:pb-4 mb-4 md:mb-6 overflow-x-auto">
                        {['Basic Data', 'Internal Health', 'Body Composition', 'Cardiovascular', 'Biomechanics', 'Strength', 'Endurance', 'Power'].map(t => (
                          <button key={t} className={`text-[13px] md:text-[15px] font-medium whitespace-nowrap pb-3 md:pb-4 -mb-[13px] md:-mb-[17px] border-b-2 ${t === 'Basic Data' ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>{t}</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mb-4 md:mb-6">
                        <div className="w-6 md:w-8 h-0.5 bg-[#1a73e8]"></div>
                        <span className="text-[12px] md:text-[14px] font-medium text-[#1a73e8]">Value</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <div className="border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition cursor-pointer group">
                          <div className="flex items-start justify-between">
                            <div><p className="text-2xl md:text-[32px] font-bold text-gray-900">23</p><p className="text-[13px] md:text-[15px] font-semibold text-gray-800 mt-1 md:mt-2">Weight</p></div>
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-gray-500 transition mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                          <p className="text-[11px] md:text-[13px] text-gray-400 mt-8 md:mt-12">10/10/2026</p>
                        </div>
                        <div className="border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition cursor-pointer group">
                          <div className="flex items-start justify-between">
                            <div><p className="text-2xl md:text-[32px] font-bold text-gray-900">-135</p><p className="text-[13px] md:text-[15px] font-semibold text-gray-800 mt-1 md:mt-2 leading-tight">Metabolic Rate: Harris-Benedict</p></div>
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-gray-500 transition mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                          <p className="text-[11px] md:text-[13px] text-gray-400 mt-6 md:mt-8">10/10/2026</p>
                        </div>
                        <div className="border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition cursor-pointer group">
                          <div className="flex items-start justify-between">
                            <div><p className="text-2xl md:text-[32px] font-bold text-gray-400">—</p><p className="text-[13px] md:text-[15px] font-semibold text-gray-800 mt-1 md:mt-2 leading-tight">Metabolic Rate: Result</p></div>
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-gray-500 transition mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                      <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                          <div className="flex items-center gap-2 md:gap-3">
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <h3 className="text-[15px] md:text-[18px] font-semibold text-gray-900">High Priority Metrics</h3>
                          </div>
                        </div>
                        <div className="bg-[#f8fafc] rounded-xl py-10 md:py-14 flex items-center justify-center">
                          <p className="text-gray-400 font-medium text-[13px] md:text-[16px]">No high priority metrics.</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8">
                        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                          <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          <h3 className="text-[15px] md:text-[18px] font-semibold text-gray-900">Circumferences <span className="text-gray-400 font-normal">(Male)</span></h3>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div className="space-y-4 md:space-y-6 flex-1 w-full">
                            {['Neck', 'Chest', 'Waist', 'Hip'].map((label) => (
                              <div key={label} className="flex justify-between items-end border-b border-gray-100 pb-1">
                                <span className="text-[13px] md:text-[15px] text-gray-700">{label}:</span>
                                <span className="text-[13px] md:text-[15px] font-medium text-gray-900">0.00</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex-shrink-0 w-32 md:w-36 flex items-center justify-center">
                            <svg viewBox="0 0 100 220" className="w-full h-auto text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M50,15 C53,15 57,18 57,22 C57,26 53,29 50,29 C47,29 43,26 43,22 C43,18 47,15 50,15 Z" />
                              <path d="M50,30 L50,35" />
                              <path d="M50,35 C40,35 32,40 32,50 L30,70 C30,75 32,80 35,85 L38,95 C38,100 40,105 40,110 L40,150 C40,155 38,165 38,170 L38,200 C38,205 42,205 43,200 L45,170 C46,165 48,160 50,160 C52,160 54,165 55,170 L57,200 C58,205 62,205 62,200 L62,170 C62,165 60,155 60,150 L60,110 C60,105 62,100 62,95 L65,85 C68,80 70,75 70,70 L68,50 C68,40 60,35 50,35 Z" />
                              <path d="M32,50 L20,90 C18,95 22,100 25,95 L38,60" />
                              <path d="M68,50 L80,90 C82,95 78,100 75,95 L62,60" />
                            </svg>
                          </div>
                          <div className="space-y-4 md:space-y-6 flex-1 w-full text-right">
                            {['Bicep', 'Forearm', 'Thigh', 'Calf'].map((label) => (
                              <div key={label} className="flex justify-between items-end border-b border-gray-100 pb-1 flex-row-reverse">
                                <span className="text-[13px] md:text-[15px] text-gray-700">{label}:</span>
                                <span className="text-[13px] md:text-[15px] font-medium text-gray-900">0.00</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TESTING ===== */}
              {profileTab === 'Testing' && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Testing</h2>
                  <div className="inline-flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100 w-full max-w-3xl overflow-x-auto">
                    {['Weight Loss', 'Stabilization', 'Endurance', 'Strength', 'Power'].map(t => (
                      <button key={t} onClick={() => setTestingTab(t)} className={`px-3 md:px-6 py-2 md:py-2.5 text-[12px] md:text-[14px] font-medium rounded-lg transition whitespace-nowrap flex-shrink-0 ${testingTab === t ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>{t}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6">
                    <div className="relative testing-date-container">
                      <button onClick={() => setTestingDateOpen(!testingDateOpen)} className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-200 rounded-full text-[12px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition bg-white">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {testingDate}
                      </button>
                      {testingDateOpen && (
                        <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100"><p className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">Test Date</p></div>
                          <div className="p-4">
                            <input type="date" onChange={(e) => { if (e.target.value) { const [y, m, d] = e.target.value.split('-'); setTestingDate(`${m}/${d}/${y}`); setTestingDateOpen(false); } }} className="w-full h-11 px-4 border border-gray-200 rounded-xl text-[14px] outline-none" />
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => setUpdateMetricsOpen(true)} className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-200 rounded-full text-[12px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition bg-white">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Update Metrics
                    </button>
                    <div className="relative print-menu-container">
                      <button onClick={() => setPrintMenuOpen(!printMenuOpen)} className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-200 rounded-full text-[12px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition bg-white">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print
                      </button>
                      {printMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                          <button className="w-full text-left px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50">Progress Reports</button>
                          <button className="w-full text-left px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50">Testing cards</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-8 md:space-y-10">
                    {[
                      { section: 'BASIC DATA', rows: [
                        { label: 'Weight (kg)', recent: '23.00', type: '0.0' },
                        { label: 'Systolic Blood Pressure (mmHg)', recent: '—', type: '0' },
                        { label: 'Diastolic Blood Pressure (mmHg)', recent: '—', type: '0' },
                        { label: 'Resting Heart Rate (bpm)', recent: '—', type: '0' },
                      ]},
                      { section: 'BODY FAT %', rows: [
                        { label: 'Bicep Skinfold (mm)', recent: '—', type: '0' },
                        { label: 'Tricep Skinfold (mm)', recent: '—', type: '0' },
                        { label: 'B.I.A. (%)', recent: '—', type: '0.0' },
                      ]},
                      { section: 'CIRCUMFERENCES', rows: [
                        { label: 'Neck Circumference (cm)', recent: '—', type: '0.0' },
                        { label: 'Chest Circumference (cm)', recent: '—', type: '0.0' },
                        { label: 'Waist Circumference (cm)', recent: '—', type: '0.0' },
                        { label: 'Hip Circumference (cm)', recent: '—', type: '0.0' },
                      ]},
                    ].map(({ section, rows }) => (
                      <div key={section}>
                        <h3 className="text-[12px] md:text-[13px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-2 md:mb-3">
                          <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#1a73e8]"></span> {section}
                        </h3>
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                          <table className="w-full text-left min-w-[600px]">
                            <thead>
                              <tr className="border-b border-gray-100 bg-[#f8fafc]">
                                <th className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[15px] font-medium text-gray-700 w-1/3">Metric</th>
                                <th className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[15px] font-medium text-gray-700">Recent</th>
                                <th className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[15px] font-medium text-gray-700">New</th>
                                <th className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[15px] font-medium text-gray-700 text-center">Note</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, idx) => (
                                <tr key={idx} className="border-b border-gray-50 last:border-0">
                                  <td className="py-3 md:py-5 px-3 md:px-6 text-[13px] md:text-[15px] font-medium text-gray-900">{row.label}</td>
                                  <td className="py-3 md:py-5 px-3 md:px-6 text-[13px] md:text-[15px] text-gray-600">{row.recent}</td>
                                  <td className="py-3 md:py-5 px-3 md:px-6">
                                    <input type="text" placeholder={row.type} className="w-full max-w-[160px] h-10 md:h-11 px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8]" />
                                  </td>
                                  <td className="py-3 md:py-5 px-3 md:px-6 text-center">
                                    <button onClick={() => { setSelectedMetricForNote(row.label); setCreateTestNoteOpen(true); }} className="text-gray-400 hover:text-gray-700">
                                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== GOALS ===== */}
              {profileTab === 'Goals' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3">
                    <h2 className="text-xl md:text-[28px] font-bold text-gray-900">Goals</h2>
                    <button onClick={() => setToast({ message: 'Goals refreshed', type: 'success' })} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 text-[13px] md:text-[15px] font-medium px-4 md:px-5 py-2 md:py-2.5 rounded-full flex items-center gap-2 transition shadow-sm">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Refresh
                    </button>
                  </div>
                  <h3 className="text-[12px] md:text-[13px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mt-6 md:mt-8 mb-3 md:mb-4">
                    <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#1a73e8]"></span> BASIC DATA
                  </h3>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/20">
                          <th className="py-3 md:py-5 px-4 md:px-8 text-[13px] md:text-[15px] font-semibold text-gray-800">Assessment</th>
                          <th className="py-3 md:py-5 px-4 md:px-8 text-[13px] md:text-[15px] font-semibold text-gray-800">Recent Result</th>
                          <th className="py-3 md:py-5 px-4 md:px-8 text-[13px] md:text-[15px] font-semibold text-gray-800">Classification</th>
                          <th className="py-3 md:py-5 px-4 md:px-8 text-[13px] md:text-[15px] font-semibold text-gray-800">Goal Date</th>
                          <th className="py-3 md:py-5 px-4 md:px-8 text-[13px] md:text-[15px] font-semibold text-gray-800">Goal Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'weight', label: 'Weight', code: 'WEIGHT', value: '23.00' },
                          { key: 'metabolic', label: 'Metabolic Rate', code: 'RMR', value: '-135' },
                          { key: 'metabolic_harris', label: 'Metabolic Rate: Harris-Benedict', code: 'RMR HARRIS BENEDICT', value: '-135' },
                        ].map(({ key, label, code, value }) => (
                          <tr key={key} className="border-b border-gray-100 hover:bg-gray-50/30 last:border-0">
                            <td className="py-4 md:py-6 px-4 md:px-8">
                              <p className="text-[14px] md:text-[16px] font-medium text-gray-900">{label}</p>
                              <p className="text-[10px] md:text-[12px] text-gray-400 font-medium mt-1 uppercase tracking-wide">{code}</p>
                            </td>
                            <td className="py-4 md:py-6 px-4 md:px-8">
                              <p className="text-[14px] md:text-[16px] font-medium text-gray-900">{value}</p>
                              <p className="text-[11px] md:text-[13px] text-gray-400 mt-1">10/10/2026</p>
                            </td>
                            <td className="py-4 md:py-6 px-4 md:px-8 text-gray-400 font-medium">—</td>
                            <td className="py-4 md:py-6 px-4 md:px-8 relative goal-date-container">
                              <div className="relative">
                                <div onClick={() => setGoalDatePickerOpen(goalDatePickerOpen === key ? null : key)} className="w-full max-w-[180px] h-10 md:h-11 pl-9 md:pl-10 pr-3 md:pr-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] flex items-center cursor-pointer text-gray-500 bg-white">
                                  {goalDates[key] || "MM / DD / YYYY"}
                                </div>
                                {goalDatePickerOpen === key && (
                                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3">
                                    <input type="date" onChange={(e) => { if (e.target.value) { const [y, m, d] = e.target.value.split('-'); setGoalDates({ ...goalDates, [key]: `${m}/${d}/${y}` }); setGoalDatePickerOpen(null); } }} className="w-full h-11 px-4 border border-gray-200 rounded-xl text-[14px] outline-none" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 md:py-6 px-4 md:px-8">
                              <input type="text" className="w-full max-w-[120px] h-10 md:h-11 px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8]" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== METRICS ===== */}
              {profileTab === 'Metrics' && (
                <div className="space-y-6">
                  <div className="bg-[#eff5ff] border border-[#dbeafe] rounded-xl p-3 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-[13px] md:text-[15px] text-[#1e3a8a] font-medium">Viewing metrics. To enter or update measurement data, go to the Testing tab.</p>
                    <button className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs md:text-sm font-medium px-4 md:px-6 py-2 md:py-2.5 rounded-lg transition whitespace-nowrap" onClick={() => setProfileTab('Testing')}>Go to Testing</button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8">
                    <div className="flex gap-4 md:gap-6 border-b border-gray-200 pb-3 md:pb-4 mb-4 md:mb-6 overflow-x-auto">
                      {['Basic Data', 'Internal Health', 'Body Composition', 'Cardiovascular', 'Biomechanics', 'Strength', 'Endurance', 'Power', 'Senior'].map(t => (
                        <button key={t} onClick={() => setMetricsTab(t)} className={`text-[13px] md:text-[15px] font-medium whitespace-nowrap pb-3 md:pb-4 -mb-[13px] md:-mb-[17px] border-b-2 transition ${metricsTab === t ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>{t}</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                      <div className="w-6 md:w-8 h-0.5 bg-[#1a73e8]"></div>
                      <span className="text-[12px] md:text-[14px] font-medium text-[#1a73e8]">Value</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {metricsTab === 'Basic Data' && (
                        <>
                          <div className="border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition cursor-pointer group">
                            <div className="flex items-start justify-between">
                              <div><p className="text-2xl md:text-[32px] font-bold text-gray-900">23</p><p className="text-[13px] md:text-[15px] font-semibold text-gray-800 mt-1 md:mt-2">Weight</p></div>
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-gray-500 transition mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <p className="text-[11px] md:text-[13px] text-gray-400 mt-8 md:mt-12">10/10/2026</p>
                          </div>
                          <div className="border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition cursor-pointer group">
                            <div className="flex items-start justify-between">
                              <div><p className="text-2xl md:text-[32px] font-bold text-gray-900">-135</p><p className="text-[13px] md:text-[15px] font-semibold text-gray-800 mt-1 md:mt-2 leading-tight">Metabolic Rate</p></div>
                              <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-gray-500 transition mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <p className="text-[11px] md:text-[13px] text-gray-400 mt-6 md:mt-8">10/10/2026</p>
                          </div>
                        </>
                      )}
                      {metricsTab !== 'Basic Data' && [1,2,3,4].map((i) => (
                        <div key={i} className="border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition cursor-pointer group">
                          <div className="flex items-start justify-between">
                            <div><p className="text-2xl md:text-[32px] font-bold text-gray-400">—</p><p className="text-[13px] md:text-[15px] font-semibold text-gray-800 mt-1 md:mt-2 leading-tight">{metricsTab} metric {i}</p></div>
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-gray-500 transition mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== REPORTS ===== */}
              {profileTab === 'Reports' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl md:text-[28px] font-bold text-gray-900">Reports</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        All reports saved on the Reports page. Click Print to open a print-ready PDF.
                      </p>
                    </div>
                    <button
                      onClick={() => fetchReportsForProfile(selectedProfile.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#1a73e8] border border-gray-200 rounded-full hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[700px]">
                        <thead>
                          <tr className="border-b border-gray-100 bg-[#f8fafc]">
                            <th className="py-5 px-6 text-[14px] font-medium text-gray-700">Category</th>
                            <th className="py-5 px-6 text-[14px] font-medium text-gray-700">Report Name</th>
                            <th className="py-5 px-6 text-[14px] font-medium text-gray-700">Created</th>
                            <th className="py-5 px-6 text-[14px] font-medium text-gray-700 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loadingReports ? (
                            <tr><td colSpan={4} className="py-8 text-center text-gray-400">Loading reports...</td></tr>
                          ) : reportsList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-14 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-6m3 6V9m3 8v-3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <p className="text-gray-600 font-medium">No reports saved yet.</p>
                                  <p className="text-gray-400 text-sm max-w-md px-4">
                                    Reports created on the Reports page will appear here automatically.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            reportsList.map((r, i) => (
                              <tr key={r.id || i} className="border-b border-gray-100 hover:bg-gray-50/30 last:border-0">
                                <td className="py-5 px-6 text-[15px] text-gray-600 font-medium">
                                  {r.data?.reportType || r.type || 'General'}
                                </td>
                                <td className="py-5 px-6 text-[15px] text-gray-900 font-medium">
                                  {r.name || 'Untitled report'}
                                </td>
                                <td className="py-5 px-6 text-[15px] text-gray-600">
                                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                                </td>
                                <td className="py-5 px-6 text-right">
                                  <button
                                    onClick={() => printReportExternal(r)}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#1a73e8]/20 text-[#1a73e8] rounded-xl text-[14px] font-medium hover:bg-blue-50 transition"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print / Save PDF
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== CALENDAR ===== */}
              {profileTab === 'Calendar' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-[28px] font-bold text-gray-900">Calendar</h2>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-3 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                      <div className="inline-flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
                        <button onClick={() => setCalendarView('Calendar')} className={`px-3 md:px-5 py-2 text-[12px] md:text-[14px] font-medium rounded-lg transition ${calendarView === 'Calendar' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>Calendar</button>
                        <button onClick={() => setCalendarView('Agenda')} className={`px-3 md:px-5 py-2 text-[12px] md:text-[14px] font-medium rounded-lg transition ${calendarView === 'Agenda' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>Agenda</button>
                      </div>
                      <button onClick={() => setCreateEventOpen(true)} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[13px] md:text-[15px] font-medium px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Create Event
                      </button>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-x-auto">
                      <div className="min-w-[700px]">
                        <div className="grid grid-cols-8 bg-[#f8fafc] border-b border-gray-100">
                          <div className="py-3 md:py-4 px-2 border-r border-gray-100"></div>
                          {['Sun 11/1', 'Mon 11/2', 'Tue 11/3', 'Wed 11/4', 'Thu 11/5', 'Fri 11/6', 'Sat 11/7'].map((d, i) => (
                            <div key={d} className={`py-3 md:py-4 px-2 text-center text-[11px] md:text-[14px] font-medium text-gray-700 border-r border-gray-100 last:border-r-0 ${i === 2 ? 'bg-[#f0f4f8]' : ''}`}>{d}</div>
                          ))}
                        </div>
                        {['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM'].map((time) => (
                          <div key={time} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0 h-20 md:h-24">
                            <div className="py-3 px-2 md:px-4 text-right text-[11px] md:text-[12px] text-gray-400 border-r border-gray-100">{time}</div>
                            {Array.from({ length: 7 }).map((_, i) => (
                              <div key={i} className={`border-r border-gray-100 last:border-r-0 ${i === 2 ? 'bg-[#f8fafc]/50' : ''}`}></div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TASKS ===== */}
              {profileTab === 'Tasks' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl md:text-[28px] font-bold text-gray-900">Tasks</h2>
                    <button onClick={() => setCreateTaskOpen(true)} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[13px] md:text-[15px] font-medium px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                      Create task
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <div className="relative status-menu-container">
                          <button onClick={() => { setStatusMenuOpen(!statusMenuOpen); setTypeMenuOpen(false); }} className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-200 rounded-full text-[12px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition">
                            Status: {taskStatusFilter === 'all' ? 'All' : taskStatusFilter}
                          </button>
                          {statusMenuOpen && (
                            <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                              {['all', 'open', 'completed', 'overdue'].map(s => (
                                <button key={s} onClick={() => { setTaskStatusFilter(s); setStatusMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[14px] capitalize hover:bg-gray-50 ${taskStatusFilter === s ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>{s === 'all' ? 'All Status' : s}</button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative type-menu-container">
                          <button onClick={() => { setTypeMenuOpen(!typeMenuOpen); setStatusMenuOpen(false); }} className="flex items-center gap-2 px-3 md:px-4 py-2 border border-gray-200 rounded-full text-[12px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition">
                            Type: {taskTypeFilter === 'all' ? 'All' : taskTypeFilter}
                          </button>
                          {typeMenuOpen && (
                            <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                              {['all', 'general', 'assessment'].map(t => (
                                <button key={t} onClick={() => { setTaskTypeFilter(t); setTypeMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-[14px] capitalize hover:bg-gray-50 ${taskTypeFilter === t ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>{t === 'all' ? 'All Types' : t}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[700px]">
                        <thead>
                          <tr className="border-b border-gray-100 bg-[#f8fafc]">
                            <th className="py-4 md:py-5 px-3 md:px-6 w-16"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></th>
                            <th className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-700">Task Name</th>
                            <th className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-700">Status</th>
                            <th className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-700">Type</th>
                            <th className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-700">Task Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-50 hover:bg-gray-50/30">
                            <td className="py-4 md:py-5 px-3 md:px-6"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></td>
                            <td className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-900">Initial Assessment</td>
                            <td className="py-4 md:py-5 px-3 md:px-6"><span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">Open</span></td>
                            <td className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-600 capitalize">assessment</td>
                            <td className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-600">10/11/2026</td>
                          </tr>
                          <tr className="border-b border-gray-50 hover:bg-gray-50/30">
                            <td className="py-4 md:py-5 px-3 md:px-6"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></td>
                            <td className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-900">Review PAR-Q</td>
                            <td className="py-4 md:py-5 px-3 md:px-6"><span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">Overdue</span></td>
                            <td className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-600 capitalize">general</td>
                            <td className="py-4 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] text-gray-600">10/01/2026</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== MESSAGES ===== */}
              {profileTab === 'Messages' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-[28px] font-bold text-gray-900">Messages</h2>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col md:flex-row h-[70vh] min-h-[500px]">
                    <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${activeChatProfile ? 'hidden md:flex' : 'flex'}`}>
                      <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                          <input type="text" placeholder="Search profiles..." value={messagesSearch} onChange={(e) => setMessagesSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#1a73e8]" />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {filteredMessageProfiles.length === 0 ? (
                          <p className="p-6 text-center text-sm text-gray-400">No profiles found.</p>
                        ) : filteredMessageProfiles.map((p) => {
                          const isActive = activeChatProfile?.id === p.id;
                          return (
                            <button key={p.id} onClick={() => openChatForProfile(p)} className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left transition ${isActive ? 'bg-[#eff5ff]' : 'hover:bg-gray-50'}`}>
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0 overflow-hidden">
                                {p.profilePhoto ? <img src={p.profilePhoto} alt={p.name} className="w-full h-full object-cover" /> : getInitials(p.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-semibold text-gray-900 truncate">{p.name}</p>
                                <p className="text-[12px] text-gray-500 truncate">Click to view conversation</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className={`flex-1 flex flex-col ${activeChatProfile ? 'flex' : 'hidden md:flex'}`}>
                      {!activeChatProfile ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                          </div>
                          <p className="text-[15px] font-medium text-gray-700">Select a profile to start messaging</p>
                        </div>
                      ) : (
                        <>
                          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                              <button onClick={() => setActiveChatProfile(null)} className="md:hidden text-gray-500 mr-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                              </button>
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold flex-shrink-0 overflow-hidden">
                                {activeChatProfile.profilePhoto ? <img src={activeChatProfile.profilePhoto} alt={activeChatProfile.name} className="w-full h-full object-cover" /> : getInitials(activeChatProfile.name)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[15px] font-semibold text-gray-900 truncate">{activeChatProfile.name}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#f8fafc]">
                            {isSendingMsg && chatMessages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Loading messages...</p>}
                            {!isSendingMsg && chatMessages.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Say hello!</p>}

                            {chatMessages.map((msg: any) => {
                              const isMe = msg.senderName === user?.name;
                              return (
                                <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1 ${isMe ? 'bg-[#1a73e8] text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {getInitials(msg.senderName)}
                                  </div>
                                  <div className={`rounded-2xl px-4 py-3 max-w-[75%] ${isMe ? 'bg-[#1a73e8] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                                    <p className="text-[14px] break-words">{msg.body}</p>
                                    <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>

                          <div className="p-3 md:p-4 border-t border-gray-100 bg-white flex-shrink-0">
                            <div className="flex items-center gap-2 md:gap-3">
                              <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessageText}
                                onChange={(e) => setNewMessageText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') sendMessageToActiveChat(); }}
                                className="flex-1 h-11 md:h-12 px-4 bg-gray-50 border border-gray-200 rounded-full text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] focus:bg-white transition"
                              />
                              <button
                                onClick={sendMessageToActiveChat}
                                disabled={isSendingMsg || !newMessageText.trim()}
                                className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white transition flex-shrink-0 ${isSendingMsg || !newMessageText.trim() ? 'bg-gray-300' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}
                              >
                                <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== NOTES ===== */}
              {profileTab === 'Notes' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                    <div className="inline-flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button onClick={() => setNotesTab('Notepad')} className={`px-3 md:px-5 py-2 md:py-2.5 text-[12px] md:text-[14px] font-medium rounded-lg transition ${notesTab === 'Notepad' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>Notepad</button>
                      <button onClick={() => setNotesTab('Journal')} className={`px-3 md:px-5 py-2 md:py-2.5 text-[12px] md:text-[14px] font-medium rounded-lg transition ${notesTab === 'Journal' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>Journal</button>
                    </div>
                    {notesTab === 'Journal' && (
                      <button onClick={() => setCreateNoteOpen(true)} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[13px] md:text-[15px] font-medium px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Create Note
                      </button>
                    )}
                  </div>
                  {notesTab === 'Notepad' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 flex flex-col">
                      <textarea value={notepadText} onChange={(e) => setNotepadText(e.target.value)} placeholder="Enter notes..." className="w-full min-h-[300px] md:min-h-[400px] p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8] bg-white resize-y" />
                      <div className="flex items-center justify-between mt-2 mb-4">
                        <span className="text-[11px] md:text-[13px] text-gray-500">{notepadText.length}/1000</span>
                      </div>
                      <button onClick={handleSaveNotepad} className="w-fit bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[13px] md:text-[15px] font-medium px-4 md:px-6 py-2 md:py-2.5 rounded-lg transition">Save</button>
                    </div>
                  )}
                  {notesTab === 'Journal' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-12 flex flex-col items-center justify-center min-h-[300px]">
                      {journalNotes.length === 0 ? (
                        <>
                          <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 md:mb-6">
                            <svg className="w-7 h-7 md:w-10 md:h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          </div>
                          <h3 className="text-[16px] md:text-[20px] font-semibold text-gray-900 mb-2">No journal notes</h3>
                          <p className="text-[13px] md:text-[15px] text-gray-500 text-center">You do not have saved notes. Create your note now.</p>
                        </>
                      ) : (
                        <div className="w-full space-y-4">
                          {journalNotes.map((note, i) => (
                            <div key={i} className="p-4 md:p-5 border border-gray-100 rounded-xl bg-gray-50/30">
                              <p className="text-gray-800 text-[13px] md:text-[15px]">{note.text}</p>
                              <p className="text-gray-400 text-[11px] md:text-[12px] mt-2">{note.date}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===== FILES ===== */}
              {profileTab === 'Files' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 mb-2">
                    <div className="inline-flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
                      {['Photos', 'Videos', 'Docs'].map(t => (
                        <button key={t} onClick={() => setFileTab(t as any)} className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 text-[12px] md:text-[14px] font-medium rounded-lg transition ${fileTab === t ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>{t}</button>
                      ))}
                    </div>
                    <input type="file" ref={fileUploadInputRef} onChange={handleFileUploadChange} className="hidden" />
                    <button onClick={handleFileUploadClick} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[13px] md:text-[15px] font-medium px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm">
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                      Upload
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-100 bg-[#f8fafc]">
                            <th className="py-3 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-700">Name</th>
                            <th className="py-3 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-700">Type</th>
                            <th className="py-3 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-700">Date</th>
                            <th className="py-3 md:py-5 px-3 md:px-6 text-[13px] md:text-[14px] font-medium text-gray-700 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {files.filter(f => {
                            if (fileTab === 'Photos') return ['png', 'jpg', 'jpeg'].includes(f.type);
                            if (fileTab === 'Videos') return ['mp4', 'mov', 'avi'].includes(f.type);
                            return !['png', 'jpg', 'jpeg', 'mp4', 'mov', 'avi'].includes(f.type);
                          }).map((file, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/30 last:border-0">
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <div className="flex items-center gap-3">
                                  {file.url && ['png','jpg','jpeg'].includes(file.type) ? (
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                      <img src={file.url} alt="thumbnail" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    </div>
                                  )}
                                  <span className="font-medium text-gray-900 text-[13px] md:text-[15px] truncate">{file.name}</span>
                                </div>
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6">
                                <span className="px-2 md:px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] md:text-[12px] font-medium">{file.type}</span>
                              </td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-[13px] md:text-[15px] text-gray-600">{file.date}</td>
                              <td className="py-3 md:py-4 px-3 md:px-6 text-right">
                                <button onClick={() => handleFileAction(file)} className="p-1.5 md:p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-500">
                                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== INFO ===== */}
              {profileTab === 'Info' && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-[28px] font-bold text-gray-900">Profile Information</h2>
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 md:gap-12">
                      <div className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                          <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">First Name <span className="text-red-500">*</span></label><input type="text" value={infoData.firstName} onChange={(e) => setInfoData({ ...infoData, firstName: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-300 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8]" /></div>
                          <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Last Name <span className="text-red-500">*</span></label><input type="text" value={infoData.lastName} onChange={(e) => setInfoData({ ...infoData, lastName: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-300 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8]" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                          <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Sex <span className="text-red-500">*</span></label>
                            <select value={infoData.sex} onChange={(e) => setInfoData({ ...infoData, sex: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-300 rounded-xl text-[13px] md:text-[15px] bg-white outline-none">
                              <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                          </div>
                          <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Measurement System</label>
                            <select value={infoData.measurementSystem} onChange={(e) => setInfoData({ ...infoData, measurementSystem: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-300 rounded-xl text-[13px] md:text-[15px] bg-white outline-none">
                              <option>Metric</option><option>Imperial</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                          <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Email <span className="text-red-500">*</span></label><input type="email" value={infoData.email} onChange={(e) => setInfoData({ ...infoData, email: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-300 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8]" /></div>
                          <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Phone</label><input type="tel" value={infoData.phone} onChange={(e) => setInfoData({ ...infoData, phone: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-300 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8]" /></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-4">Profile Photo</p>
                        <div className="w-32 h-32 md:w-[180px] md:h-[180px] rounded-full bg-[#f4f5f7] flex items-center justify-center text-gray-500 text-2xl md:text-[32px] font-semibold overflow-hidden mb-4 md:mb-6">
                          {selectedProfile.profilePhoto ? <img src={selectedProfile.profilePhoto} className="w-full h-full object-cover" alt="" /> : getInitials(selectedProfile.name)}
                        </div>
                        <button className="px-4 md:px-6 py-2 md:py-2.5 border border-gray-200 rounded-full bg-white hover:bg-gray-50 text-[13px] md:text-[14px] font-medium text-gray-800 transition">Change photo</button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mt-6 md:mt-10 pt-4 md:pt-6 border-t border-gray-100">
                      <button onClick={() => setSelectedProfile(null)} className="px-4 md:px-6 h-10 md:h-[44px] text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition bg-white">Cancel</button>
                      <button onClick={handleSaveInfo} disabled={saving} className={`px-4 md:px-6 h-10 md:h-[44px] text-[13px] md:text-[14px] font-medium text-white rounded-xl transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== PROGRAMS ===== */}
              {profileTab === 'Programs' && !createWorkoutOpen && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div className="inline-flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button onClick={() => setProgramsTab('Activities')} className={`px-4 md:px-6 py-2 text-[13px] md:text-[14px] font-medium rounded-lg transition ${programsTab === 'Activities' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>Activities</button>
                      <button onClick={() => setProgramsTab('Reference')} className={`px-4 md:px-6 py-2 text-[13px] md:text-[14px] font-medium rounded-lg transition ${programsTab === 'Reference' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>Reference</button>
                    </div>
                    <div className="relative add-menu-container">
                      <button onClick={() => setAddMenuOpen(!addMenuOpen)} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[13px] md:text-[15px] font-medium px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Add
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {addMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2">
                          <button onClick={() => { setAddMenuOpen(false); setAssignProgramOpen(true); }} className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">Assign Program</button>
                          <button onClick={() => { setAddMenuOpen(false); setAddActivityOpen(true); }} className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">Add Activity</button>
                          <div className="h-px bg-gray-100 my-1 mx-2"></div>
                          <button onClick={() => { setAddMenuOpen(false); setCreateWorkoutOpen(true); }} className="w-full text-left px-4 py-3 text-[15px] text-gray-700 hover:bg-gray-50 flex items-center gap-3">Create Workout</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {programsTab === 'Activities' && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
                      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition bg-white">{activityFilter}</button>
                          <div className="flex items-center gap-1">
                            <button onClick={() => { if(currentWeekStart){ const newDate = new Date(currentWeekStart); newDate.setDate(newDate.getDate() - 7); setCurrentWeekStart(newDate); } }} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 bg-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={() => { if(currentWeekStart){ const newDate = new Date(currentWeekStart); newDate.setDate(newDate.getDate() + 7); setCurrentWeekStart(newDate); } }} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 bg-white">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          </div>
                          <button onClick={() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); setCurrentWeekStart(d); }} className="px-4 py-2 border border-gray-200 rounded-full text-[14px] font-medium text-gray-700 hover:bg-gray-50 bg-white">Today</button>
                          <div className="relative program-type-container">
                            <button onClick={() => setProgramTypeMenuOpen(!programTypeMenuOpen)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition bg-white">
                              Type: {programTypeFilter === 'all' ? 'All' : programTypeFilter}
                            </button>
                            {programTypeMenuOpen && (
                              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-2">
                                {['Workout', 'Cardio', 'Rest', 'Assessment', 'Task'].map(t => (
                                  <label key={t} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                                    <input type="checkbox" checked={programTypeFilter === t} onChange={() => setProgramTypeFilter(programTypeFilter === t ? 'all' : t)} className="w-4 h-4 rounded border-gray-300 text-[#1a73e8]" />
                                    <span className="text-[14px] text-gray-700">{t}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
                          {['Grid', 'List', 'Table'].map(v => (
                            <button key={v} onClick={() => setProgramView(v as any)} className={`px-4 py-2 text-[14px] font-medium rounded-lg transition ${programView === v ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}>{v}</button>
                          ))}
                        </div>
                      </div>
                      {programView === 'Grid' ? (
                        <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 flex-1">
                          {Array.from({ length: 7 }).map((_, i) => {
                            const dayDate = new Date(currentWeekStart!);
                            dayDate.setDate(currentWeekStart!.getDate() + i);
                            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                            return (
                              <div key={i} className="flex flex-col">
                                <p className="text-[11px] font-bold text-gray-400 tracking-wider text-center uppercase mb-2 md:mb-3">{dayNames[dayDate.getDay()]}</p>
                                <div className="bg-gray-50/50 border border-gray-100 rounded-xl min-h-[200px] md:min-h-[300px] p-3 flex flex-col items-center justify-between group hover:bg-white transition">
                                  <span className="text-[14px] text-gray-500 font-medium mb-2">{dayDate.getDate()}</span>
                                  <button onClick={() => setAddActivityOpen(true)} className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 hover:bg-gray-50 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Add
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 md:p-6 space-y-4">
                          {Array.from({ length: 7 }).map((_, i) => {
                            const dayDate = new Date(currentWeekStart!);
                            dayDate.setDate(currentWeekStart!.getDate() + i);
                            const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                            return (
                              <div key={i} className="flex items-start gap-3 md:gap-4 pb-4 border-b border-gray-100 last:border-0">
                                <div className="w-16 md:w-24 text-right flex-shrink-0">
                                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{dayNames[dayDate.getDay()]}</p>
                                  <p className="text-[16px] md:text-[20px] font-bold text-gray-900">{dayDate.getDate()}</p>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-xl p-3 md:p-4 flex items-center justify-between">
                                  <p className="text-[13px] md:text-[14px] text-gray-500 italic">No activities</p>
                                  <button onClick={() => setAddActivityOpen(true)} className="text-[#1a73e8] hover:underline text-[13px] md:text-[14px] font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    Add
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {programsTab === 'Reference' && (
                    <div className="space-y-8">
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <span className="bg-[#eff5ff] text-[#1a73e8] text-[13px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">METABOLIC</span>
                          <div className="h-px bg-gray-200 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
                            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100"><h3 className="text-[15px] md:text-[16px] font-bold text-gray-900">Caloric Recommendation</h3></div>
                            <div className="px-4 md:px-6 py-3 md:py-4 bg-[#f8fafc] flex justify-between text-[11px] md:text-[12px] font-semibold text-gray-500 uppercase tracking-wider"><span>Active Level</span><span>Calories</span></div>
                            {['Resting Metabolic Rate', 'Sedentary', 'Lightly Active', 'Active', 'Very Active'].map((label) => (
                              <div key={label} className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-50 last:border-0">
                                <span className="text-[13px] md:text-[14px] text-gray-800">{label}</span>
                                <span className="text-[13px] md:text-[14px] text-gray-500">-135</span>
                              </div>
                            ))}
                          </div>
                          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100"><h3 className="text-[15px] md:text-[16px] font-bold text-gray-900">Protein Recommendation</h3></div>
                            <div className="px-4 md:px-6 py-3 md:py-4 bg-[#f8fafc] flex justify-between text-[11px] md:text-[12px] font-semibold text-gray-500 uppercase tracking-wider"><span>Standard</span><span>Recommendation(g)</span></div>
                            {['Minimum', 'Maximum'].map((label) => (
                              <div key={label} className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-50 last:border-0">
                                <span className="text-[13px] md:text-[14px] text-gray-800">{label}</span>
                                <span className="text-[13px] md:text-[14px] text-gray-500">{label === 'Minimum' ? '8.4' : '17.8'}</span>
                              </div>
                            ))}
                          </div>
                          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100"><h3 className="text-[15px] md:text-[16px] font-bold text-gray-900">Target Heart Rate Zones</h3></div>
                            <div className="flex-1 flex flex-col items-center justify-center p-6"><p className="text-gray-400 italic text-[15px]">No records yet</p></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== CREATE WORKOUT ===== */}
              {profileTab === 'Programs' && createWorkoutOpen && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 md:gap-4 mb-4">
                    <button onClick={() => setCreateWorkoutOpen(false)} className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div>
                      <h2 className="text-lg md:text-[24px] font-bold text-gray-900">Create Workout</h2>
                      <p className="text-[12px] md:text-[14px] text-gray-500">Fill in the details to create a new workout.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 md:gap-6">
                    <div className="space-y-4 md:space-y-6">
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
                        <div className="space-y-4 md:space-y-5">
                          <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Workout Name <span className="text-red-500">*</span></label><input type="text" placeholder="e.g. Upper Body Strength" value={workoutData.name} onChange={(e) => setWorkoutData({...workoutData, name: e.target.value})} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8]" /></div>
                          <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Duration (min)</label><input type="number" placeholder="0" value={workoutData.duration} onChange={(e) => setWorkoutData({...workoutData, duration: e.target.value})} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8]" /></div>
                            <div><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Scheduled Date</label><input type="date" value={workoutData.date} onChange={(e) => setWorkoutData({...workoutData, date: e.target.value})} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8]" /></div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2"><label className="block text-[13px] md:text-[14px] font-semibold text-gray-800">Note</label><span className="text-[11px] md:text-[12px] text-gray-400">{workoutData.note.length}/1000</span></div>
                            <textarea rows={4} placeholder="Optional workout note..." value={workoutData.note} onChange={(e) => setWorkoutData({...workoutData, note: e.target.value})} className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[15px] outline-none focus:border-[#1a73e8] bg-white resize-y" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900">Exercises</h3>
                          <span className="text-[12px] md:text-[14px] text-gray-500">{droppedElements.length} exercise(s)</span>
                        </div>
                        <div
                          className={`bg-white border-2 border-dashed ${isDraggingOver ? 'border-[#1a73e8] bg-blue-50/30' : 'border-gray-200'} rounded-2xl min-h-[180px] md:min-h-[200px] flex flex-col p-4 md:p-6 transition`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          {droppedElements.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                              <p className="text-[13px] md:text-[15px] text-gray-500 font-medium text-center">No exercises added yet. Drag elements or click +</p>
                            </div>
                          ) : (
                            <div className="w-full space-y-3">
                              {droppedElements.map((el) => (
                                <div key={el.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 flex items-center justify-between">
                                  <span className="font-medium text-gray-800 text-[13px] md:text-[15px]">{el.label}</span>
                                  <button onClick={() => setDroppedElements(droppedElements.filter(d => d.id !== el.id))} className="text-gray-400 hover:text-red-500">
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[14px] md:text-[16px] font-bold text-gray-900 mb-3 md:mb-4">Elements</h3>
                        <div className="flex gap-2 md:gap-3 mb-2 flex-wrap">
                          <button draggable onDragStart={(e) => handleDragStart(e, 'section', 'Section')} className="px-3 md:px-5 py-2 md:py-2.5 bg-[#fff8f0] text-[#b45309] border border-[#fcd34d] rounded-xl text-[12px] md:text-[14px] font-semibold cursor-grab active:cursor-grabbing">Section</button>
                          <button draggable onDragStart={(e) => handleDragStart(e, 'exercise', 'Exercise')} className="px-3 md:px-5 py-2 md:py-2.5 bg-[#eff5ff] text-[#1a73e8] border border-[#bfdbfe] rounded-xl text-[12px] md:text-[14px] font-semibold cursor-grab active:cursor-grabbing">Exercise</button>
                        </div>
                        <p className="text-[11px] md:text-[13px] text-gray-500 font-medium">Drag onto canvas</p>
                      </div>
                      <div className="pt-4 md:pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 md:gap-4 pb-6 md:pb-10">
                        <button onClick={() => setCreateWorkoutOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 border border-gray-200 bg-white rounded-full text-[13px] md:text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                        <button onClick={handleCreateWorkout} disabled={saving} className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[13px] md:text-[15px] font-medium transition ${saving ? 'bg-[#7a9bcc] text-white cursor-not-allowed' : 'bg-[#1a73e8] text-white hover:bg-[#1557b0]'}`}>{saving ? 'Creating...' : 'Create Workout'}</button>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-center min-h-[300px] md:min-h-[600px] p-6">
                      <p className="text-[13px] md:text-[15px] text-gray-400 font-medium text-center">Select an exercise to see details</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* PROFILE ACTIONS MENU */}
      {actionMenuProfileId && (
        <ProfileActionMenu
          onClose={closeActionMenu}
          onEditProfile={() => {
            closeActionMenu();
            // Open the Info tab for editing
            setProfileTab('Info');
          }}
          onAssignProgram={() => {
            closeActionMenu();
            setAssignProgramOpen(true);
          }}
          onSendForm={() => {
            closeActionMenu();
            setSendFormOpen(true);
          }}
          onAssignStaff={() => {
            closeActionMenu();
            setAssignStaffOpen(true);
          }}
          onAssignGroup={() => {
            closeActionMenu();
            setAssignGroupOpen(true);
          }}
          onArchive={() => {
            closeActionMenu();
            setArchiveOpen(true);
          }}
          onDelete={() => {
            closeActionMenu();
            setDeleteOpen(true);
          }}
        />
      )}

      {/* ACTION MODALS */}
      {assignStaffOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Assign staff</h3>
              <button onClick={() => setAssignStaffOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 md:p-6">
              <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Staff</label>
              <select value={assignStaffSelected} onChange={(e) => setAssignStaffSelected(e.target.value)} className="w-full h-11 md:h-12 px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                <option value="">Select a staff member...</option>
                {staffOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-end gap-2 md:gap-3 border-t border-gray-100">
              <button onClick={() => setAssignStaffOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={handleAssignStaff} disabled={saving || !assignStaffSelected} className={`px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-white rounded-lg transition ${saving || !assignStaffSelected ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Assigning...' : 'Assign'}</button>
            </div>
          </div>
        </div>
      )}

      {assignGroupOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Assign group</h3>
              <button onClick={() => setAssignGroupOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 md:p-6">
              <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Groups</label>
              <select onChange={(e) => handleAssignGroup(e.target.value)} className="w-full h-11 md:h-12 px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                <option value="">Select group...</option>
                {availableGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-end gap-2 md:gap-3 border-t border-gray-100">
              <button onClick={() => setAssignGroupOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {sendFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Send form</h3>
              <button onClick={() => setSendFormOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 md:p-6">
              <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Form</label>
              <select value={sendFormType} onChange={(e) => setSendFormType(e.target.value)} className="w-full h-11 md:h-12 px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                <option value="">Select a form</option>
                <option value="PARQ">PAR-Q</option>
                <option value="FITNESS">Fitness Assessment</option>
              </select>
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-end gap-2 md:gap-3 border-t border-gray-100">
              <button onClick={() => setSendFormOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={handleSendForm} disabled={saving} className={`px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-white rounded-lg transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Sending...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}

      {archiveOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Archive profile</h3>
              <button onClick={() => setArchiveOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 md:p-6"><p className="text-[13px] md:text-sm text-gray-500">Are you sure you want to archive this profile?</p></div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setArchiveOpen(false)} className="px-4 py-2 text-[13px] md:text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleArchiveProfile} disabled={saving} className="px-4 py-2 text-[13px] md:text-sm font-medium text-white bg-red-600 rounded-lg">{saving ? 'Archiving...' : 'Archive'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-lg font-bold text-red-600">Delete profile</h3>
              <button onClick={() => setDeleteOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 md:p-6"><p className="text-[13px] md:text-sm text-gray-500">Are you sure you want to permanently delete this profile? This action cannot be undone.</p></div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setDeleteOpen(false)} className="px-4 py-2 text-[13px] md:text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteProfile} disabled={saving} className="px-4 py-2 text-[13px] md:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN PROGRAM MODAL */}
      {assignProgramOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl relative my-4 md:my-8">
            <div className="px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Schedule program</h2>
              <button onClick={() => setAssignProgramOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Program <span className="text-red-500">*</span></label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]"
                >
                  <option value="">Select a program...</option>
                  {programsList.length === 0 ? (
                    <option disabled value="">No programs available — create one at /programs first</option>
                  ) : (
                    programsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Start date <span className="text-red-500">*</span></label>
                <input type="date" className="w-full max-w-[220px] h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none" />
              </div>
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setAssignProgramOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 border border-gray-200 text-[13px] md:text-[14px] font-medium text-gray-700 rounded-xl hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={handleAssignProgram} disabled={saving} className={`px-4 md:px-6 py-2 md:py-2.5 text-white rounded-xl text-[13px] md:text-[14px] font-medium transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Assigning...' : 'Confirm schedule'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ACTIVITY MODAL */}
      {addActivityOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl relative my-4 md:my-8">
            <div className="px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Add activity</h2>
              <button onClick={() => setAddActivityOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Type</label>
                <select className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                  <option>Workout</option><option>Rest Day</option><option>Assessment</option><option>Note</option>
                </select>
              </div>
              
              {/* REAL WORKOUT DROPDOWN */}
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Workout</label>
                <div className="w-full border border-gray-200 rounded-xl bg-white p-3 max-h-48 overflow-y-auto space-y-2">
                  {workoutsList.length === 0 ? (
                    <p className="text-sm text-gray-400">No workouts available — create one at /workouts first</p>
                  ) : (
                    workoutsList.map((w) => (
                      <label key={w.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition">
                        <input
                          type="checkbox"
                          checked={selectedActivityWorkoutIds.includes(w.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedActivityWorkoutIds([...selectedActivityWorkoutIds, w.id]);
                            } else {
                              setSelectedActivityWorkoutIds(selectedActivityWorkoutIds.filter(id => id !== w.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-[#1a73e8]"
                        />
                        <span className="text-[13px] md:text-[14px] text-gray-800">{w.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setAddActivityOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={handleAddActivity} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-white rounded-xl bg-[#1a73e8] hover:bg-[#1557b0]">Add Activity</button>
            </div>
          </div>
        </div>
      )}

      {createEventOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl relative my-4 md:my-8">
            <div className="px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Create Event</h2>
              <button onClick={() => setCreateEventOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-4 md:px-6 py-4 md:py-6 max-h-[70vh] overflow-y-auto space-y-4 md:space-y-5">
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Event Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Training Session" value={eventData.name} onChange={(e) => setEventData({ ...eventData, name: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8]" />
              </div>
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Date <span className="text-red-500">*</span></label>
                <input type="date" value={eventData.date} onChange={(e) => setEventData({ ...eventData, date: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8]" />
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Start Time</label>
                  <select value={eventData.startTime} onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                    {['12:00 am','6:00 am','9:00 am','12:00 pm','3:00 pm','6:00 pm','9:00 pm'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">End Time</label>
                  <select value={eventData.endTime} onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                    {['12:00 pm','3:00 pm','6:00 pm','9:00 pm','11:00 pm'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setCreateEventOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={handleCreateEvent} disabled={saving} className={`px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-white rounded-xl ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Creating...' : 'Create Event'}</button>
            </div>
          </div>
        </div>
      )}

      {createTaskOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl relative my-4 md:my-8">
            <div className="px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Create Task</h2>
              <button onClick={() => setCreateTaskOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-4 md:px-6 py-4 md:py-6 max-h-[70vh] overflow-y-auto space-y-4 md:space-y-5">
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Title <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Task title" value={taskData.title} onChange={(e) => { setTaskData({ ...taskData, title: e.target.value }); setTaskError(''); }} className={`w-full h-11 md:h-[48px] px-3 md:px-4 border rounded-xl text-[13px] md:text-[14px] outline-none ${taskError ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`} />
                {taskError && <p className="text-xs text-red-500 mt-1.5">{taskError}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Type</label>
                  <select value={taskData.type} onChange={(e) => setTaskData({ ...taskData, type: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                    <option value="">Select...</option><option value="general">General</option><option value="assessment">Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Priority</label>
                  <select value={taskData.priority} onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                    <option>Normal</option><option>High</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Description</label>
                <textarea rows={3} value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] bg-white resize-y" />
              </div>
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Due Date</label>
                <input type="date" value={taskData.dueDate} onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8]" />
              </div>
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setCreateTaskOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={handleCreateTask} disabled={saving} className={`px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-white rounded-xl ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {createNoteOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl relative my-4 md:my-8">
            <div className="px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Create Note</h2>
              <button onClick={() => setCreateNoteOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-4 md:px-6 py-4 md:py-6">
              <textarea rows={6} placeholder="Write your note here..." value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] bg-white resize-y" />
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setCreateNoteOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={handleCreateNote} className="px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-white rounded-xl bg-[#1a73e8] hover:bg-[#1557b0]">Save</button>
            </div>
          </div>
        </div>
      )}

      {fileActionOpen && selectedFile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm md:max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">File actions</h2>
              <button onClick={() => setFileActionOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-3 md:p-4 space-y-2">
              <button className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left">
                <span className="text-[13px] md:text-[15px] font-medium text-gray-800">Preview</span>
              </button>
              <button className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left">
                <span className="text-[13px] md:text-[15px] font-medium text-gray-800">Download</span>
              </button>
              <button onClick={handleDeleteFile} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-left">
                <span className="text-[13px] md:text-[15px] font-medium text-red-600">Delete file</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {createTestNoteOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md md:max-w-lg rounded-2xl shadow-2xl relative my-4 md:my-8">
            <div className="px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Create Note</h2>
              <button onClick={() => setCreateTestNoteOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
              <div className="relative note-date-container">
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Note Date</label>
                <div className="relative">
                  <div onClick={() => setNoteDateOpen(!noteDateOpen)} className="w-full h-11 md:h-[48px] px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] flex items-center cursor-pointer text-gray-700 bg-white">{noteDateText}</div>
                  {noteDateOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                      <input type="date" onChange={(e) => { if (e.target.value) { const [y, m, d] = e.target.value.split('-'); setNoteDateText(`${m}/${d}/${y}`); setNoteDateOpen(false); } }} className="w-full h-11 px-4 border border-gray-200 rounded-xl text-[14px] outline-none" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Metric</label>
                <select value={selectedMetricForNote || 'General'} onChange={(e) => setSelectedMetricForNote(e.target.value)} className="w-full h-11 md:h-[48px] px-3 md:px-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] bg-white outline-none focus:border-[#1a73e8]">
                  <option value="General">General</option>
                  {selectedMetricForNote && selectedMetricForNote !== 'General' && <option value={selectedMetricForNote}>{selectedMetricForNote}</option>}
                </select>
              </div>
              <div>
                <label className="block text-[13px] md:text-[14px] font-semibold text-gray-800 mb-2">Note Text <span className="text-red-500">*</span></label>
                <textarea rows={4} placeholder="Enter note..." className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] bg-white resize-y" />
              </div>
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setCreateTestNoteOpen(false)} className="px-4 md:px-6 h-10 md:h-[44px] text-[13px] md:text-[14px] font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white">Cancel</button>
              <button onClick={() => { setToast({ message: 'Note added successfully', type: 'success' }); setCreateTestNoteOpen(false); setSelectedMetricForNote(''); }} className="px-4 md:px-6 h-10 md:h-[44px] text-[13px] md:text-[14px] font-medium text-white rounded-xl bg-[#1a73e8] hover:bg-[#1557b0]">Create Note</button>
            </div>
          </div>
        </div>
      )}

      {updateMetricsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative flex flex-col max-h-[80vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] md:text-[20px] font-bold text-gray-900">Update Metrics</h2>
                <p className="text-[13px] md:text-[14px] text-gray-500 mt-1">Choose which metrics to track.</p>
              </div>
              <button onClick={() => setUpdateMetricsOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4">
              {ALL_METRICS.map((metric) => (
                <label key={metric.id} className="flex items-center justify-between cursor-pointer">
                  <span className={`text-[13px] md:text-[15px] ${metric.id === 'weight' ? 'text-gray-400' : 'text-gray-700'}`}>{metric.label}</span>
                  <input type="checkbox" checked={updateMetricsSelection.includes(metric.id)} disabled={metric.id === 'weight'} onChange={(e) => { if (e.target.checked) setUpdateMetricsSelection([...updateMetricsSelection, metric.id]); else setUpdateMetricsSelection(updateMetricsSelection.filter(id => id !== metric.id)); }} className={`w-5 h-5 rounded border-gray-300 text-[#1a73e8] ${metric.id === 'weight' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} />
                </label>
              ))}
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={() => setUpdateMetricsOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 border border-gray-200 text-[13px] md:text-[14px] font-medium text-gray-700 rounded-xl hover:bg-gray-50 bg-white">Close</button>
              <button onClick={() => { setToast({ message: 'Metrics updated successfully', type: 'success' }); setUpdateMetricsOpen(false); }} className="px-4 md:px-6 py-2 md:py-2.5 bg-[#1a73e8] text-white rounded-xl text-[13px] md:text-[14px] font-medium hover:bg-[#1557b0]">Save</button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative my-3 md:my-4">
            <div className="px-4 md:px-8 pt-5 md:pt-8 pb-3 md:pb-6 border-b border-gray-100">
              <div className="flex items-start gap-3 md:gap-4">
                <button onClick={() => setCreateOpen(false)} className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center flex-shrink-0 transition">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-0.5">Create Profile</h1>
                  <p className="text-[12px] md:text-sm text-gray-500">Add a new profile with info, PAR-Q, and forms.</p>
                </div>
                <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="px-4 md:px-8 border-b border-gray-100 overflow-x-auto">
              <div className="flex items-center gap-1 md:gap-2 py-3 min-w-max">
                {TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setModalTab(tab.id)} className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 text-[12px] md:text-sm font-medium rounded-lg whitespace-nowrap transition ${modalTab === tab.id ? 'bg-[#f0f2f5] text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>{tab.label}</button>
                ))}
              </div>
            </div>

            <div className="px-4 md:px-8 py-4 md:py-8 max-h-[60vh] overflow-y-auto">
              {modalTab === 'profile-info' && (
                <>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Profile Information</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">First Name <span className="text-red-500">*</span></label>
                          <input type="text" value={formData.firstName} onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); if (validationErrors.firstName) setValidationErrors({ ...validationErrors, firstName: '' }); }} className={`w-full h-11 px-3 md:px-4 border rounded-lg text-[13px] md:text-sm outline-none ${validationErrors.firstName ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`} />
                          {validationErrors.firstName && <p className="text-xs text-red-500 mt-1.5">{validationErrors.firstName}</p>}
                        </div>
                        <div>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Last Name <span className="text-red-500">*</span></label>
                          <input type="text" value={formData.lastName} onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); if (validationErrors.lastName) setValidationErrors({ ...validationErrors, lastName: '' }); }} className={`w-full h-11 px-3 md:px-4 border rounded-lg text-[13px] md:text-sm outline-none ${validationErrors.lastName ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`} />
                          {validationErrors.lastName && <p className="text-xs text-red-500 mt-1.5">{validationErrors.lastName}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Sex <span className="text-red-500">*</span></label>
                          <select value={formData.sex} onChange={(e) => { setFormData({ ...formData, sex: e.target.value }); if (validationErrors.sex) setValidationErrors({ ...validationErrors, sex: '' }); }} className={`w-full h-11 px-3 md:px-4 border rounded-lg text-[13px] md:text-sm bg-white outline-none ${validationErrors.sex ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`}>
                            <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Measurement System</label>
                          <select value={formData.measurementSystem} onChange={(e) => setFormData({ ...formData, measurementSystem: e.target.value })} className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-sm bg-white outline-none focus:border-[#1a73e8]">
                            <option>Imperial</option><option>Metric</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Birthday <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                          <select value={formData.birthMonth} onChange={(e) => { setFormData({ ...formData, birthMonth: e.target.value }); if (validationErrors.birthday) setValidationErrors({ ...validationErrors, birthday: '' }); }} className={`w-full h-11 px-2 md:px-4 border rounded-lg text-[12px] md:text-sm bg-white outline-none ${validationErrors.birthday ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`}>
                            <option value="">Month</option>{MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <select value={formData.birthDay} onChange={(e) => { setFormData({ ...formData, birthDay: e.target.value }); if (validationErrors.birthday) setValidationErrors({ ...validationErrors, birthday: '' }); }} className={`w-full h-11 px-2 md:px-4 border rounded-lg text-[12px] md:text-sm bg-white outline-none ${validationErrors.birthday ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`}>
                            <option value="">Day</option>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <select value={formData.birthYear} onChange={(e) => { setFormData({ ...formData, birthYear: e.target.value }); if (validationErrors.birthday) setValidationErrors({ ...validationErrors, birthday: '' }); }} className={`w-full h-11 px-2 md:px-4 border rounded-lg text-[12px] md:text-sm bg-white outline-none ${validationErrors.birthday ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`}>
                            <option value="">Year</option>{years.map((y) => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        {validationErrors.birthday && <p className="text-xs text-red-500 mt-1.5">{validationErrors.birthday}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Height (ft) <span className="text-red-500">*</span></label>
                          <input type="number" value={formData.heightFt} onChange={(e) => { setFormData({ ...formData, heightFt: e.target.value }); if (validationErrors.heightFt) setValidationErrors({ ...validationErrors, heightFt: '' }); }} className={`w-full h-11 px-3 md:px-4 border rounded-lg text-[13px] md:text-sm outline-none ${validationErrors.heightFt ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`} />
                        </div>
                        <div>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Height (in) <span className="text-red-500">*</span></label>
                          <input type="number" value={formData.heightIn} onChange={(e) => { setFormData({ ...formData, heightIn: e.target.value }); if (validationErrors.heightIn) setValidationErrors({ ...validationErrors, heightIn: '' }); }} className={`w-full h-11 px-3 md:px-4 border rounded-lg text-[13px] md:text-sm outline-none ${validationErrors.heightIn ? 'border-red-400' : 'border-gray-200 focus:border-[#1a73e8]'}`} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Email</label>
                          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-sm outline-none focus:border-[#1a73e8]" />
                        </div>
                        <div>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Phone</label>
                          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-sm outline-none focus:border-[#1a73e8]" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        <div className="relative" ref={groupsRef}>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Groups</label>
                          <div onClick={() => setGroupsOpen(!groupsOpen)} className="w-full min-h-11 px-3 md:px-4 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer flex flex-wrap items-center gap-2">
                            {formData.groups.length === 0 ? <span className="text-gray-400 text-[13px] md:text-sm py-1">Select groups...</span> : formData.groups.map((g) => (
                              <span key={g} className="inline-flex items-center gap-1 bg-blue-50 text-[#1a73e8] text-[11px] md:text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-md">
                                {g}
                                <button type="button" onClick={(e) => { e.stopPropagation(); removeGroup(g); }} className="hover:bg-blue-100 rounded-full w-4 h-4 flex items-center justify-center">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </span>
                            ))}
                          </div>
                          {groupsOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto p-2">
                              {availableGroups.map((g) => (
                                <label key={g.id} className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer select-none hover:bg-gray-50">
                                  <input type="checkbox" checked={formData.groups.includes(g.name)} onChange={() => toggleGroup(g.name)} className="w-4 h-4 rounded" />
                                  <span className="text-[13px] md:text-sm text-gray-800">{g.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="relative" ref={staffRef}>
                          <label className="block text-[13px] md:text-sm font-semibold text-gray-800 mb-2">Staff</label>
                          <button type="button" onClick={() => setStaffOpen(!staffOpen)} className={`w-full h-11 px-3 md:px-4 border rounded-lg text-[13px] md:text-sm bg-white flex items-center justify-between outline-none ${staffOpen ? 'border-[#1a73e8]' : 'border-gray-200'}`}>
                            <span className={formData.staff ? 'text-gray-800' : 'text-gray-400'}>{formData.staff || 'Select staff...'}</span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${staffOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {staffOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto">
                              {staffOptions.map((s) => (
                                <button key={s.id} type="button" onClick={() => { setFormData({ ...formData, staff: s.name, staffId: s.id }); setStaffOpen(false); }} className={`w-full text-left px-4 py-2.5 text-[13px] md:text-sm transition ${formData.staffId === s.id ? 'bg-[#1a73e8] text-white' : 'text-gray-700 hover:bg-gray-50'}`}>{s.name}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="pt-2">
                        <p className="text-[13px] md:text-sm font-semibold text-gray-800 mb-3">Client access</p>
                        <div className="flex flex-wrap items-center gap-6 md:gap-8">
                          <label className="flex items-center gap-2.5 cursor-pointer"><input type="radio" name="clientAccess" value="allow" checked={formData.clientAccess === 'allow'} onChange={(e) => setFormData({ ...formData, clientAccess: e.target.value })} className="w-4 h-4 text-[#1a73e8]" /><span className="text-[13px] md:text-sm text-gray-700">Allow access</span></label>
                          <label className="flex items-center gap-2.5 cursor-pointer"><input type="radio" name="clientAccess" value="deny" checked={formData.clientAccess === 'deny'} onChange={(e) => setFormData({ ...formData, clientAccess: e.target.value })} className="w-4 h-4 text-[#1a73e8]" /><span className="text-[13px] md:text-sm text-gray-700">Do not allow</span></label>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-[13px] md:text-sm font-semibold text-gray-800 mb-4 md:mb-6">Profile Photo</p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      <div onClick={handlePhotoClick} className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-dashed border-gray-300 hover:border-[#1a73e8] flex flex-col items-center justify-center cursor-pointer transition overflow-hidden">
                        {formData.profilePhoto ? (
                          <>
                            <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            <button type="button" onClick={removePhoto} className="absolute top-2 right-2 w-6 h-6 md:w-7 md:h-7 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-red-600">
                              <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                            <span className="text-[12px] md:text-sm text-gray-500">Upload</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] md:text-xs text-gray-500 text-center mt-3">JPG, PNG. Max 6MB.</p>
                    </div>
                  </div>
                </>
              )}

              {modalTab === 'parq' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">PAR-Q</h2>
                  <div className="space-y-4 md:space-y-6">
                    {[
                      { key: 'q1', text: '1. Has your doctor ever said that you have a heart condition, or high blood pressure?' },
                      { key: 'q2', text: '2. Do you feel pain in your chest at rest, during daily activities, or when you do physical activity?' },
                      { key: 'q3', text: '3. Do you lose balance because of dizziness, or have you lost consciousness in the last 12 months?' },
                      { key: 'q4', text: '4. Have you ever been diagnosed with another chronic medical condition?' },
                      { key: 'q5', text: '5. Are you currently taking prescribed medications for a chronic medical condition?' },
                      { key: 'q6', text: '6. Do you currently have a bone, joint, or soft tissue problem that could be made worse by becoming more physically active?' },
                      { key: 'q7', text: '7. Has your doctor ever said that you should only do medically supervised physical activity?' },
                    ].map(({ key, text }) => (
                      <div key={key}>
                        <p className="text-[13px] md:text-[15px] font-medium text-gray-800 mb-2">{text}</p>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={key} checked={(parqData as any)[key] === 'Yes'} onChange={() => setParqData({ ...parqData, [key]: 'Yes' } as any)} className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">Yes</span></label>
                          <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={key} checked={(parqData as any)[key] === 'No'} onChange={() => setParqData({ ...parqData, [key]: 'No' } as any)} className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">No</span></label>
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="block text-[13px] md:text-[15px] font-medium text-gray-800 mb-2">8. Additional Notes</label>
                      <textarea rows={4} value={parqData.notes} onChange={(e) => setParqData({ ...parqData, notes: e.target.value })} className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] bg-white resize-y" />
                    </div>
                    <div>
                      <label className="block text-[13px] md:text-[15px] font-medium text-gray-800 mb-2">9. Signature</label>
                      <button type="button" onClick={() => setSignatureModalOpen(true)} className="px-4 md:px-6 py-2 md:py-2.5 border border-dashed border-gray-300 rounded-xl text-[13px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50">{parqData.signature ? 'Signature Added' : 'Add E-Signature'}</button>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'custom-1' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Mollitia reiciendis</h2>
                  <p className="text-[13px] md:text-[14.5px] text-gray-600 mb-6 md:mb-8">Consectetur expedita</p>
                  <p className="text-[14px] md:text-[15px] font-bold text-gray-800 mb-3">qweqweasdASD</p>
                  <p className="text-[13px] md:text-[14.5px] text-gray-600 mb-6">MCS</p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="mcs" checked={custom1Data.mcs === 'Yes'} onChange={() => setCustom1Data({ mcs: 'Yes' })} className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">Yes</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="mcs" checked={custom1Data.mcs === 'No'} onChange={() => setCustom1Data({ mcs: 'No' })} className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">No</span></label>
                  </div>
                </div>
              )}

              {modalTab === 'custom-2' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4">Amplify form</h2>
                  <p className="text-[13px] md:text-[14px] text-gray-600 mb-6 md:mb-8">Amplify form description</p>
                  <h3 className="text-[16px] md:text-[18px] font-bold text-gray-900 mb-3 md:mb-4">H2 Section</h3>
                  <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-2 md:mb-3">MCQ single select</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {['opt1', 'opt2', 'opt3', 'opt4'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="amplify_single" checked={custom6Data.mcqSingle === opt} onChange={() => setCustom6Data({ ...custom6Data, mcqSingle: opt })} className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">{opt}</span></label>
                    ))}
                  </div>
                  <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-2 md:mb-3">MCQ multiselect</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {['opt1', 'opt2', 'opt3', 'opt4'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={custom6Data.mcqMulti.includes(opt)} onChange={(e) => { const list = e.target.checked ? [...custom6Data.mcqMulti, opt] : custom6Data.mcqMulti.filter(i => i !== opt); setCustom6Data({ ...custom6Data, mcqMulti: list }); }} className="w-4 h-4" />
                        <span className="text-[13px] md:text-[14px]">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[14px] md:text-[15px] font-medium text-gray-800 mb-2">Test paragraph</p>
                  <div className="mt-6">
                    <button type="button" onClick={() => setSignatureModalOpen(true)} className="px-4 md:px-6 py-2 md:py-2.5 border border-dashed border-gray-300 rounded-xl text-[13px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50">Add Signature</button>
                  </div>
                </div>
              )}

              {modalTab === 'custom-3' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4">Fitness & Health Assessment Form</h2>
                  <p className="text-[13px] md:text-[14px] text-gray-600 mb-6 md:mb-8">A form used to collect basic fitness, health, and physical activity information from clients.</p>
                  <label className="block text-[14px] md:text-[15px] font-semibold text-gray-900 mb-2">What is your name?</label>
                  <input type="text" value={custom3Data.name} onChange={(e) => setCustom3Data({ name: e.target.value })} className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-sm outline-none focus:border-[#1a73e8]" />
                </div>
              )}

              {modalTab === 'custom-4' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4 md:mb-6">Sabir</h2>
                  <label className="block text-[14px] md:text-[15px] font-semibold text-gray-900 mb-2">What is your name?</label>
                  <input type="text" className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-sm outline-none focus:border-[#1a73e8]" />
                </div>
              )}

              {modalTab === 'custom-5' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4 md:mb-6">Sabir</h2>
                  <label className="block text-[14px] md:text-[15px] font-semibold text-gray-900 mb-2">What is your name?</label>
                  <input type="text" className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-sm outline-none focus:border-[#1a73e8] mb-4 md:mb-6" />
                  <label className="block text-[14px] md:text-[15px] font-semibold text-gray-900 mb-2">Signature</label>
                  <button type="button" onClick={() => setSignatureModalOpen(true)} className="px-4 md:px-6 py-2 md:py-2.5 border border-dashed border-gray-300 rounded-xl text-[13px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50">Add Signature</button>
                </div>
              )}

              {modalTab === 'custom-6' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4 md:mb-6">H2 Section</h2>
                  <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-2 md:mb-3">MCQ single select</p>
                  <div className="flex flex-col gap-2 mb-6 md:mb-8">
                    {['opt1', 'opt2', 'opt3', 'opt4'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="mcqSingle" checked={custom6Data.mcqSingle === opt} onChange={() => setCustom6Data({ ...custom6Data, mcqSingle: opt })} className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">{opt}</span></label>
                    ))}
                  </div>
                  <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-2 md:mb-3">MCQ multiselect</p>
                  <div className="flex flex-col gap-2 mb-6 md:mb-8">
                    {['opt1', 'opt2', 'opt3', 'opt4'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={custom6Data.mcqMulti.includes(opt)} onChange={(e) => { const list = e.target.checked ? [...custom6Data.mcqMulti, opt] : custom6Data.mcqMulti.filter(i => i !== opt); setCustom6Data({ ...custom6Data, mcqMulti: list }); }} className="w-4 h-4" />
                        <span className="text-[13px] md:text-[14px]">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[14px] md:text-[15px] font-medium text-gray-800 mb-2">Test paragraph</p>
                </div>
              )}

              {modalTab === 'custom-7' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4">New Paragraph Form</h2>
                  <p className="text-[13px] md:text-[14px] text-gray-600 mb-6 md:mb-8">Test the Paragraph</p>
                  <label className="block text-[14px] md:text-[15px] font-semibold text-gray-900 mb-2">What is your name</label>
                  <input type="text" className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-sm outline-none focus:border-[#1a73e8]" />
                </div>
              )}

              {modalTab === 'custom-8' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4">Test form naeem</h2>
                  <p className="text-[13px] md:text-[14px] text-gray-600 mb-2">fasdfasdf</p>
                  <p className="text-[13px] md:text-[14px] text-gray-600 mb-6">fasdfasdf11111</p>
                </div>
              )}

              {modalTab === 'custom-9' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4">Naeem Test Form</h2>
                  <p className="text-[13px] md:text-[14px] text-gray-600 mb-6">Porro nesciunt aut</p>
                  <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-2 md:mb-3">Multiple choice question</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {['Opt 1', 'opt 2', 'opt 3'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="sabir_single" className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">{opt}</span></label>
                    ))}
                  </div>
                  <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-2 md:mb-3">Check box question</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {['opt 5', 'opt 6', 'opt 8'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">{opt}</span></label>
                    ))}
                  </div>
                  <button type="button" onClick={() => setSignatureModalOpen(true)} className="px-4 md:px-6 py-2 md:py-2.5 border border-dashed border-gray-300 rounded-xl text-[13px] md:text-[14px] font-medium text-gray-700 hover:bg-gray-50">Add Signature</button>
                </div>
              )}

              {modalTab === 'custom-10' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-[20px] font-bold text-gray-900 mb-4 md:mb-6">New Form</h2>
                  <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-2 md:mb-3">Mutiple Choice</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="today_single" className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">{opt}</span></label>
                    ))}
                  </div>
                  <p className="text-[14px] md:text-[15px] font-semibold text-gray-800 mb-2 md:mb-3">CheckBox</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {['Checkbox 1', 'Checkbox 2'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4" /><span className="text-[13px] md:text-[14px]">{opt}</span></label>
                    ))}
                  </div>
                  <label className="block text-[14px] md:text-[15px] font-semibold text-gray-900 mb-2">Number</label>
                  <input type="number" className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-sm outline-none focus:border-[#1a73e8] mb-4" />
                  <p className="text-[14px] md:text-[15px] font-medium text-gray-800 mb-2">Test Paragraph</p>
                </div>
              )}

              {modalTab === 'custom-11' && (
                <div className="max-w-3xl">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Notepad</h2>
                  <textarea rows={10} value={notepadData} onChange={(e) => setNotepadData(e.target.value)} placeholder="Enter notes..." className="w-full p-3 md:p-4 border border-gray-200 rounded-xl text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] bg-white resize-y" />
                </div>
              )}
            </div>

            <div className="px-4 md:px-8 py-3 md:py-5 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              <button onClick={handleNext} className="px-3 md:px-5 py-2 md:py-2.5 text-[13px] md:text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Next</button>
              <button onClick={() => setCreateOpen(false)} className="px-3 md:px-5 py-2 md:py-2.5 text-[13px] md:text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
              <button id="submit-profile-btn" onClick={handleSaveProfile} disabled={saving} className={`sm:ml-auto px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-sm font-medium text-white rounded-lg transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Creating...' : 'Create Profile'}</button>
            </div>
          </div>
        </div>
      )}

      {signatureModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-100">
              <h3 className="text-base md:text-lg font-bold text-gray-900">
                {signatureTab === 'type' ? 'Type Your Signature' : signatureTab === 'draw' ? 'Draw Your Signature' : 'Upload Your Signature'}
              </h3>
              <button onClick={() => setSignatureModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-4 md:gap-6 px-4 md:px-6 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
              {['type', 'draw', 'upload'].map(t => (
                <button key={t} onClick={() => setSignatureTab(t as any)} className={`py-2 md:py-3 text-[13px] md:text-[14px] font-medium border-b-2 transition capitalize flex-shrink-0 ${signatureTab === t ? 'border-[#1a73e8] text-[#1a73e8]' : 'border-transparent text-gray-500'}`}>{t}</button>
              ))}
            </div>
            <div className="p-4 md:p-6 min-h-[200px]">
              {signatureTab === 'type' && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-800 mb-2">Name</label>
                  <input type="text" placeholder="Enter your name" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} className="w-full h-11 px-3 md:px-4 border border-gray-200 rounded-lg text-[13px] md:text-[14px] outline-none focus:border-[#1a73e8] mb-4" />
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(style => (
                      <button key={style} onClick={() => setSignatureStyle(String(style))} className={`h-16 md:h-[80px] rounded-xl border-2 flex items-center justify-center transition ${signatureStyle === String(style) ? 'border-[#1a73e8] bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
                        <span className={`text-lg md:text-2xl ${style === 1 ? 'font-serif italic' : style === 2 ? 'font-sans italic font-bold' : style === 3 ? 'font-serif tracking-widest' : 'font-mono italic'}`}>{signatureName || 'Your Name'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {signatureTab === 'draw' && (
                <div className="flex flex-col">
                  <div className="w-full h-[160px] md:h-[200px] border-2 border-dashed border-gray-300 rounded-xl bg-white relative overflow-hidden">
                    <canvas ref={canvasRef} width={500} height={200} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full cursor-crosshair touch-none" />
                  </div>
                  <button onClick={clearCanvas} className="text-left text-[13px] md:text-sm text-gray-500 hover:text-gray-800 mt-3 underline">Clear</button>
                </div>
              )}
              {signatureTab === 'upload' && (
                <div className="w-full h-[160px] md:h-[200px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
                  <input type="file" accept="image/*" onChange={handleSignatureImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {signatureImage ? <img src={signatureImage} alt="Signature" className="w-full h-full object-contain p-2" /> : <p className="text-[12px] md:text-sm font-semibold text-gray-800">Click to upload</p>}
                </div>
              )}
            </div>
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex items-center justify-end gap-2 md:gap-3">
              <button onClick={handleSaveSignature} disabled={saving} className={`px-4 md:px-6 py-2 md:py-2.5 text-[13px] md:text-[14px] font-medium text-white rounded-lg transition ${saving ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>{saving ? 'Creating...' : 'Use Signature'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, label, icon, active = false, badge = 0, onClick }: { href: string; label: string; icon: React.ReactNode; active?: boolean; badge?: number; onClick?: () => void; }) {
  return (
    <Link href={href} onClick={onClick} className={`relative flex items-center gap-3 px-3 py-2.5 text-[13.5px] rounded-md ${active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 font-medium'}`}>
      {active && (<span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-[#1a73e8] rounded-r"></span>)}
      <span className="text-gray-500">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">{badge > 99 ? '99+' : badge}</span>}
    </Link>
  );
}

function StatCard({ number, label }: { number: number; label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 md:px-6 py-3 md:py-5">
      <div className="flex items-baseline gap-2 md:gap-3">
        <span className="text-2xl md:text-3xl font-bold text-gray-900">{number}</span>
        <span className="text-[12px] md:text-[15px] text-gray-700 font-medium">{label}</span>
      </div>
    </div>
  );
}

function ProfileActionMenu({ 
  onClose, 
  onEditProfile,
  onAssignProgram, 
  onSendForm, 
  onAssignStaff, 
  onAssignGroup, 
  onArchive, 
  onDelete 
}: { 
  onClose: () => void;
  onEditProfile: () => void;
  onAssignProgram: () => void;
  onSendForm: () => void;
  onAssignStaff: () => void;
  onAssignGroup: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Profile actions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-3 md:p-4 space-y-2 overflow-y-auto">
          
          {/* NEW: Edit profile button */}
          <button onClick={onEditProfile} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition text-left">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <span className="text-[14px] md:text-[15px] font-medium text-blue-800">Edit profile</span>
          </button>

          <button onClick={onAssignProgram} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-left">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <span className="text-[14px] md:text-[15px] font-medium text-gray-800">Assign program</span>
          </button>
          <button onClick={onSendForm} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-left">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </div>
            <span className="text-[14px] md:text-[15px] font-medium text-gray-800">Send form</span>
          </button>
          <button onClick={onAssignStaff} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-left">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 flex-shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </div>
            <span className="text-[14px] md:text-[15px] font-medium text-gray-800">Assign staff</span>
          </button>
          <button onClick={onAssignGroup} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-left">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 flex-shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <span className="text-[14px] md:text-[15px] font-medium text-gray-800">Assign group</span>
          </button>
          <button onClick={onArchive} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-left">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 flex-shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
            <span className="text-[14px] md:text-[15px] font-medium text-gray-800">Archive profile</span>
          </button>
          <button onClick={onDelete} className="w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition text-left mt-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
            </div>
            <span className="text-[14px] md:text-[15px] font-medium text-red-600">Delete profile</span>
          </button>
        </div>
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