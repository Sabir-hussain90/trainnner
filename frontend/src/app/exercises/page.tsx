'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ====== CONSTANTS ======
const ACCESS_OPTIONS = ['Myself', 'Shared with All Users', 'Shared with Groups'];
const BODY_SEGMENT_OPTIONS = ['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Arms', 'Legs', 'Back', 'Chest', 'Shoulders'];
const UNITS_OF_MEASURE = ['Reps', 'Weight', 'Distance', 'Time'];
const PRIMARY_MUSCLE_OPTIONS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Full Body',
];
const EQUIPMENT_OPTIONS = [
  'None', 'Barbell', 'Dumbbell', 'Kettlebell', 'Resistance Band',
  'Machine', 'Cable', 'Bodyweight', 'Medicine Ball', 'TRX',
];
const MECHANICS_OPTIONS = ['Compound', 'Isolation'];
const FORCE_OPTIONS = ['Push', 'Pull', 'Static'];
const COLUMN_OPTIONS = ['Name', 'Primary Muscle', 'Equipment', 'Mechanics', 'Force', 'Access'];
const VALUE_OPTIONS = ['Any', 'Contains', 'Equals', 'Starts with', 'Ends with'];

const ACCESS_TO_BACKEND: Record<string, string> = {
  'Myself': 'MYSELF',
  'Shared with All Users': 'SHARED_WITH_ALL',
  'Shared with Groups': 'SHARED_WITH_GROUPS',
};
const ACCESS_FROM_BACKEND: Record<string, string> = {
  'MYSELF': 'Myself',
  'SHARED_WITH_ALL': 'Shared with All Users',
  'SHARED_WITH_GROUPS': 'Shared with Groups',
};

const VIDEO_TO_BACKEND: Record<string, string> = {
  'None': 'NONE',
  'YouTube': 'YOUTUBE',
  'Vimeo': 'VIMEO',
};
const VIDEO_FROM_BACKEND: Record<string, 'None' | 'YouTube' | 'Vimeo'> = {
  'NONE': 'None',
  'YOUTUBE': 'YouTube',
  'VIMEO': 'Vimeo',
};

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

const getYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([A-Za-z0-9_-]{6,})/,
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/v\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};
const getVimeoId = (url: string): string | null => {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
};

type UIExercise = {
  id: string;
  name: string;
  access: string;
  units: string[];
  bodySegment: string;
  primaryMuscle: string;
  equipment: string;
  mechanics: string;
  force: string;
  instructions: string;
  videoPlatform: 'None' | 'YouTube' | 'Vimeo';
  videoUrl: string;
  sourceLabel: string;
  screenshot: string | null;
  shareWithCommunity: boolean;
  creator: string;
  creatorId?: string;
  createdAt?: string;
  raw?: any;
};

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

// ==================== MAIN PAGE ====================
export default function ExercisesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id?: string; name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [view, setView] = useState<'list' | 'create' | 'edit' | 'account-info' | 'account-settings'>('list');
  const [editingExercise, setEditingExercise] = useState<UIExercise | null>(null);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [unreadConversations, setUnreadConversations] = useState<any[]>([]);

  const [openSections, setOpenSections] = useState({ home: true, organization: true, library: true, analytics: true });

  const [activeTab, setActiveTab] = useState('All Exercises');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [exercises, setExercises] = useState<UIExercise[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [fieldFilterCount, setFieldFilterCount] = useState(0);
  const [fieldOpen, setFieldOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);

  const [columnOpen, setColumnOpen] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const [selectedColumn, setSelectedColumn] = useState('');

  const [valueOpen, setValueOpen] = useState(false);
  const valueRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState('');

  const [name, setName] = useState('');
  const [access, setAccess] = useState('Myself');
  const [units, setUnits] = useState<string[]>(['Reps']);
  const [bodySegment, setBodySegment] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [mechanics, setMechanics] = useState('');
  const [force, setForce] = useState('');
  const [instructions, setInstructions] = useState('');
  const [videoPlatform, setVideoPlatform] = useState<'None' | 'YouTube' | 'Vimeo'>('None');
  const [videoUrl, setVideoUrl] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [shareWithCommunity, setShareWithCommunity] = useState(false);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const screenshotRef = useRef<HTMLInputElement>(null);

  const [actionsExercise, setActionsExercise] = useState<UIExercise | null>(null);
  const [deleteExercise, setDeleteExercise] = useState<UIExercise | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

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
  const canCreateExercise = can('create_exercises');
  const canDeleteExercise = can('delete_exercises');

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

  const creatorName = (e: any): string => {
    if (!e) return '';
    if (e.creator) {
      const full = `${e.creator.firstName || ''} ${e.creator.lastName || ''}`.trim();
      return full || e.creator.email || '';
    }
    return e.creatorName || '';
  };

  const fetchExercises = async () => {
    setDataLoading(true);
    try {
      const res = await fetch(`${API_URL}/exercises`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setExercises(
          data.map((e: any) => ({
            id: e.id,
            name: e.name || '',
            access: ACCESS_FROM_BACKEND[e.access] || e.access || 'Myself',
            units: Array.isArray(e.units) ? e.units : [],
            bodySegment: e.bodySegment || '',
            primaryMuscle: e.primaryMuscle || '',
            equipment: e.equipment || '',
            mechanics: e.mechanics || '',
            force: e.force || '',
            instructions: e.instructions || '',
            videoPlatform: VIDEO_FROM_BACKEND[e.videoPlatform] || 'None',
            videoUrl: e.videoUrl || '',
            sourceLabel: e.sourceLabel || '',
            screenshot: e.screenshot || null,
            shareWithCommunity: !!e.shareWithCommunity,
            creator: creatorName(e),
            creatorId: e.creatorId ?? e.creator?.id ?? e.creator?._id,
            createdAt: e.createdAt,
            raw: e,
          })),
        );
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load exercises', type: 'error' });
    } finally {
      setDataLoading(false);
    }
  };

  const fetchPrivileges = async () => {
    try {
      const res = await fetch(`${API_URL}/privileges`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object') {
        setPrivileges((prev) => ({ ...prev, ...data }));
      }
    } catch { /* non-fatal */ }
  };

  const fetchUnreadMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setUnreadConversations(data.filter((c: any) => c.unread === true));
      }
    } catch (err) {
      console.error('[fetchUnreadMessages]', err);
    }
  };

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
        if (s.integrations) {
          setIntegrations((prev) => ({
            ...prev,
            ...s.integrations,
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

    setLoading(false);
    fetchExercises();
    fetchPrivileges();
    fetchUnreadMessages();
  }, [router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (fieldRef.current && !fieldRef.current.contains(t)) setFieldOpen(false);
      if (columnRef.current && !columnRef.current.contains(t)) setColumnOpen(false);
      if (valueRef.current && !valueRef.current.contains(t)) setValueOpen(false);
      if (accountMenuRef.current && !accountMenuRef.current.contains(t)) setAccountMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(t)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const anyOverlay = deleteExercise || actionsExercise || isSidebarOpen;
    document.body.style.overflow = anyOverlay ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [deleteExercise, actionsExercise, isSidebarOpen]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const getInitials = (n: string) => {
    const parts = (n || '').split(/[.\s+_-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (n || 'U').slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    sessionStorage.clear();
    router.push('/');
  };

  const toggleSection = (key: keyof typeof openSections) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const goToExercises = () => {
    setAccountMenuOpen(false);
    setIsSidebarOpen(false);
    setView('list');
    setEditingExercise(null);
  };

  const toggleUnit = (u: string) => {
    setUnits((prev) => prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]);
    if (formErrors.units) setFormErrors({ ...formErrors, units: '' });
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file.', type: 'error' });
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'File too large. Max 5MB.', type: 'error' });
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.onerror = () => setToast({ message: 'Failed to read image', type: 'error' });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const openCreateForm = () => {
    if (!canCreateExercise) {
      setToast({ message: 'You do not have permission to create exercises.', type: 'error' });
      return;
    }
    setName('');
    setAccess('Myself');
    setUnits(['Reps']);
    setBodySegment('');
    setPrimaryMuscle('');
    setEquipment('');
    setMechanics('');
    setForce('');
    setInstructions('');
    setVideoPlatform('None');
    setVideoUrl('');
    setSourceLabel('');
    setScreenshot(null);
    setShareWithCommunity(false);
    setFormErrors({});
    setEditingExercise(null);
    setView('create');
  };

  const openEditForm = (ex: UIExercise) => {
    if (!canCreateExercise) {
      setToast({ message: 'You do not have permission to edit exercises.', type: 'error' });
      setActionsExercise(null);
      return;
    }
    setName(ex.name);
    setAccess(ex.access);
    setUnits(ex.units || ['Reps']);
    setBodySegment(ex.bodySegment || '');
    setPrimaryMuscle(ex.primaryMuscle || '');
    setEquipment(ex.equipment || '');
    setMechanics(ex.mechanics || '');
    setForce(ex.force || '');
    setInstructions(ex.instructions || '');
    setVideoPlatform(ex.videoPlatform);
    setVideoUrl(ex.videoUrl || '');
    setSourceLabel(ex.sourceLabel || '');
    setScreenshot(ex.screenshot);
    setShareWithCommunity(!!ex.shareWithCommunity);
    setFormErrors({});
    setEditingExercise(ex);
    setActionsExercise(null);
    setView('edit');
  };

  const closeForm = () => { setView('list'); setEditingExercise(null); };

  const handleSave = async () => {
    if (!canCreateExercise) {
      setToast({ message: 'You do not have permission to save exercises.', type: 'error' });
      return;
    }

    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Exercise name is required';
    if (units.length === 0) errs.units = 'Select at least one unit of measure';

    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setFormErrors({});
    setSaving(true);

    try {
      const body: any = {
        name: name.trim(),
        access: ACCESS_TO_BACKEND[access] || 'MYSELF',
        units,
        bodySegment: bodySegment || null,
        primaryMuscle: primaryMuscle || null,
        equipment: equipment || null,
        mechanics: mechanics || null,
        force: force || null,
        instructions: instructions || null,
        videoPlatform: VIDEO_TO_BACKEND[videoPlatform] || 'NONE',
        videoUrl: videoUrl || null,
        sourceLabel: sourceLabel || null,
        screenshot: screenshot || null,
        shareWithCommunity,
      };

      const url = editingExercise ? `${API_URL}/exercises/${editingExercise.id}` : `${API_URL}/exercises`;
      const method = editingExercise ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Failed (${res.status})`);
      }

      setToast({ message: editingExercise ? 'Exercise updated successfully' : 'Exercise created successfully', type: 'success' });
      setView('list');
      setEditingExercise(null);
      await fetchExercises();
    } catch (err: any) {
      setToast({ message: err.message || 'Save failed', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditFromActions = () => { if (actionsExercise) openEditForm(actionsExercise); };

  const handleDuplicateExercise = async () => {
    if (!actionsExercise) return;
    if (!canCreateExercise) {
      setToast({ message: 'You do not have permission to duplicate exercises.', type: 'error' });
      setActionsExercise(null);
      return;
    }
    try {
      const src = actionsExercise.raw || {};
      const body: any = {
        name: `${actionsExercise.name} - duplicate`,
        access: src.access || 'MYSELF',
        units: src.units || ['Reps'],
        bodySegment: src.bodySegment || null,
        primaryMuscle: src.primaryMuscle || null,
        equipment: src.equipment || null,
        mechanics: src.mechanics || null,
        force: src.force || null,
        instructions: src.instructions || null,
        videoPlatform: src.videoPlatform || 'NONE',
        videoUrl: src.videoUrl || null,
        sourceLabel: src.sourceLabel || null,
        screenshot: src.screenshot || null,
        shareWithCommunity: !!src.shareWithCommunity,
      };
      const res = await fetch(`${API_URL}/exercises`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: `"${actionsExercise.name}" duplicated`, type: 'success' });
      setActionsExercise(null);
      await fetchExercises();
    } catch (err: any) {
      setToast({ message: err.message || 'Duplicate failed', type: 'error' });
    }
  };

  const handleOpenDelete = () => {
    if (!canDeleteExercise) {
      setToast({ message: 'You do not have permission to delete exercises.', type: 'error' });
      return;
    }
    if (actionsExercise) { setDeleteExercise(actionsExercise); setActionsExercise(null); }
  };

  const confirmDeleteExercise = async () => {
    if (!deleteExercise) return;
    if (!canDeleteExercise) {
      setToast({ message: 'You do not have permission to delete exercises.', type: 'error' });
      setDeleteExercise(null);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/exercises/${deleteExercise.id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setToast({ message: 'Exercise deleted successfully', type: 'success' });
      await fetchExercises();
      setDeleteExercise(null);
    } catch (err: any) {
      setToast({ message: err.message || 'Delete failed', type: 'error' });
    }
  };

  const youtubeId = videoPlatform === 'YouTube' ? getYouTubeId(videoUrl) : null;
  const vimeoId = videoPlatform === 'Vimeo' ? getVimeoId(videoUrl) : null;
  const embedUrl = youtubeId ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0` : vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : '';
  const previewThumb = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : vimeoId ? `https://vumbnail.com/${vimeoId}.jpg` : '';

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

    if (!isAdmin) {
      setToast({ message: 'Account settings saved', type: 'success' });
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
      setToast({ message: 'Account settings saved', type: 'success' });
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

  const filteredExercises = exercises.filter((e) => {
    if (activeTab === 'My Exercises') {
      if (!user) return false;
      const matchesCreatorId = !!e.creatorId && !!user.id && String(e.creatorId) === String(user.id);
      const matchesCreatorName = !!e.creator && !!user.name && e.creator.trim() === user.name.trim();
      if (!matchesCreatorId && !matchesCreatorName) return false;
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const haystack = `${e.name} ${e.primaryMuscle} ${e.equipment} ${e.mechanics} ${e.force} ${e.bodySegment}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const totalItems = filteredExercises.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedExercises = filteredExercises.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const unreadCount = unreadConversations.length;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#f5f6f8] overflow-hidden">
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

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR — fixed on all screens; visible on lg; slide-in drawer on mobile */}
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
                <NavLink
                  href="/exercises"
                  label="Exercises"
                  active={view === 'list'}
                  icon={<IconActivity />}
                  onClick={(e: any) => { e.preventDefault(); goToExercises(); }}
                />
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

      {/* MAIN — flex column with proper min-h-0 for scroll children */}
      <div className="lg:ml-64 flex flex-col h-screen min-h-0">
        <header className="bg-white border-b border-gray-100 px-3 sm:px-4 lg:px-6 py-3 flex items-center justify-between gap-3 flex-shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100" aria-label="Open menu">
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
                    <button onClick={() => { setAccountMenuOpen(false); goToExercises(); }} className="w-full flex items-center gap-3.5 px-5 py-3 text-[14px] text-gray-800 hover:bg-gray-50 transition text-left">
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

        {/* LIST — flex-1 with min-h-0 to allow proper scroll */}
        {view === 'list' && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-white">
            <div className="p-3 sm:p-4 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Exercises</h1>
                  <p className="text-sm text-gray-500">Manage your exercise library and filter by training attributes.</p>
                </div>
                <button
                  onClick={openCreateForm}
                  disabled={!canCreateExercise}
                  title={!canCreateExercise ? 'You do not have permission to create exercises' : undefined}
                  className={`text-sm font-medium px-4 sm:px-5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm w-full sm:w-auto ${
                    canCreateExercise
                      ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Create Exercise
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-3 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100">
                  <div className="flex items-center gap-1 flex-shrink-0 bg-gray-100 rounded-full p-1 self-start overflow-x-auto max-w-full">
                    {['All Exercises', 'My Exercises'].map((tab) => (
                      <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }} className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-shrink-0 self-start" ref={fieldRef}>
                    <button onClick={() => setFieldOpen(!fieldOpen)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap border-2 transition ${fieldFilterCount > 0 ? 'border-[#1a73e8] text-[#1a73e8] bg-blue-50/50' : 'border-gray-200 text-gray-700 hover:bg-gray-50 bg-white'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      Field {fieldFilterCount > 0 ? `(${fieldFilterCount})` : ''}
                      <svg className={`w-3.5 h-3.5 transition-transform ${fieldOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {fieldOpen && (
                      <div className="absolute top-full left-0 mt-2 w-[calc(100vw-2rem)] max-w-[340px] sm:w-[400px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
                        <p className="text-[12px] font-semibold text-gray-500 tracking-wider mb-3">FILTER BY FIELD</p>
                        <div className="space-y-2">
                          {COLUMN_OPTIONS.map((col) => (
                            <label key={col} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                              <input type="checkbox" checked={fieldFilter === col} onChange={() => { setFieldFilter(fieldFilter === col ? null : col); setFieldFilterCount(fieldFilter === col ? 0 : 1); }} className="rounded border-gray-300 w-4 h-4 text-[#1a73e8] focus:ring-[#1a73e8]" />
                              <span className="text-[14px] text-gray-800">{col}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-shrink-0 self-start" ref={columnRef}>
                    <button onClick={() => setColumnOpen(!columnOpen)} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 bg-white font-medium whitespace-nowrap">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      {selectedColumn || 'Column'}
                      <svg className={`w-3.5 h-3.5 transition-transform ${columnOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {columnOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                        {COLUMN_OPTIONS.map((c) => (
                          <button key={c} onClick={() => { setSelectedColumn(c); setColumnOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedColumn === c ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>{c}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative flex-shrink-0 self-start" ref={valueRef}>
                    <button onClick={() => setValueOpen(!valueOpen)} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 bg-white font-medium whitespace-nowrap">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                      {selectedValue || 'Value'}
                      <svg className={`w-3.5 h-3.5 transition-transform ${valueOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {valueOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                        {VALUE_OPTIONS.map((v) => (
                          <button key={v} onClick={() => { setSelectedValue(v); setValueOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedValue === v ? 'text-[#1a73e8] font-medium' : 'text-gray-700'}`}>{v}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:ml-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      <input type="text" placeholder="Search exercises..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-full sm:w-64 outline-none focus:border-[#1a73e8]" />
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 self-start sm:self-auto">
                      <button type="button" onClick={() => setViewMode('list')} title="List view" className={`w-8 h-8 flex items-center justify-center rounded-full transition ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                      </button>
                      <button type="button" onClick={() => setViewMode('grid')} title="Grid view" className={`w-8 h-8 flex items-center justify-center rounded-full transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                      </button>
                    </div>
                    <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="text-sm border border-gray-200 rounded-md px-3 py-2 outline-none bg-white font-medium self-start sm:self-auto">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {fieldFilter && (
                  <div className="px-3 sm:px-6 py-3 border-b border-gray-100 bg-gray-50/40">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-[13.5px] text-gray-700 shadow-sm">
                      <span className="font-semibold tracking-wider text-[11.5px] text-gray-500 uppercase">FILTER BY FIELD</span>
                      <span className="text-gray-800">{fieldFilter}</span>
                      <button onClick={() => { setFieldFilter(null); setFieldFilterCount(0); }} className="ml-1 w-4 h-4 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                )}

                {dataLoading && exercises.length === 0 ? (
                  <div className="px-6 py-16 text-center text-gray-400 text-sm">Loading exercises...</div>
                ) : paginatedExercises.length === 0 ? (
                  <div className="px-6 py-16 text-center text-gray-400 text-sm">
                    {activeTab === 'My Exercises' ? 'You have not created any exercises yet.' : 'No exercises yet.'}{' '}
                    {canCreateExercise ? (
                      <>Click <button onClick={openCreateForm} className="font-medium text-[#1a73e8] hover:underline">Create Exercise</button> to get started.</>
                    ) : (
                      <>Ask an admin to create an exercise.</>
                    )}
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[820px]">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50/40">
                          <th className="px-3 sm:px-6 py-3 w-10"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></th>
                          <th className="px-3 sm:px-4 py-3 font-medium text-xs">Name</th>
                          <th className="px-3 sm:px-4 py-3 font-medium text-xs">Primary Muscle</th>
                          <th className="px-3 sm:px-4 py-3 font-medium text-xs">Equipment</th>
                          <th className="px-3 sm:px-4 py-3 font-medium text-xs">Mechanics</th>
                          <th className="px-3 sm:px-4 py-3 font-medium text-xs">Force</th>
                          <th className="px-3 sm:px-4 py-3 font-medium text-xs">Access</th>
                          <th className="px-3 sm:px-6 py-3 font-medium text-xs text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedExercises.map((ex) => (
                          <tr key={ex.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-3 sm:py-4"><input type="checkbox" className="rounded border-gray-300 w-4 h-4" /></td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-4 h-4 text-[#1a73e8]" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5v11M3.5 8.5v7M17.5 6.5v11M20.5 8.5v7M6.5 12h11" /></svg>
                                </div>
                                <span className="font-medium text-gray-800">{ex.name}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{ex.primaryMuscle || '—'}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{ex.equipment || '—'}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{ex.mechanics || '—'}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{ex.force || '—'}</td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600">{ex.access || '—'}</td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                              <button onClick={() => setActionsExercise(ex)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 inline-flex">
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
                    {paginatedExercises.map((ex) => (
                      <div key={ex.id} className="group relative border border-gray-200 rounded-2xl bg-white hover:shadow-md hover:border-gray-300 transition flex flex-col">
                        <div className="p-4 sm:p-5 flex items-start gap-3">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#1a73e8]" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5v11M3.5 8.5v7M17.5 6.5v11M20.5 8.5v7M6.5 12h11" /></svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[15px] font-semibold text-gray-900 truncate" title={ex.name}>{ex.name}</h3>
                            <p className="text-[12px] text-gray-500 truncate mt-0.5">{ex.creator || 'Unknown creator'}</p>
                          </div>
                          <button onClick={() => setActionsExercise(ex)} className="opacity-0 group-hover:opacity-100 transition p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Actions">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                            </svg>
                          </button>
                        </div>

                        <div className="px-4 sm:px-5 pb-4 flex-1">
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {ex.primaryMuscle && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                {ex.primaryMuscle}
                              </span>
                            )}
                            {ex.equipment && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                {ex.equipment}
                              </span>
                            )}
                            {ex.mechanics && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium">{ex.mechanics}</span>
                            )}
                            {ex.force && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-medium">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                {ex.force}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium truncate">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                              {ex.access}
                            </span>
                          </div>
                          {ex.instructions && <p className="text-[12.5px] text-gray-500 line-clamp-2">{ex.instructions}</p>}
                        </div>

                        <div className="px-4 sm:px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                          <button
                            onClick={() => openEditForm(ex)}
                            disabled={!canCreateExercise}
                            title={!canCreateExercise ? 'You do not have permission to edit exercises' : undefined}
                            className={`text-[12.5px] font-medium ${canCreateExercise ? 'text-[#1a73e8] hover:underline' : 'text-gray-300 cursor-not-allowed'}`}
                          >
                            Edit
                          </button>
                          <button onClick={() => setActionsExercise(ex)} className="text-[12.5px] font-medium text-gray-500 hover:text-gray-800">More</button>
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
          </div>
        )}

        {/* CREATE / EDIT */}
        {(view === 'create' || view === 'edit') && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f5f6f8]">
            <div className="bg-white px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-4 sm:pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button onClick={closeForm} className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center flex-shrink-0 transition">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-[19px] font-bold text-gray-900 leading-tight truncate">{view === 'edit' ? 'Edit Exercise' : 'Create Exercise'}</h1>
                  <p className="text-[12.5px] sm:text-[13px] text-gray-500 leading-tight mt-0.5">{view === 'edit' ? 'Update the exercise details below.' : 'Fill in the details to add a new exercise.'}</p>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
                <div className="space-y-4 sm:space-y-6">
                  <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7 bg-white">
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900 mb-4 sm:mb-6">Basic Info</h3>
                    <div className="mb-4 sm:mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800">Exercise Name <span className="text-red-500">*</span></label>
                        <span className="text-[11.5px] sm:text-[12px] text-gray-400">{name.length}/100</span>
                      </div>
                      <input type="text" maxLength={100} autoFocus placeholder="e.g. Barbell Back Squat" value={name}
                        onChange={(e) => { setName(e.target.value); if (formErrors.name) setFormErrors({ ...formErrors, name: '' }); }}
                        className={`w-full h-[48px] px-4 border rounded-lg text-[14px] outline-none transition ${formErrors.name ? 'border-red-400 focus:ring-4 focus:ring-red-500/10' : 'border-gray-300 focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10'}`} />
                      {formErrors.name && <p className="text-xs text-red-500 mt-1.5">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Access</label>
                      <div className="relative">
                        <select value={access} onChange={(e) => setAccess(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                          {ACCESS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7 bg-white">
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900 mb-4 sm:mb-6">Classification</h3>
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2 sm:mb-3">Units of Measure <span className="text-red-500">*</span></label>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {UNITS_OF_MEASURE.map((u) => {
                          const active = units.includes(u);
                          return (
                            <button key={u} type="button" onClick={() => toggleUnit(u)}
                              className={`px-4 sm:px-5 h-[42px] rounded-full text-[13px] sm:text-[14px] font-medium transition border ${active ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                              {u}
                            </button>
                          );
                        })}
                      </div>
                      {formErrors.units && <p className="text-xs text-red-500 mt-2">{formErrors.units}</p>}
                    </div>
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Body Segment</label>
                      <div className="relative">
                        <select value={bodySegment} onChange={(e) => setBodySegment(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                          <option value="">— Select —</option>
                          {BODY_SEGMENT_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Primary Muscle</label>
                      <div className="relative">
                        <select value={primaryMuscle} onChange={(e) => setPrimaryMuscle(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                          <option value="">— Select —</option>
                          {PRIMARY_MUSCLE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Equipment</label>
                      <div className="relative">
                        <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                          <option value="">— Select —</option>
                          {EQUIPMENT_OPTIONS.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
                        </select>
                        <svg className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Mechanics</label>
                        <div className="relative">
                          <select value={mechanics} onChange={(e) => setMechanics(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                            <option value="">— Select —</option>
                            {MECHANICS_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[13px] sm:text-[13.5px] font-semibold text-gray-800 mb-2">Force</label>
                        <div className="relative">
                          <select value={force} onChange={(e) => setForce(e.target.value)} className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] bg-white outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 appearance-none pr-10">
                            <option value="">— Select —</option>
                            {FORCE_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                          </select>
                          <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Instructions</h3>
                      <span className="text-[12px] text-gray-400">{instructions.length}/1000</span>
                    </div>
                    <textarea rows={6} maxLength={1000} placeholder="Describe how to perform this exercise step by step..." value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] outline-none transition resize-none focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7 bg-white">
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900 mb-4 sm:mb-6">Video</h3>
                    <div className="aspect-video rounded-xl flex flex-col items-center justify-center mb-4 sm:mb-6 relative overflow-hidden bg-[#0b1426]">
                      {embedUrl ? (
                        <iframe key={embedUrl} src={embedUrl} title="Exercise video" className="w-full h-full absolute inset-0" frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                      ) : previewThumb ? (
                        <img src={previewThumb} alt="Video preview" className="w-full h-full object-cover" />
                      ) : videoPlatform === 'YouTube' ? (
                        <>
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ff0000] flex items-center justify-center mb-3 sm:mb-4"><svg className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                          <p className="text-[12.5px] sm:text-[13.5px] text-white/70 font-medium">YouTube video</p>
                          <p className="text-[11.5px] sm:text-[12px] text-white/40 mt-1">Paste a URL below to play</p>
                        </>
                      ) : videoPlatform === 'Vimeo' ? (
                        <>
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1ab7ea] flex items-center justify-center mb-3 sm:mb-4"><svg className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                          <p className="text-[12.5px] sm:text-[13.5px] text-white/70 font-medium">Vimeo video</p>
                          <p className="text-[11.5px] sm:text-[12px] text-white/40 mt-1">Paste a URL below to play</p>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-4"><svg className="w-7 h-7 text-white/50 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                          <p className="text-[12.5px] sm:text-[13.5px] text-white/50 px-3 text-center">Select a platform and enter a URL</p>
                        </>
                      )}
                    </div>
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-[13px] sm:text-[14px] font-bold text-gray-900 mb-2 sm:mb-3">Platform</label>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {(['None', 'YouTube', 'Vimeo'] as const).map((p) => {
                          const active = videoPlatform === p;
                          return (
                            <button key={p} type="button" onClick={() => setVideoPlatform(p)}
                              className={`px-4 sm:px-6 h-[42px] sm:h-[46px] rounded-full text-[13px] sm:text-[15px] font-medium transition ${active ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mb-4 sm:mb-5">
                      <label className="block text-[13px] sm:text-[14px] font-bold text-gray-900 mb-2 sm:mb-3">Video URL</label>
                      <div className="relative">
                        <input type="text" placeholder={videoPlatform === 'None' ? 'Select a platform first' : `Paste ${videoPlatform} URL...`}
                          value={videoUrl} disabled={videoPlatform === 'None'}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 disabled:bg-gray-50 disabled:text-gray-400" />
                      </div>
                      {videoUrl && !embedUrl && videoPlatform !== 'None' && (
                        <p className="text-xs text-red-500 mt-2">
                          {videoPlatform === 'YouTube' ? 'Could not detect a valid YouTube video ID in that URL.' : 'Could not detect a valid Vimeo video ID in that URL.'}
                        </p>
                      )}
                      {embedUrl && <p className="text-xs text-emerald-600 mt-2">✓ Video detected — it will play above.</p>}
                    </div>
                    <div>
                      <label className="block text-[13px] sm:text-[14px] font-bold text-gray-900 mb-2 sm:mb-3">Source Label (optional)</label>
                      <input type="text" placeholder="e.g. Coach John's Tutorial" value={sourceLabel}
                        onChange={(e) => setSourceLabel(e.target.value)}
                        className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[14px] outline-none transition focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10" />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-7 bg-white">
                    <h3 className="text-[15px] sm:text-[16px] font-bold text-gray-900 mb-4 sm:mb-6">Screenshot</h3>
                    <input ref={screenshotRef} type="file" accept="image/png,image/jpeg,image/gif" onChange={handleScreenshotUpload} className="hidden" />
                    {screenshot ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-4 sm:mb-5">
                        <img src={screenshot} alt="Screenshot" className="w-full object-cover" />
                        <button type="button" onClick={() => setScreenshot(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow text-gray-600 hover:text-red-500 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => screenshotRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 sm:py-12 flex flex-col items-center justify-center hover:border-[#1a73e8] hover:bg-blue-50/30 transition mb-4 sm:mb-5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4" /></svg>
                        </div>
                        <p className="text-[13px] sm:text-[14.5px] font-semibold text-gray-800 mb-1">Click to upload</p>
                        <p className="text-[11.5px] sm:text-[12.5px] text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </button>
                    )}
                    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 border border-gray-200 rounded-xl bg-gray-50/40">
                      <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] sm:text-[14.5px] font-semibold text-gray-900 leading-tight">Share with community</p>
                        <p className="text-[11.5px] sm:text-[12.5px] text-gray-500 leading-tight mt-0.5">Make this exercise visible to other users</p>
                      </div>
                      <button type="button" role="switch" aria-checked={shareWithCommunity} onClick={() => setShareWithCommunity(!shareWithCommunity)}
                        className={`relative w-12 h-7 rounded-full transition flex-shrink-0 ${shareWithCommunity ? 'bg-[#1a73e8]' : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${shareWithCommunity ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-6 sm:pt-7 mt-6 sm:mt-7 border-t border-gray-100">
                <button type="button" onClick={closeForm} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white order-2 sm:order-1">Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving || !canCreateExercise}
                  className={`px-6 h-[44px] text-[14px] font-semibold text-white rounded-lg transition order-1 sm:order-2 ${(saving || !canCreateExercise) ? 'bg-[#7a9bcc] cursor-not-allowed' : 'bg-[#1a73e8] hover:bg-[#1557b0]'}`}>
                  {saving ? (view === 'edit' ? 'Saving...' : 'Creating...') : (view === 'edit' ? 'Save Changes' : 'Create Exercise')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT INFO */}
        {view === 'account-info' && (
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f7f8fa]">
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
                      <button type="button" onClick={goToExercises} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white w-full sm:w-auto">Cancel</button>
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
                      <button type="button" onClick={goToExercises} className="px-6 h-[44px] text-[14px] font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition bg-white w-full sm:w-auto">Cancel</button>
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
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#f7f8fa]">
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

      {/* ACTIONS MODAL */}
      {actionsExercise && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4" onClick={() => setActionsExercise(null)}>
          <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-[22px] font-bold text-gray-900 leading-tight">Exercise actions</h3>
              <button onClick={() => setActionsExercise(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 -mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleEditFromActions}
                disabled={!canCreateExercise}
                title={!canCreateExercise ? 'You do not have permission to edit exercises' : undefined}
                className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 rounded-xl border text-left transition ${
                  canCreateExercise
                    ? 'border-gray-200 hover:bg-gray-50'
                    : 'border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <svg className={`w-[20px] h-[20px] flex-shrink-0 ${canCreateExercise ? 'text-[#1a73e8]' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                <span className="text-[14px] sm:text-[15px] font-semibold">Edit exercise</span>
              </button>
              <button
                onClick={handleDuplicateExercise}
                disabled={!canCreateExercise}
                title={!canCreateExercise ? 'You do not have permission to duplicate exercises' : undefined}
                className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 rounded-xl border text-left transition ${
                  canCreateExercise
                    ? 'border-gray-200 hover:bg-gray-50'
                    : 'border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <svg className={`w-[20px] h-[20px] flex-shrink-0 ${canCreateExercise ? 'text-gray-700' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                <span className="text-[14px] sm:text-[15px] font-semibold">Duplicate exercise</span>
              </button>
              <button
                onClick={handleOpenDelete}
                disabled={!canDeleteExercise}
                title={!canDeleteExercise ? 'You do not have permission to delete exercises' : undefined}
                className={`w-full flex items-center gap-3.5 px-4 sm:px-5 py-4 rounded-xl border text-left transition ${
                  canDeleteExercise
                    ? 'border-red-200 bg-red-50/50 text-[#b83232] hover:bg-red-50'
                    : 'border-gray-100 bg-gray-50/50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <svg className="w-[20px] h-[20px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                <span className="text-[14px] sm:text-[15px] font-semibold">Delete exercise</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteExercise && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative p-5 sm:p-7">
            <button onClick={() => setDeleteExercise(null)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 pr-8">Delete &quot;{deleteExercise.name}&quot;?</h2>
            <p className="text-[15px] text-gray-500 mb-7">Are you sure you want to delete this exercise? This action cannot be undone.</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button onClick={() => setDeleteExercise(null)} className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50 transition w-full sm:w-auto">Cancel</button>
              <button onClick={confirmDeleteExercise} className="px-6 py-3 text-sm font-semibold text-white bg-[#e51b48] hover:bg-[#c9173d] rounded-full transition w-full sm:w-auto">Delete</button>
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