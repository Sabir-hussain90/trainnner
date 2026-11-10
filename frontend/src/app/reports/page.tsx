'use client';

import { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const REPORT_TYPE_GROUPS = [
  { title: 'Profiles and Metric', subtitle: 'Standard' },
  { title: 'Users and Metric', subtitle: 'Standard' },
  { title: 'Groups and Metric', subtitle: 'Standard' },
  { title: 'Profiles and Tasks', subtitle: 'Standard' },
  { title: 'Profiles and Forms', subtitle: 'Standard' },
  { title: 'Users and Groups', subtitle: 'Standard' },
  { title: 'Workouts and Completion', subtitle: 'Standard' },
  { title: 'Programs and Progress', subtitle: 'Standard' },
  { title: 'Assessments and Results', subtitle: 'Standard' },
  { title: 'Activity and Engagement', subtitle: 'Standard' },
];

const METRIC_OPTIONS = [
  'Weight', 'Body Fat %', 'BMI', 'Chest Circumference',
  'Waist Circumference', 'Body Composition', 'Blood Pressure',
];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

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
  weight: "Weight can a tricky metric to use as a measurement of progress. Although it is a very easy to record, it must be combined with other factors such as height and body fat percentage.",
  body_fat: "Keep in mind that the comparison classifications vary by age and by gender.",
  lean_mass: "Lean Body Mass (LBM) is a measurement of body composition calculated by subtracting the weight of your body fat from your total body weight.",
  bmi: "Body Mass Index (BMI) is a standardized formula to determine the ratio between height and weight.",
  metabolic_rate: "Your metabolism is the process by which your body converts what you eat and drink into energy.",
  vo2max: "VO2Max is a measurement of your body's ability to process a volume of oxygen and is indexed to your body mass.",
  ymca_sit: "This is a common measurement of flexibility in the lower back and hamstrings.",
  trunk_lift: "This test measures your upper body flexibility.",
  move_overhead: "The Overhead Squat Assessment (OHSA) is a head to toe assessment of your kinetic chain.",
  move_t_spine: "Your thoracic spine runs from the base of the neck down to the abdomen.",
  move_shoulder: "This assessment examines your ability to stabilize your scapula during pushing movements.",
  move_hurdle: "This is an assessment of your ability to maintain stability when standing on one leg.",
  move_bend: "This is an assessment of your squatting movement patterns.",
  screen_aslr: "This assessment is used to assess your stability through your lower back and across your hips.",
  screen_shoulder: "This assessment examines your ability to stabilize your scapula.",
  screen_rotary: "Rotary stability is a measure of your ability to transfer force through your core.",
  screen_inline: "The inline lunge assessment evaluates your ability to maintain stability.",
  screen_hurdle: "The hurdle step assessment examines stability during a single-leg movement.",
  screen_trunk: "The trunk stability push-up assessment evaluates spine stability.",
  screen_squat: "The deep squat assessment is a full-body movement that helps identify issues."
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
  ['metabolic_inbody','metabolic_result','metabolic_harris'].forEach(k => { if (initial[k] !== undefined) initial[k] = INTERPRETATION_TEXT.metabolic_rate; });
  ['vo2_1mile','vo2_ebbeling','vo2_3min','vo2_12min','vo2_15mile','vo2_cycle','vo2_bruce','vo2_result'].forEach(k => { if (initial[k] !== undefined) initial[k] = INTERPRETATION_TEXT.vo2max; });
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

type Report = {
  id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  creator?: string;
  creatorId?: string;
  createdAt?: string;
  updatedAt?: string;
  data?: any;
  periodStart?: string | null;
  periodEnd?: string | null;
  raw?: any;
};

type User = { id?: string; name: string; email: string; role: string };
type Option = { id: string; name: string; email?: string };

// ==================== CHOOSE REPORT TYPE MODAL ====================
function ChooseReportTypeModal({
  open, onClose, onChoose,
}: { open: boolean; onClose: () => void; onChoose: (type: string) => void; }) {
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => { if (open) setSearch(''); }, [open]);
  if (!open) return null;

  const filtered = REPORT_TYPE_GROUPS.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-[560px] max-h-[92vh] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
          <div className="w-12 h-12 rounded-full bg-[#e8f0fe] flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#1a73e8]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-8M12 20V4M19 20v-12" /></svg>
          </div>
          <h2 className="text-lg sm:text-[20px] font-bold text-gray-900 leading-tight">Choose Report Type</h2>
        </div>

        <div className="px-4 sm:px-8 pb-4">
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" autoFocus placeholder="Search report types..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[48px] sm:h-[52px] pl-11 pr-4 border-2 border-[#1a73e8] rounded-full text-[14px] sm:text-[14.5px] outline-none transition focus:ring-4 focus:ring-[#1a73e8]/10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-6">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">No report types found.</div>
          ) : filtered.map((g) => {
            const isHovered = hovered === g.title;
            return (
              <button key={g.title} type="button" onMouseEnter={() => setHovered(g.title)} onMouseLeave={() => setHovered(null)} onClick={() => onChoose(g.title)}
                className="w-full flex items-center justify-between py-3.5 sm:py-4 border-b border-gray-100 text-left transition">
                <div className="min-w-0 pr-3">
                  <p className={`text-[14px] sm:text-[15.5px] font-semibold transition truncate ${isHovered ? 'text-[#1a73e8]' : 'text-gray-900'}`}>{g.title}</p>
                  <p className={`text-[12.5px] sm:text-[13px] mt-0.5 transition ${isHovered ? 'text-[#1a73e8]/80' : 'text-gray-500'}`}>{g.subtitle}</p>
                </div>
                <svg className={`w-4 h-4 flex-shrink-0 transition ${isHovered ? 'text-[#1a73e8]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== SETTINGS SECTIONS ====================
function MetricsSection({ title, rows, metricsData, setMetricsData }: { title: string; rows: { id: string; label: string }[]; metricsData: any; setMetricsData: any; }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>{title}
      </h3>
      <div className="bg-white border border-gray-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[480px]">
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
                  <input type="text" value={metricsData[row.id]?.days ?? ''} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); setMetricsData((prev: any) => ({ ...prev, [row.id]: { ...prev[row.id], days: val } })); }} placeholder="—" className="w-20 sm:w-24 h-9 text-center border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 text-center">
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
        <table className="w-full text-left border-collapse min-w-[680px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 sm:py-4 px-3 sm:px-6 text-[12px] sm:text-[13px] font-semibold text-gray-600 w-1/3">Metric</th>
              {TESTING_COLUMNS.map(col => (
                <th key={col.id} className="py-3 sm:py-4 px-2 sm:px-6 text-center">
                  <span className="px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full uppercase tracking-wider whitespace-nowrap inline-block">{col.label}</span>
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
        <table className="w-full text-left border-collapse min-w-[560px]">
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
                    <textarea value={resultsData[row.id] ?? ''} onChange={(e) => { setResultsData((prev: any) => ({ ...prev, [row.id]: e.target.value })); }} placeholder="Enter interpretation here..." rows={4} className="w-full p-3 sm:p-4 border border-gray-200 rounded-xl text-[13px] sm:text-[14px] text-gray-700 outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 bg-white resize-y" />
                    <div className="text-[10px] sm:text-[11px] text-gray-400 mt-1 text-right">{(resultsData[row.id] ?? '').length} / 1500</div>
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

// ==================== REPORT BUILDER ====================
function ReportBuilder({
  reportType, onBack, token, onSaved, editingReport, canCreate, profileId,
}: {
  reportType: string;
  onBack: () => void;
  token: string | null;
  onSaved: () => Promise<void> | void;
  editingReport?: Report | null;
  canCreate: boolean;
  profileId?: string;
}) {
  const [metric, setMetric] = useState('');
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [gender, setGender] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [groupOptions, setGroupOptions] = useState<Option[]>([]);
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const [groupsOpen, setGroupsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const groupsRef = useRef<HTMLDivElement>(null);
  const usersRef = useRef<HTMLDivElement>(null);

  const [runResult, setRunResult] = useState<{
    filters: any;
    rows: any[];
    summary: { total: number; metric: string; generatedAt: string };
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!token) return;
    setOptionsLoading(true);
    (async () => {
      try {
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        const [gRes, uRes] = await Promise.all([
          fetch(`${API_URL}/groups`, { headers }),
          fetch(`${API_URL}/users`, { headers }),
        ]);
        if (gRes.ok) {
          const gd = await gRes.json();
          if (Array.isArray(gd)) setGroupOptions(gd.map((g: any) => ({ id: g.id, name: g.name || g.id })));
        }
        if (uRes.ok) {
          const ud = await uRes.json();
          if (Array.isArray(ud)) {
            setUserOptions(ud.map((u: any) => ({
              id: u.id,
              name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || u.id,
              email: u.email || '',
            })));
          }
        }
      } catch (err) { console.error('[report builder options]', err); }
      finally { setOptionsLoading(false); }
    })();
  }, [token]);

  useEffect(() => {
    if (!editingReport) return;
    const d = editingReport.data || {};
    setMetric(d.metric || '');
    setAgeFrom(d.ageFrom || '');
    setAgeTo(d.ageTo || '');
    setGender(d.gender || '');
    setSelectedGroupIds(Array.isArray(d.groupIds) ? d.groupIds : []);
    setSelectedUserIds(Array.isArray(d.userIds) ? d.userIds : []);
  }, [editingReport]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (groupsRef.current && !groupsRef.current.contains(t)) setGroupsOpen(false);
      if (usersRef.current && !usersRef.current.contains(t)) setUsersOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const toggleGroup = (id: string) =>
    setSelectedGroupIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleUser = (id: string) =>
    setSelectedUserIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const groupLabel = selectedGroupIds.length === 0
    ? 'Select group'
    : selectedGroupIds.length === 1
      ? (groupOptions.find((g) => g.id === selectedGroupIds[0])?.name || '1 group')
      : `${selectedGroupIds.length} groups selected`;

  const userLabel = selectedUserIds.length === 0
    ? 'Select user'
    : selectedUserIds.length === 1
      ? (userOptions.find((u) => u.id === selectedUserIds[0])?.name || '1 user')
      : `${selectedUserIds.length} users selected`;

  const handleRun = async () => {
    if (!token) { setToast({ message: 'Missing auth token', type: 'error' }); return; }
    if (!metric) { setToast({ message: 'Please select a metric first', type: 'error' }); return; }

    setToast({ message: 'Running report...', type: 'success' });
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_URL}/profiles`, { headers });
      let allProfiles: any[] = [];
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) allProfiles = data;
      }

      const filtered = allProfiles.filter((p: any) => {
        if (profileId && String(p.id) !== String(profileId)) return false;
        if (ageFrom || ageTo) {
          const age = typeof p.age === 'number' ? p.age : p.dateOfBirth
            ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
            : null;
          if (age != null) {
            if (ageFrom && age < Number(ageFrom)) return false;
            if (ageTo && age > Number(ageTo)) return false;
          }
        }
        if (gender) {
          const pg = (p.gender || p.sex || '').toString().toLowerCase();
          if (pg && !pg.startsWith(gender.toLowerCase())) return false;
        }
        if (selectedGroupIds.length > 0) {
          const pgIds: string[] = (Array.isArray(p.groups) && p.groups.map((g: any) => g.id || g.groupId || g)) || (p.groupId ? [p.groupId] : []);
          if (!pgIds.some((id) => selectedGroupIds.includes(String(id)))) return false;
        }
        if (selectedUserIds.length > 0) {
          const puid = p.userId || p.creatorId || p.createdById || p.user?.id;
          if (puid && !selectedUserIds.includes(String(puid))) return false;
        }
        return true;
      });

      const rows = filtered.map((p: any) => ({
        id: p.id,
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || p.email || '—',
        email: p.email || '—',
        age: typeof p.age === 'number' ? p.age : p.dateOfBirth
          ? Math.floor((Date.now() - new Date(p.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
          : '—',
        gender: p.gender || p.sex || '—',
        metric,
        value: p.metricValue ?? p.metrics?.[metric] ?? p[metric] ?? p[metric.replace(/\s+/g, '').toLowerCase()] ?? '—',
      }));

      setRunResult({
        filters: {
          reportType, metric,
          ageFrom: ageFrom || null, ageTo: ageTo || null,
          gender: gender || null,
          groupIds: selectedGroupIds, userIds: selectedUserIds,
          ...(profileId ? { profileId } : {}),
        },
        rows,
        summary: { total: rows.length, metric, generatedAt: new Date().toISOString() },
      });

      setToast({ message: `Report ran — ${rows.length} row(s)`, type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Run failed', type: 'error' });
    }
  };

  const handleSave = async () => {
    if (!canCreate) { setToast({ message: 'You do not have permission to save reports.', type: 'error' }); return; }
    if (!token) { setToast({ message: 'Missing auth token', type: 'error' }); return; }
    if (!metric) { setToast({ message: 'Please select a metric first', type: 'error' }); return; }
    if (!runResult) { setToast({ message: 'Run the report first, then save.', type: 'error' }); return; }

    setSaving(true);
    try {
      const body = {
        name: `${reportType} — ${metric} — ${new Date().toLocaleDateString('en-US')}`,
        type: 'metrics',
        data: {
          ...runResult.filters,
          summary: runResult.summary,
          rows: runResult.rows.slice(0, 500),
          ...(profileId ? { profileId } : {}),
        },
        periodStart: null,
        periodEnd: null,
      };

      const res = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const errBody = await res.json().catch(() => ({})); throw new Error(errBody.message || `Failed (${res.status})`); }
      setToast({ message: profileId ? 'Report saved to profile' : 'Report saved', type: 'success' });
      await onSaved();
    } catch (err: any) {
      setToast({ message: err.message || 'Save failed', type: 'error' });
    } finally { setSaving(false); }
  };

  const handleExport = () => {
    if (!runResult) { setToast({ message: 'Run the report first, then export.', type: 'error' }); return; }
    try {
      const header = ['ID', 'Name', 'Email', 'Age', 'Gender', 'Metric', 'Value'];
      const rows = runResult.rows.map((r) => [r.id, r.name, r.email, String(r.age), r.gender, r.metric, String(r.value)]);
      const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ message: 'CSV exported', type: 'success' });
    } catch { setToast({ message: 'Export failed', type: 'error' }); }
  };

  const canSave = !!metric && !!runResult && canCreate;

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f6f8]">
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
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-7 pb-4 sm:pb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center flex-shrink-0 transition">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-[22px] font-bold text-gray-900 leading-tight truncate">{reportType}</h1>
              <p className="text-[13px] text-gray-500 leading-tight mt-0.5">
                Standard{profileId ? ' · Scoped to profile' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button type="button" onClick={handleExport} disabled={!runResult}
              className={`flex items-center gap-2 px-3 sm:px-4 h-[42px] rounded-full border border-gray-200 bg-white text-[13px] sm:text-[14px] font-medium transition flex-1 sm:flex-none justify-center ${!runResult ? 'opacity-60 cursor-not-allowed text-gray-400' : 'hover:bg-gray-50 text-gray-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4" /></svg>
              Export
            </button>
            <button type="button" onClick={handleSave} disabled={saving || !canSave}
              title={!canCreate ? 'You do not have permission to save reports' : undefined}
              className={`flex items-center gap-2 px-3 sm:px-4 h-[42px] rounded-full border border-gray-200 bg-white text-[13px] sm:text-[14px] font-medium transition flex-1 sm:flex-none justify-center ${(saving || !canSave) ? 'opacity-60 cursor-not-allowed text-gray-400' : 'hover:bg-gray-50 text-gray-700'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8" /></svg>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={handleRun}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 h-[42px] rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[13px] sm:text-[14px] font-semibold transition shadow-sm flex-1 sm:flex-none">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Run
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-7 max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm">
          <p className="text-[11px] font-bold text-gray-500 tracking-[0.12em] uppercase mb-4 sm:mb-6">Report Filters</p>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 sm:gap-5 mb-4 sm:mb-5">
            <div>
              <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Metric: <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={metric} onChange={(e) => setMetric(e.target.value)}
                  className={`w-full h-[48px] px-4 border rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10 ${!metric ? 'text-gray-400' : 'text-gray-800'} border-gray-300`}>
                  <option value="">Select Metric</option>
                  {METRIC_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Age From:</label>
              <div className="relative">
                <select value={ageFrom} onChange={(e) => setAgeFrom(e.target.value)}
                  className={`w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10 ${!ageFrom ? 'text-gray-400' : 'text-gray-800'}`}>
                  <option value="">Select</option>
                  {Array.from({ length: 100 }).map((_, i) => <option key={i} value={String(i + 1)}>{i + 1}</option>)}
                </select>
                <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Age To:</label>
              <div className="relative">
                <select value={ageTo} onChange={(e) => setAgeTo(e.target.value)}
                  className={`w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10 ${!ageTo ? 'text-gray-400' : 'text-gray-800'}`}>
                  <option value="">Select</option>
                  {Array.from({ length: 100 }).map((_, i) => <option key={i} value={String(i + 1)}>{i + 1}</option>)}
                </select>
                <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4 sm:gap-5">
            <div>
              <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Gender:</label>
              <div className="relative">
                <select value={gender} onChange={(e) => setGender(e.target.value)}
                  className={`w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10 ${!gender ? 'text-gray-400' : 'text-gray-800'}`}>
                  <option value="">Select a sex</option>
                  {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Date:</label>
              <button type="button" className="w-full h-[48px] px-4 border border-gray-300 rounded-full bg-white flex items-center gap-2.5 text-[14px] text-gray-800 outline-none transition hover:bg-gray-50">
                <svg className="w-4 h-4 text-[#1a73e8] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                <span className="truncate">10/15/2025 – 10/15/2026</span>
                <svg className="w-4 h-4 text-gray-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>

            <div className="relative" ref={groupsRef}>
              <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Groups:</label>
              <button type="button" onClick={() => setGroupsOpen((v) => !v)}
                className="w-full h-[48px] px-4 border border-gray-300 rounded-full bg-white flex items-center gap-2.5 text-[14px] text-gray-800 outline-none transition hover:bg-gray-50">
                <svg className="w-4 h-4 text-[#1a73e8] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                <span className={`truncate ${selectedGroupIds.length === 0 ? 'text-gray-500' : 'text-gray-800'}`}>{groupLabel}</span>
                <svg className={`w-4 h-4 text-gray-500 ml-auto flex-shrink-0 transition-transform ${groupsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {groupsOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-56 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <span className="text-[12px] text-gray-500">{optionsLoading ? 'Loading...' : `${groupOptions.length} group(s)`}</span>
                    {selectedGroupIds.length > 0 && (
                      <button type="button" onClick={() => setSelectedGroupIds([])} className="text-[12px] text-[#1a73e8] hover:underline">Clear</button>
                    )}
                  </div>
                  {groupOptions.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-400 text-center">No groups available</div>
                  ) : groupOptions.map((g) => {
                    const checked = selectedGroupIds.includes(g.id);
                    return (
                      <label key={g.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none transition ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <span className={`w-4 h-4 flex items-center justify-center rounded border-2 transition flex-shrink-0 ${checked ? 'bg-[#1a73e8] border-[#1a73e8]' : 'bg-white border-gray-300'}`}>
                          {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleGroup(g.id)} />
                        <span className="text-[13.5px] text-gray-800 truncate">{g.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="relative" ref={usersRef}>
              <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Users:</label>
              <button type="button" onClick={() => setUsersOpen((v) => !v)}
                className="w-full h-[48px] px-4 border border-gray-300 rounded-full bg-white flex items-center gap-2.5 text-[14px] text-gray-800 outline-none transition hover:bg-gray-50">
                <svg className="w-4 h-4 text-[#1a73e8] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className={`truncate ${selectedUserIds.length === 0 ? 'text-gray-500' : 'text-gray-800'}`}>{userLabel}</span>
                <svg className={`w-4 h-4 text-gray-500 ml-auto flex-shrink-0 transition-transform ${usersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {usersOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-56 overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                    <span className="text-[12px] text-gray-500">{optionsLoading ? 'Loading...' : `${userOptions.length} user(s)`}</span>
                    {selectedUserIds.length > 0 && (
                      <button type="button" onClick={() => setSelectedUserIds([])} className="text-[12px] text-[#1a73e8] hover:underline">Clear</button>
                    )}
                  </div>
                  {userOptions.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-gray-400 text-center">No users available</div>
                  ) : userOptions.map((u) => {
                    const checked = selectedUserIds.includes(u.id);
                    return (
                      <label key={u.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none transition ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <span className={`w-4 h-4 flex items-center justify-center rounded border-2 transition flex-shrink-0 ${checked ? 'bg-[#1a73e8] border-[#1a73e8]' : 'bg-white border-gray-300'}`}>
                          {checked && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>}
                        </span>
                        <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleUser(u.id)} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] text-gray-800 truncate">{u.name}</p>
                          {u.email && <p className="text-[11.5px] text-gray-500 truncate">{u.email}</p>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm min-h-[260px]">
          <p className="text-[11px] font-bold text-gray-500 tracking-[0.12em] uppercase mb-4">Report Details</p>

          {!runResult ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 20v-8M12 20V4M19 20v-12" /></svg>
              </div>
              <p className="text-[13px] sm:text-[14px] text-gray-500 px-4">
                Select a metric and click <span className="font-semibold text-gray-800">Run</span> to see report details.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rows</p>
                  <p className="text-[22px] font-bold text-gray-900">{runResult.summary.total}</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Metric</p>
                  <p className="text-[16px] font-semibold text-gray-900 truncate">{runResult.summary.metric}</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4 sm:col-span-2 md:col-span-1">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Generated</p>
                  <p className="text-[13.5px] text-gray-700">{new Date(runResult.summary.generatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-left text-gray-500 bg-gray-50/40 border-b border-gray-100">
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Name</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Email</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Age</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">Gender</th>
                      <th className="px-3 sm:px-4 py-3 font-medium text-xs">{runResult.summary.metric}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runResult.rows.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">No matching records for the selected filters.</td></tr>
                    ) : runResult.rows.slice(0, 100).map((r) => (
                      <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-3 text-gray-800 font-medium">{r.name}</td>
                        <td className="px-3 sm:px-4 py-3 text-gray-600">{r.email}</td>
                        <td className="px-3 sm:px-4 py-3 text-gray-600">{r.age}</td>
                        <td className="px-3 sm:px-4 py-3 text-gray-600">{r.gender}</td>
                        <td className="px-3 sm:px-4 py-3 text-gray-800 font-semibold">{String(r.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {runResult.rows.length > 100 && (
                <p className="text-[12px] text-gray-500 mt-2">Showing first 100 of {runResult.rows.length} rows.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== DEFAULT EXPORT (server-safe outer shell) ====================
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading reports...</p>
        </div>
      }
    >
      <ReportsPage />
    </Suspense>
  );
}

// ==================== INNER CLIENT COMPONENT (uses useSearchParams) ====================
function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileIdFromQuery = searchParams.get('profileId') || '';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [view, setView] = useState<'list' | 'builder' | 'account-info' | 'account-settings'>('list');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [unreadConversations, setUnreadConversations] = useState<any[]>([]);
  const [openSections, setOpenSections] = useState({ home: true, organization: true, library: true, analytics: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<Report[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [selectedType, setSelectedType] = useState<string>('');
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [chooseTypeOpen, setChooseTypeOpen] = useState(false);
  const [actionsReport, setActionsReport] = useState<Report | null>(null);
  const [deleteReport, setDeleteReport] = useState<Report | null>(null);
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

  // ACCOUNT SETTINGS
  type SettingsTab = 'privileges' | 'metrics' | 'testing' | 'results' | 'branding' | 'integrations';
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('privileges');
  const [primaryColor, setPrimaryColor] = useState('#F59E0B');
  const [accountLogo, setAccountLogo] = useState<string | null>(null);
  const accountLogoInputRef = useRef<HTMLInputElement>(null);
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

  const can = useCallback((key: string): boolean => {
    if (!user) return false;
    const roleKey = (user.role || '').toLowerCase() as 'admin' | 'supervisor' | 'staff';
    if (roleKey !== 'admin' && roleKey !== 'supervisor' && roleKey !== 'staff') return false;
    return privileges?.[key]?.[roleKey] === true;
  }, [user, privileges]);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const canCreateReport = can('create_forms');
  const canDeleteReport = can('delete_forms');

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('access_token')
    );
  };

  const authHeaders = (): HeadersInit => {
    const t = getToken();
    return t ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` } : { 'Content-Type': 'application/json' };
  };

  const creatorName = (r: any): string => {
    if (!r) return '';
    if (r.creator) {
      const full = `${r.creator.firstName || ''} ${r.creator.lastName || ''}`.trim();
      return full || r.creator.email || '';
    }
    return r.createdBy || '';
  };

  const fetchReports = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await fetch(`${API_URL}/reports`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data.map((r: any) => ({
          id: r.id,
          name: r.name || '',
          type: r.type || 'metrics',
          category: r.data?.reportType || r.category || '—',
          description: r.description || '',
          creator: creatorName(r),
          creatorId: r.creatorId,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          data: r.data || {},
          periodStart: r.periodStart || null,
          periodEnd: r.periodEnd || null,
          raw: r,
        })));
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load reports', type: 'error' });
    } finally { setDataLoading(false); }
  }, []);

  const fetchPrivileges = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/privileges`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object') setPrivileges((prev) => ({ ...prev, ...data }));
    } catch { }
  }, []);

  const fetchUnreadMessages = useCallback(async (tk: string) => {
    try {
      const res = await fetch(`${API_URL}/messages`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setUnreadConversations(data.filter((c: any) => c.unread === true || (typeof c.unreadCount === 'number' && c.unreadCount > 0)));
      }
    } catch (err) { console.error('[fetchUnreadMessages]', err); }
  }, []);

  useEffect(() => {
    const tk = getToken();
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (!tk || !storedUser) { router.push('/'); return; }
    setToken(tk);

    let parsed: any = {};
    try { parsed = JSON.parse(storedUser); } catch { router.push('/'); return; }

    const safeName = parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || parsed.email || 'User';
    setUser({ ...parsed, name: safeName, role: parsed.role || 'User' });
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
        if (s.integrations) setIntegrations((prev) => ({ ...prev, ...s.integrations, styku: { ...prev.styku, ...(s.integrations.styku || {}) } }));
        if (s.privileges) setPrivileges((prev) => ({ ...prev, ...s.privileges }));
        if (s.measurementSystem) setMeasurementSystem(s.measurementSystem);
        if (s.metricsData) setMetricsData((prev) => ({ ...prev, ...s.metricsData }));
        if (s.testingData) setTestingData((prev) => ({ ...prev, ...s.testingData }));
        if (s.resultsData) setResultsData((prev) => ({ ...prev, ...s.resultsData }));
      } catch {}
    }

    setLoading(false);
    fetchReports();
    fetchPrivileges();
    fetchUnreadMessages(tk);

    const interval = setInterval(() => { if (tk) fetchUnreadMessages(tk); }, 30000);
    return () => clearInterval(interval);
  }, [router, fetchReports, fetchPrivileges, fetchUnreadMessages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (accountMenuRef.current && !accountMenuRef.current.contains(t)) setAccountMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(t)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const anyOverlay = deleteReport || actionsReport || chooseTypeOpen || isSidebarOpen;
    document.body.style.overflow = anyOverlay ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [deleteReport, actionsReport, chooseTypeOpen, isSidebarOpen]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const getInitials = (n: string) => {
    const parts = (n || '').split(/[.\s+_-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (n || 'U').slice(0, 2).toUpperCase();
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '—'; }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    sessionStorage.clear();
    router.push('/');
  };

  const toggleSection = (key: keyof typeof openSections) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const goToReports = () => {
    setAccountMenuOpen(false);
    setIsSidebarOpen(false);
    setView('list');
    setEditingReport(null);
    setSelectedType('');
  };

  const openNewReportFlow = () => {
    if (!canCreateReport) { setToast({ message: 'You do not have permission to create reports.', type: 'error' }); return; }
    setEditingReport(null);
    setChooseTypeOpen(true);
  };

  const handleChooseType = (type: string) => {
    setChooseTypeOpen(false);
    setSelectedType(type);
    setView('builder');
  };

  const handleDuplicateReport = async () => {
    if (!actionsReport || !token) return;
    if (!canCreateReport) { setToast({ message: 'You do not have permission to duplicate reports.', type: 'error' }); setActionsReport(null); return; }
    try {
      const src = actionsReport.raw || {};
      const body = {
        name: `${actionsReport.name} - duplicate`,
        type: src.type || actionsReport.type || 'metrics',
        data: src.data || actionsReport.data || {},
        periodStart: src.periodStart || null,
        periodEnd: src.periodEnd || null,
      };
      const res = await fetch(`${API_URL}/reports`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: `"${actionsReport.name}" duplicated`, type: 'success' });
      setActionsReport(null);
      await fetchReports();
    } catch (err: any) {
      setToast({ message: err.message || 'Duplicate failed', type: 'error' });
    }
  };

  const handleOpenDelete = () => {
    if (!canDeleteReport) { setToast({ message: 'You do not have permission to delete reports.', type: 'error' }); return; }
    if (actionsReport) { setDeleteReport(actionsReport); setActionsReport(null); }
  };

  const confirmDeleteReport = async () => {
    if (!deleteReport) return;
    if (!canDeleteReport) { setToast({ message: 'You do not have permission to delete reports.', type: 'error' }); setDeleteReport(null); return; }
    try {
      const res = await fetch(`${API_URL}/reports/${deleteReport.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: 'Report deleted successfully', type: 'success' });
      await fetchReports();
      setDeleteReport(null);
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

  const handleSaveAccountInfo = async () => {
    const errs: { [key: string]: string } = {};
    if (activeInfoTab === 'user') {
      if (!firstName.trim()) errs.firstName = 'First name is required';
      if (!lastName.trim()) errs.lastName = 'Last name is required';
      if (!email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
      if (newPassword && newPassword.length < 8) errs.newPassword = 'Password must be at least 8 characters';
      if (newPassword && newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

      if (Object.keys(errs).length > 0) { setInfoErrors(errs); setToast({ message: 'Please fix the highlighted fields', type: 'error' }); return; }

      setInfoErrors({});
      setSavingInfo(true);
      await new Promise((r) => setTimeout(r, 400));
      const updatedUser = { ...(user as any), name: `${firstName} ${lastName}`.trim(), email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (newPassword) localStorage.setItem('user_password', newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setSavingInfo(false);
      setToast({ message: 'User info saved successfully', type: 'success' });
    } else {
      if (!companyName.trim()) errs.companyName = 'Company name is required';
      if (!phone.trim()) errs.phone = 'Phone is required';
      if (Object.keys(errs).length > 0) { setInfoErrors(errs); setToast({ message: 'Please fix the highlighted fields', type: 'error' }); return; }

      setInfoErrors({});
      setSavingInfo(true);
      await new Promise((r) => setTimeout(r, 400));
      localStorage.setItem('business_info', JSON.stringify({
        companyName: companyName.trim(), phone: phone.trim(), address: address.trim(),
        city: city.trim(), state: stateName.trim(), zipCode: zipCode.trim(), website: website.trim(),
      }));
      setSavingInfo(false);
      setToast({ message: 'Business info saved successfully', type: 'success' });
    }
  };

  const handleAccountLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      localStorage.setItem('account_settings', JSON.stringify({ ...current, primaryColor, accountLogo: dataUrl, integrations }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    localStorage.setItem('account_settings', JSON.stringify({
      primaryColor, accountLogo, integrations, privileges, measurementSystem, metricsData, testingData, resultsData,
    }));

    if (!isAdmin) { setToast({ message: 'Account settings saved', type: 'success' }); return; }

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
      setToast({ message: 'Account settings saved', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to save privileges', type: 'error' });
    }
  };

  const handleTogglePrivilege = (rowId: string, role: 'admin' | 'supervisor' | 'staff') => {
    if (user?.role !== 'ADMIN') {
      setToast({ message: 'Only Admins can change privileges', type: 'error' });
      return;
    }

    setPrivileges((prev) => {
      const currentRow = prev[rowId] || { admin: true, supervisor: true, staff: true };
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
      } else if (role === 'supervisor') {
        if (!currentRow.admin) {
          setToast({ message: 'Cannot enable Supervisor — Admin must be enabled first', type: 'error' });
          return prev;
        }
        newRow.supervisor = !currentRow.supervisor;
        if (!newRow.supervisor) {
          newRow.staff = false;
          setToast({ message: 'Privilege removed for supervisor', type: 'success' });
        } else {
          setToast({ message: 'Privilege added for supervisor', type: 'success' });
        }
      } else {
        if (!currentRow.supervisor) {
          setToast({ message: 'Cannot enable Staff — Supervisor must be enabled first', type: 'error' });
          return prev;
        }
        newRow.staff = !currentRow.staff;
        if (newRow.staff) {
          setToast({ message: 'Privilege added for staff', type: 'success' });
        } else {
          setToast({ message: 'Privilege removed for staff', type: 'success' });
        }
      }

      return { ...prev, [rowId]: newRow };
    });
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          (r.name || '').toLowerCase().includes(q) ||
          (r.type || '').toLowerCase().includes(q) ||
          (r.category || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, searchQuery]);

  const totalItems = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const unreadCount = unreadConversations.length;

  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages, currentPage]);

  if (loading || !user) {
    return <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
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
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300
        lg:translate-x-0
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
          <div className="flex items-center gap-1">
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100" aria-label="Close menu">
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
                <NavLink
                  href="/reports"
                  label="Reports"
                  active={view === 'list'}
                  icon={<IconChart />}
                  onClick={(e: any) => { e.preventDefault(); goToReports(); }}
                />
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
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100" aria-label="Open menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <div className="relative" ref={notificationsRef}>
              <button onClick={() => setNotificationsOpen((v) => !v)} className="text-gray-500 hover:text-gray-700 relative p-1 rounded-full hover:bg-gray-100 transition" aria-label="Notifications">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-3 w-[290px] sm:w-[340px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-[14px] font-semibold text-gray-900">
                      Notifications {unreadCount > 0 && <span className="text-gray-500 font-normal">({unreadCount})</span>}
                    </p>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {unreadConversations.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">No unread messages</div>
                    ) : unreadConversations.map((c) => (
                      <Link href="/messages" key={c.id} onClick={() => setNotificationsOpen(false)} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition block">
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-gray-900 truncate">
                              {c.profile?.firstName || c.firstName || ''} {c.profile?.lastName || c.lastName || ''}
                            </p>
                            <p className="text-[12px] text-gray-500 truncate">{c.lastMessage || c.message || 'New message'}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={accountMenuRef}>
              <button onClick={() => setAccountMenuOpen(!accountMenuOpen)} className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-1.5 sm:px-2 py-1 transition">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold overflow-hidden">
                  {accountPhoto ? <img src={accountPhoto} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
                  <p className="text-[11px] text-gray-500 leading-none mt-1">{user.role}</p>
                </div>
              </button>

              {accountMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-[280px] sm:w-[320px] bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
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
                    <button onClick={() => { setAccountMenuOpen(false); goToReports(); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
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

        {view === 'list' && (
          <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Reports</h1>
                <p className="text-sm text-gray-500">
                  {profileIdFromQuery
                    ? 'This report will be linked to the profile you came from.'
                    : 'Build and run analytics reports across profiles, users, groups, and more.'}
                </p>
              </div>
              <button
                onClick={openNewReportFlow}
                disabled={!canCreateReport}
                title={!canCreateReport ? 'You do not have permission to create reports' : undefined}
                className={`text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm w-full sm:w-auto ${
                  canCreateReport
                    ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                New Report
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-3 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap border-b border-gray-100">
                <div className="relative flex-1 min-w-[200px] sm:max-w-md w-full">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search reports..." value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-full outline-none focus:border-[#1a73e8]" />
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto sm:ml-auto">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                    <button type="button" onClick={() => setViewMode('list')} title="List view" className={`w-8 h-8 flex items-center justify-center rounded-full transition ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </button>
                    <button type="button" onClick={() => setViewMode('grid')} title="Grid view" className={`w-8 h-8 flex items-center justify-center rounded-full transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    </button>
                  </div>
                  <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-gray-200 rounded-md px-3 py-2 outline-none bg-white font-medium">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {dataLoading && reports.length === 0 ? (
                <div className="px-6 py-16 text-center text-gray-400 text-sm">Loading reports...</div>
              ) : paginatedReports.length === 0 ? (
                <div className="px-6 py-16 text-center text-gray-400 text-sm">
                  No reports yet.{' '}
                  {canCreateReport ? (
                    <>Click <button onClick={openNewReportFlow} className="font-medium text-[#1a73e8] hover:underline">New Report</button> to get started.</>
                  ) : (
                    <>Ask an admin to create a report.</>
                  )}
                </div>
              ) : viewMode === 'list' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/40">
                        <th className="px-3 sm:px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></th>
                        <th className="px-3 sm:px-4 py-3 font-medium text-xs">Report Name</th>
                        <th className="px-3 sm:px-4 py-3 font-medium text-xs">Report Type</th>
                        <th className="px-3 sm:px-4 py-3 font-medium text-xs">Category</th>
                        <th className="px-3 sm:px-4 py-3 font-medium text-xs">Created By</th>
                        <th className="px-3 sm:px-4 py-3 font-medium text-xs">Updated</th>
                        <th className="px-3 sm:px-6 py-3 font-medium text-xs text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReports.map((r) => (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-gray-800">{r.name}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{r.type || '—'}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{r.category || '—'}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{r.creator || '—'}</td>
                          <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{formatDate(r.updatedAt || r.createdAt)}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                            <button onClick={() => setActionsReport(r)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 inline-flex">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {paginatedReports.map((r) => (
                    <div key={r.id} className="group relative border border-gray-200 rounded-2xl bg-white hover:shadow-md hover:border-gray-300 transition flex flex-col">
                      <div className="p-4 sm:p-5 flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[15px] font-semibold text-gray-900 truncate" title={r.name}>{r.name}</h3>
                          <p className="text-[12px] text-gray-500 truncate mt-0.5">{r.creator || 'Unknown creator'}</p>
                        </div>
                        <button onClick={() => setActionsReport(r)} className="opacity-0 group-hover:opacity-100 transition p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Actions">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                        </button>
                      </div>

                      <div className="px-4 sm:px-5 pb-4 flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-200">
                            {r.type || 'report'}
                          </span>
                          {r.category && r.category !== '—' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium">
                              {r.category}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {formatDate(r.updatedAt || r.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                        <button
                          onClick={() => { setEditingReport(r); setSelectedType(r.category || r.type || 'Profiles and Metric'); setView('builder'); }}
                          disabled={!canCreateReport}
                          title={!canCreateReport ? 'You do not have permission to edit reports' : undefined}
                          className={`text-[12.5px] font-medium ${canCreateReport ? 'text-[#1a73e8] hover:underline' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                          Open
                        </button>
                        <button onClick={() => setActionsReport(r)} className="text-[12.5px] font-medium text-gray-500 hover:text-gray-800">More</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-4 border-t border-gray-100 gap-3">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-700">{startItem}–{endItem}</span> of <span className="font-semibold text-gray-700">{totalItems}</span>
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-3 sm:px-4 py-2 text-sm rounded-lg border transition ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    Previous
                  </button>
                  <button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}
                    className={`flex items-center gap-1 px-3 sm:px-4 py-2 text-sm rounded-lg border transition ${currentPage >= totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-white' : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'}`}>
                    Next
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'builder' && (
          <ReportBuilder
            reportType={selectedType}
            onBack={() => { setView('list'); setEditingReport(null); }}
            token={token}
            onSaved={fetchReports}
            editingReport={editingReport}
            canCreate={canCreateReport}
            profileId={profileIdFromQuery}
          />
        )}

        {/* ACCOUNT INFO */}
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
                    <button onClick={() => { setActiveInfoTab('user'); setInfoErrors({}); }} className={`px-4 sm:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeInfoTab === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>User Info</button>
                    <button onClick={() => { setActiveInfoTab('business'); setInfoErrors({}); }} className={`px-4 sm:px-5 py-2 text-[14px] font-medium rounded-full transition ${activeInfoTab === 'business' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Business Info</button>
                  </div>
                </div>

                {activeInfoTab === 'user' && (
                  <div className="p-4 sm:p-6 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-10">
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
                        <div className="border border-gray-200 rounded-2xl p-4 sm:p-6">
                          <p className="text-[11px] font-bold text-gray-500 tracking-[0.12em] uppercase mb-5">Change password — leave blank to keep current</p>
                          <div className="space-y-5">
                            <div>
                              <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">New password</label>
                              <div className="relative">
                                <input type={showNewPassword ? 'text' : 'password'} placeholder="Min 8 chars, upper, lower, number, special" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`w-full h-[48px] px-4 pr-12 border rounded-lg text-[14px] placeholder-gray-400 outline-none transition ${infoErrors.newPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
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
                        <div className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] mb-6">
                          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {accountPhoto ? <img src={accountPhoto} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-[42px] font-semibold text-gray-600">{getInitials(user.name)}</span>}
                          </div>
                          {accountPhoto && (
                            <button type="button" onClick={handleRemoveAccountPhoto} title="Remove photo" className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                            </button>
                          )}
                        </div>
                        <button type="button" onClick={handleAccountPhotoClick} className="px-6 h-[42px] border border-gray-300 rounded-full bg-white hover:bg-gray-50 text-[14px] font-medium text-gray-700 transition">
                          {accountPhoto ? 'Change photo' : 'Upload photo'}
                        </button>
                        <p className="text-xs text-gray-500 mt-3">JPG, PNG, GIF or WebP. Max 6MB.</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                      <button type="button" onClick={goToReports} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white w-full sm:w-auto">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={savingInfo} className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition w-full sm:w-auto ${savingInfo ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{savingInfo ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}

                {activeInfoTab === 'business' && (
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
                      <button type="button" onClick={goToReports} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white w-full sm:w-auto">Cancel</button>
                      <button type="button" onClick={handleSaveAccountInfo} disabled={savingInfo} className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition w-full sm:w-auto ${savingInfo ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a4db8] hover:bg-[#15409b]'}`}>{savingInfo ? 'Saving...' : 'Save changes'}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT SETTINGS */}
        {view === 'account-settings' && (
          <div className="flex-1 overflow-y-auto bg-[#f7f8fa]">
            <div className="px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 lg:pt-10 pb-4 sm:pb-6">
              <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-tight mb-1">Account Settings</h1>
              <p className="text-[13.5px] text-gray-500">Manage branding, metrics, testing, integrations, and system configuration.</p>
            </div>

            <div className="px-4 sm:px-6 lg:px-10 pb-6 overflow-x-auto">
              <div className="inline-flex items-center gap-1 bg-[#eef1f7] rounded-full p-1.5 min-w-max">
                {(['privileges', 'metrics', 'testing', 'results', 'branding', 'integrations'] as const).map((tab) => (
                  <button key={tab} onClick={() => setSettingsTab(tab)}
                    className={`px-3 sm:px-5 py-1.5 sm:py-2 text-[12px] sm:text-[14px] font-medium rounded-full transition capitalize ${settingsTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {tab}
                  </button>
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
                        {PRIVILEGE_ROWS.map((row) => {
                          const rowPriv = privileges[row.id] || { admin: true, supervisor: true, staff: true };
                          const adminOn = rowPriv.admin;
                          const supervisorOn = rowPriv.supervisor;

                          return (
                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-[13px] sm:text-[14px] text-gray-800 font-medium">{row.label}</td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                                <input type="checkbox" checked={adminOn} onChange={() => handleTogglePrivilege(row.id, 'admin')} disabled={!isAdmin} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed" />
                              </td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <input type="checkbox" checked={supervisorOn} onChange={() => handleTogglePrivilege(row.id, 'supervisor')} disabled={!isAdmin || !adminOn} title={!adminOn ? 'Enable Admin first' : undefined} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed" />
                                  {!adminOn && isAdmin && (<span className="text-[9px] text-amber-600 leading-tight md:hidden">Admin first</span>)}
                                </div>
                              </td>
                              <td className="py-3 sm:py-4 px-2 sm:px-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <input type="checkbox" checked={rowPriv.staff} onChange={() => handleTogglePrivilege(row.id, 'staff')} disabled={!isAdmin || !supervisorOn} title={!supervisorOn ? 'Enable Supervisor first' : undefined} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 disabled:opacity-40 disabled:cursor-not-allowed" />
                                  {!supervisorOn && isAdmin && (<span className="text-[9px] text-amber-600 leading-tight md:hidden">Supervisor first</span>)}
                                </div>
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
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
                      <label className="text-[14px] font-semibold text-gray-900">Measurement System</label>
                      <div className="relative inline-block w-full sm:w-auto">
                        <select value={measurementSystem} onChange={(e) => setMeasurementSystem(e.target.value as 'Imperial' | 'Metric')} className="h-10 pl-4 pr-10 border border-gray-300 rounded-lg text-[14px] bg-white outline-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none cursor-pointer w-full sm:w-auto">
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
                    <p className="text-[13px] text-gray-500 mb-4">Upload your account logo. Max 5MB (PNG, JPG, GIF recommended).</p>
                    <input ref={accountLogoInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/svg+xml" onChange={handleAccountLogoUpload} className="hidden" />
                    <div className="relative inline-block w-full sm:w-auto">
                      <button type="button" onClick={() => accountLogoInputRef.current?.click()} className="w-full sm:w-[400px] h-[160px] sm:h-[180px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#1a73e8] hover:bg-blue-50/30 transition relative overflow-hidden">
                        {accountLogo ? <img src={accountLogo} alt="Account logo" className="w-full h-full object-contain p-4" /> : <p className="text-[14px] font-medium text-gray-500">Logo</p>}
                      </button>
                      {accountLogo && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setAccountLogo(null); }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition">
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
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Username</label>
                        <input type="text" value={integrations.inbody.apiUsername} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, apiUsername: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Key</label>
                        <input type="text" value={integrations.inbody.apiKey} onChange={(e) => setIntegrations({ ...integrations, inbody: { ...integrations.inbody, apiKey: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">Evolt</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.evolt.enabled} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, enabled: e.target.checked } })} className="w-[18px] h-[18px] rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Client ID</label>
                        <input type="text" value={integrations.evolt.clientId} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, clientId: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">Client Secret</label>
                        <input type="text" value={integrations.evolt.clientSecret} onChange={(e) => setIntegrations({ ...integrations, evolt: { ...integrations.evolt, clientSecret: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-5">Styku</h3>
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-5">
                      <input type="checkbox" checked={integrations.styku.enabled} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, enabled: e.target.checked } })} className="w-[18px] h-[18px] rounded border-gray-300 text-[#1a73e8] focus:ring-[#1a73e8]" />
                      <span className="text-[14px] text-gray-800">Integration enabled?</span>
                    </label>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Key</label>
                        <input type="text" value={integrations.styku.apiKey} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, apiKey: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
                      <div>
                        <label className="block text-[13.5px] font-semibold text-gray-800 mb-2">API Secret</label>
                        <input type="text" value={integrations.styku.apiSecret} onChange={(e) => setIntegrations({ ...integrations, styku: { ...integrations.styku, apiSecret: e.target.value } })} className="w-full h-[48px] px-4 border border-gray-200 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                      </div>
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

              <div className="flex items-center justify-end gap-3 pt-8 mt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={settingsTab === 'privileges' && !isAdmin}
                  className="px-6 h-[44px] text-[14px] font-semibold text-white bg-[#1a4db8] hover:bg-[#15409b] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  Save settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChooseReportTypeModal open={chooseTypeOpen} onClose={() => setChooseTypeOpen(false)} onChoose={handleChooseType} />

      {actionsReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4" onClick={() => setActionsReport(null)}>
          <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-[22px] font-bold text-gray-900 leading-tight">Report actions</h3>
              <button onClick={() => setActionsReport(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 -mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => { setEditingReport(actionsReport); setSelectedType(actionsReport.category || actionsReport.type || 'Profiles and Metric'); setView('builder'); setActionsReport(null); }}
                disabled={!canCreateReport}
                title={!canCreateReport ? 'You do not have permission to edit reports' : undefined}
                className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 rounded-xl border text-left transition ${
                  canCreateReport ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed'
                }`}>
                <svg className={`w-5 h-5 flex-shrink-0 ${canCreateReport ? 'text-[#1a73e8]' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                <span className="text-[14px] sm:text-[15px] font-semibold">Edit report</span>
              </button>
              <button
                onClick={handleDuplicateReport}
                disabled={!canCreateReport}
                title={!canCreateReport ? 'You do not have permission to duplicate reports' : undefined}
                className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 rounded-xl border text-left transition ${
                  canCreateReport ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed'
                }`}>
                <svg className={`w-5 h-5 flex-shrink-0 ${canCreateReport ? 'text-gray-700' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                <span className="text-[14px] sm:text-[15px] font-semibold">Duplicate report</span>
              </button>
              <button
                onClick={handleOpenDelete}
                disabled={!canDeleteReport}
                title={!canDeleteReport ? 'You do not have permission to delete reports' : undefined}
                className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 rounded-xl border text-left transition ${
                  canDeleteReport ? 'border-red-200 bg-red-50/50 text-[#b83232] hover:bg-red-50' : 'border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed'
                }`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                <span className="text-[14px] sm:text-[15px] font-semibold">Delete report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative p-5 sm:p-7">
            <button onClick={() => setDeleteReport(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 pr-8">Delete &quot;{deleteReport.name}&quot;?</h2>
            <p className="text-[15px] text-gray-500 mb-7">Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button onClick={() => setDeleteReport(null)} className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition w-full sm:w-auto">Cancel</button>
              <button onClick={confirmDeleteReport} className="px-6 py-3 text-sm font-semibold text-white bg-[#e51b48] hover:bg-[#c9173d] rounded-full transition w-full sm:w-auto">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== REUSABLE ==============
function NavLink({ href, label, icon, active = false, badge = 0, onClick }: { href: string; label: string; icon: React.ReactNode; active?: boolean; badge?: number; onClick?: (e: any) => void; }) {
  return (
    <Link href={href} onClick={onClick} className={`relative flex items-center gap-3 px-3 py-2.5 text-[13.5px] rounded-md transition ${active ? 'bg-[#eef2fb] text-[#1a73e8] font-medium' : 'text-gray-600 hover:bg-[#f4f6fb] font-medium'}`}>
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-[#1a73e8] rounded-r"></span>}
      <span className={active ? 'text-[#1a73e8]' : 'text-gray-500'}>{icon}</span>
      <span className="flex-1">{label}</span>
      {badge > 0 && <span className="min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">{badge > 99 ? '99+' : badge}</span>}
    </Link>
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