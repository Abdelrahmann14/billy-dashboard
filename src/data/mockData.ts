/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardData, Member, ActivityItem, Stats } from '../types';

// Let's establish dynamic offsets from current Date.now()
const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

export const INITIAL_MEMBERS = (): Member[] => [
  {
    id: 'trello_abdelrahman',
    name: 'abdelrahman',
    status: 'working',
    login: '09:02',
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['friday'],
    missedCounter: 2,
    lastUpdateAt: minutesAgo(137), // 2 hours 17 mins ago
    lastUpdateContent: 'fixed the card list thumbnail scaling bug',
    lastUpdateType: 'commentCard',
    lastUpdateCard: 'QA Dashboard Refactor',
    hasMissingUpdate: true, // Working and over 2 hours ago
    onBreakTooLong: false
  },
  {
    id: 'trello_sarah',
    name: 'Sarah Connor',
    status: 'working',
    login: '08:30',
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['saturday', 'sunday'],
    missedCounter: 0,
    lastUpdateAt: minutesAgo(11), // 11 mins ago
    lastUpdateContent: 'Deployment build succeeds on Vercel test branch',
    lastUpdateType: 'cardComplete',
    lastUpdateCard: 'Configure CI/CD Pipelines',
    hasMissingUpdate: false,
    onBreakTooLong: false
  },
  {
    id: 'trello_liam',
    name: 'Liam Neeson',
    status: 'break',
    login: '09:15',
    breakStart: '10:05', // Long break! (Over 2 hours relative to current mid-day)
    back: '10:35',
    logout: null,
    dayOff: ['sunday'],
    missedCounter: 1,
    lastUpdateAt: minutesAgo(127), // 2 hours 7 mins ago
    lastUpdateContent: 'completed checklist: UI Review Checklist',
    lastUpdateType: 'updateCheckItemStateOnCard',
    lastUpdateCard: 'Audit landing page widgets',
    hasMissingUpdate: false,
    onBreakTooLong: true // break over 2 hours
  },
  {
    id: 'trello_marcus',
    name: 'Marcus Aurelius',
    status: 'working',
    login: '07:30',
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['saturday'],
    missedCounter: 0,
    lastUpdateAt: minutesAgo(30), // 30 mins ago
    lastUpdateContent: 'added critical labels to API schemas spec',
    lastUpdateType: 'updateCard (labels)',
    lastUpdateCard: 'Documentation Restructure',
    hasMissingUpdate: false,
    onBreakTooLong: false
  },
  {
    id: 'trello_elena',
    name: 'Elena Rostova',
    status: 'logged_out',
    login: null,
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['saturday', 'sunday'],
    missedCounter: 4,
    lastUpdateAt: null,
    lastUpdateContent: null,
    lastUpdateType: null,
    lastUpdateCard: null,
    hasMissingUpdate: false,
    onBreakTooLong: false,
    notLoggedInBy4pm: false // Not yet 4pm standard shift
  },
  {
    id: 'trello_kenji',
    name: 'Kenji Sato',
    status: 'working',
    login: '11:00',
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['sunday'],
    missedCounter: 1,
    lastUpdateAt: minutesAgo(47), // 47 mins ago
    lastUpdateContent: 'created new card: API Localization Endpoint',
    lastUpdateType: 'createCard',
    lastUpdateCard: 'Localization Services',
    hasMissingUpdate: false,
    onBreakTooLong: false
  },
  {
    id: 'trello_diana',
    name: 'Diana Prince',
    status: 'break',
    login: '08:15',
    breakStart: '11:50', // 12 mins ago
    back: '12:30',
    logout: null,
    dayOff: ['friday', 'saturday'],
    missedCounter: 0,
    lastUpdateAt: minutesAgo(17), // 17 mins ago
    lastUpdateContent: 'attached wireframe_v2_final_expanded.png',
    lastUpdateType: 'addAttachmentToCard',
    lastUpdateCard: 'SaaS Grid Dashboard design layout',
    hasMissingUpdate: false,
    onBreakTooLong: false
  },
  {
    id: 'trello_bruce',
    name: 'Bruce Wayne',
    status: 'logged_out',
    login: null,
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['saturday', 'sunday'],
    missedCounter: 3,
    lastUpdateAt: hoursAgo(12), // 12 hours ago
    lastUpdateContent: 'resolved security audit vulnerabilities',
    lastUpdateType: 'cardComplete',
    lastUpdateCard: 'Nightly Infrastructure Security Audit',
    hasMissingUpdate: false,
    onBreakTooLong: false,
    notLoggedInBy4pm: true // Log in late flagged
  },
  {
    id: 'trello_clark',
    name: 'Clark Kent',
    status: 'working',
    login: '08:00',
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['sunday'],
    missedCounter: 1,
    lastUpdateAt: minutesAgo(170), // ~3 hours ago
    lastUpdateContent: 'revised editorial guide description details',
    lastUpdateType: 'updateCard (description)',
    lastUpdateCard: 'Global Press Release Media Kit',
    hasMissingUpdate: true,
    onBreakTooLong: false
  },
  {
    id: 'trello_peter',
    name: 'Peter Parker',
    status: 'working',
    login: '10:00',
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['saturday'],
    missedCounter: 0,
    lastUpdateAt: minutesAgo(112), // ~1h 52m ago
    lastUpdateContent: 'attached photo_reference_web_layout.jpg',
    lastUpdateType: 'addAttachmentToCard',
    lastUpdateCard: 'Hero Banner Visual Assets',
    hasMissingUpdate: false,
    onBreakTooLong: false
  },
  {
    id: 'trello_tony',
    name: 'Tony Stark',
    status: 'working',
    login: '05:30',
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['sunday'],
    missedCounter: 0,
    lastUpdateAt: minutesAgo(1), // 1 min ago
    lastUpdateContent: 'added label: High-Priority Hotfix',
    lastUpdateType: 'updateCard (labels)',
    lastUpdateCard: 'Resolve memory leak in Reactor Core wrapper',
    hasMissingUpdate: false,
    onBreakTooLong: false
  },
  {
    id: 'trello_natasha',
    name: 'Natasha Romanoff',
    status: 'working',
    login: '09:00',
    breakStart: null,
    back: null,
    logout: null,
    dayOff: ['saturday'],
    missedCounter: 1,
    lastUpdateAt: minutesAgo(192), // 3 hours 12 mins ago
    lastUpdateContent: 'updated checklist: Setup API Gateway tunnels',
    lastUpdateType: 'updateCheckItemStateOnCard',
    lastUpdateCard: 'Intrusion Detection Gateway config',
    hasMissingUpdate: true,
    onBreakTooLong: false
  }
];

export const INITIAL_ACTIVITY = (): ActivityItem[] => [
  {
    id: 'act_1',
    name: 'Tony Stark',
    type: 'updateCard (labels)',
    content: 'Added label: High-Priority Hotfix',
    card: 'Resolve memory leak in Reactor Core wrapper',
    date: minutesAgo(1)
  },
  {
    id: 'act_2',
    name: 'Diana Prince',
    type: 'addAttachmentToCard',
    content: 'Attached wireframe_v2_final_expanded.png',
    card: 'SaaS Grid Dashboard design layout',
    date: minutesAgo(17)
  },
  {
    id: 'act_3',
    name: 'Sarah Connor',
    type: 'cardComplete',
    content: 'Deployment build succeeds on Vercel test branch',
    card: 'Configure CI/CD Pipelines',
    date: minutesAgo(11)
  },
  {
    id: 'act_4',
    name: 'Marcus Aurelius',
    type: 'updateCard (labels)',
    content: 'Added critical labels to API schemas spec',
    card: 'Documentation Restructure',
    date: minutesAgo(30)
  },
  {
    id: 'act_5',
    name: 'Kenji Sato',
    type: 'createCard',
    content: 'Created new card: API Localization Endpoint',
    card: 'Localization Services',
    date: minutesAgo(47)
  },
  {
    id: 'act_6',
    name: 'Peter Parker',
    type: 'addAttachmentToCard',
    content: 'Attached photo_reference_web_layout.jpg',
    card: 'Hero Banner Visual Assets',
    date: minutesAgo(112)
  },
  {
    id: 'act_7',
    name: 'Liam Neeson',
    type: 'updateCheckItemStateOnCard',
    content: 'Completed checklist item: UI Review Checklist',
    card: 'Audit landing page widgets',
    date: minutesAgo(127)
  },
  {
    id: 'act_8',
    name: 'abdelrahman',
    type: 'commentCard',
    content: 'Fixed the card list thumbnail scaling bug',
    card: 'QA Dashboard Refactor',
    date: minutesAgo(137)
  },
  {
    id: 'act_9',
    name: 'Clark Kent',
    type: 'updateCard (description)',
    content: 'Revised editorial guide description details',
    card: 'Global Press Release Media Kit',
    date: minutesAgo(170)
  },
  {
    id: 'act_10',
    name: 'Natasha Romanoff',
    type: 'updateCheckItemStateOnCard',
    content: 'Updated checklist item: Setup API Gateway tunnels',
    card: 'Intrusion Detection Gateway config',
    date: minutesAgo(192)
  }
];

const ACTIVITY_TEMPLATES = [
  {
    type: 'commentCard',
    card: 'API Authentication and Security',
    contents: [
      'Reviewed JSON web token expiry durations.',
      'Suggest rotating AWS credentials next week.',
      'Verified OAuth callback limits on production CORS rules.',
      'Added note regarding rate limits per token.'
    ]
  },
  {
    type: 'updateCheckItemStateOnCard',
    card: 'Landing Page Responsiveness Review',
    contents: [
      'Completed checklist: Test desktop safari width variations',
      'Reset checkbox: Check ultra-wide monitor margins',
      'Completed checklist: Check button sizes on mobile viewport',
      'Completed checklist: Verify image zoom rendering in viewport'
    ]
  },
  {
    type: 'cardComplete',
    card: 'Analytics Database Schema Optimization',
    contents: [
      'Executed PostgreSQL clustering index optimization.',
      'Reduced analytics page latency from 500ms to 42ms.',
      'Archive table indexing finalized for historic rows.',
      'Successfully pushed to staging environment.'
    ]
  },
  {
    type: 'createCard',
    card: 'Payment Integration Setup',
    contents: [
      'Created Trello card: Integrate Stripe Elements billing flow',
      'Created Trello card: Stripe checkout success page design',
      'Created Trello card: Webhook handler configuration for server',
      'Created Trello card: Add apple pay options to payments tray'
    ]
  },
  {
    type: 'addAttachmentToCard',
    card: 'Brand Identity Asset Catalog',
    contents: [
      'Attached company_logo_highres_darkbg.svg',
      'Attached layout_wireframe_final_approved.pdf',
      'Attached team_headshot_grid_2026.zip',
      'Attached icon_launcher_android_v3.png'
    ]
  },
  {
    type: 'updateCard (labels)',
    card: 'Vulnerability Audit',
    contents: [
      'Added labels: Critical Security Fix, High Priority',
      'Removed labels: Needs Triage',
      'Added labels: QA Verified, Ready for Production',
      'Added labels: Blocked by upstream dependencies'
    ]
  },
  {
    type: 'updateCard (description)',
    card: 'Search Index Elastic setup',
    contents: [
      'Updated description with server configuration URLs.',
      'Added mapping rules for indexing nested JSON fields.',
      'Updated description to include search query benchmarks.',
      'Amended task checklist for fuzzy matching integration.'
    ]
  }
];

export function calculateStats(members: Member[]): Stats {
  const total = members.length;
  const working = members.filter(m => m.status === 'working').length;
  const onBreak = members.filter(m => m.status === 'break').length;
  const loggedOut = members.filter(m => m.status === 'logged_out').length;

  // Use the current shift window start to check who posted an update during the current 2-hour block
  const now = new Date();
  const currentWindowStartHour = Math.floor(now.getHours() / 2) * 2;
  const currentWindowStart = new Date(now);
  currentWindowStart.setHours(currentWindowStartHour, 0, 0, 0);

  const updatedLast2h = members.filter(m => {
    if (!m.lastUpdateAt) return false;
    const updateTime = new Date(m.lastUpdateAt);
    const isLocalToday = updateTime.getFullYear() === now.getFullYear() &&
                         updateTime.getMonth() === now.getMonth() &&
                         updateTime.getDate() === now.getDate();
    const isUtcToday = updateTime.getUTCFullYear() === now.getUTCFullYear() &&
                       updateTime.getUTCMonth() === now.getUTCMonth() &&
                       updateTime.getUTCDate() === now.getUTCDate();
    const isWithinLast24h = Math.abs(now.getTime() - updateTime.getTime()) <= 24 * 60 * 60 * 1000;
    return isLocalToday || isUtcToday || isWithinLast24h;
  }).length;

  const missingUpdate = members.filter(m => m.hasMissingUpdate).length;
  const notLoggedInBy4pm = members.filter(m => m.notLoggedInBy4pm).length;

  return {
    total,
    working,
    onBreak,
    loggedOut,
    updatedLast2h,
    missingUpdate,
    notLoggedInBy4pm
  };
}

export function evaluateMissingUpdates(members: Member[]): Member[] {
  const now = new Date();
  
  // Align to the scheduled 2-hour blocks (e.g., 10:00, 12:00, 14:00)
  const currentWindowStartHour = Math.floor(now.getHours() / 2) * 2;
  const currentWindowStart = new Date(now);
  currentWindowStart.setHours(currentWindowStartHour, 0, 0, 0);
  
  // The start of the previous 2-hour block (e.g. 10:00 if current is 12:00)
  const previousWindowStart = new Date(currentWindowStart.getTime() - 2 * 60 * 60 * 1000);

  return members.map(m => {
    if (m.status !== 'working') {
      return { ...m, hasMissingUpdate: false };
    }

    // Reconstruction of the login time for the member today
    let loginTime: Date | null = null;
    if (m.login) {
      const [h, min] = m.login.split(':').map(Number);
      loginTime = new Date(now);
      loginTime.setHours(h, min, 0, 0);
    }

    // If they logged in during the CURRENT 2-hour window block, they are in their initial period.
    // The next window has not started yet, so do not flag them at all.
    if (loginTime && loginTime.getTime() >= currentWindowStart.getTime()) {
      return { ...m, hasMissingUpdate: false };
    }

    // If they logged in before the current 2-hour window block, they should have posted an update
    // either during that previous window (>= previousWindowStart) or in the current window.
    if (!m.lastUpdateAt) {
      return { ...m, hasMissingUpdate: true };
    }

    const updateTime = new Date(m.lastUpdateAt).getTime();
    
    // Only flag them if their latest update belongs to before the previous window start.
    const hasMissingUpdate = updateTime < previousWindowStart.getTime();

    return { ...m, hasMissingUpdate };
  });
}

export function simulateActivity(currentData: DashboardData): DashboardData {
  const nowISO = new Date().toISOString();

  let updatedMembers = [...currentData.members];
  let updatedActivity = [...currentData.activity];

  const rand = Math.random();

  if (rand < 0.70) {
    const activeMembers = updatedMembers.filter(m => m.status !== 'logged_out');
    if (activeMembers.length > 0) {
      const targetIndex = Math.floor(Math.random() * activeMembers.length);
      const chosenTemplate = activeMembers[targetIndex];
      const mainIndex = updatedMembers.findIndex(m => m.id === chosenTemplate.id);

      if (mainIndex !== -1) {
        const member = updatedMembers[mainIndex];

        const template = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
        const contentStr = template.contents[Math.floor(Math.random() * template.contents.length)];

        updatedMembers[mainIndex] = {
          ...member,
          status: 'working',
          breakStart: null,
          back: null,
          onBreakTooLong: false,
          lastUpdateAt: nowISO,
          lastUpdateContent: contentStr,
          lastUpdateType: template.type,
          lastUpdateCard: template.card,
          hasMissingUpdate: false
        };

        const newAct: ActivityItem = {
          id: 'act_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          name: member.name,
          type: template.type,
          content: contentStr,
          card: template.card,
          date: nowISO
        };

        updatedActivity = [newAct, ...updatedActivity].slice(0, 50);
      }
    }
  } else {
    const targetIndex = Math.floor(Math.random() * updatedMembers.length);
    const member = updatedMembers[targetIndex];

    if (member.status === 'working') {
      const nested = Math.random();
      if (nested < 0.7) {
        const minutes = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
        const breakStartFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const breakBackTime = new Date(Date.now() + minutes * 60 * 1000);
        const backFormatted = breakBackTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        updatedMembers[targetIndex] = {
          ...member,
          status: 'break',
          breakStart: breakStartFormatted,
          back: backFormatted,
          onBreakTooLong: false,
          hasMissingUpdate: false
        };
      } else {
        const logoutFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        updatedMembers[targetIndex] = {
          ...member,
          status: 'logged_out',
          logout: logoutFormatted,
          breakStart: null,
          back: null,
          hasMissingUpdate: false
        };
      }
    } else if (member.status === 'break') {
      updatedMembers[targetIndex] = {
        ...member,
        status: 'working',
        breakStart: null,
        back: null,
        onBreakTooLong: false
      };
    } else if (member.status === 'logged_out') {
      const loginFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatedMembers[targetIndex] = {
        ...member,
        status: 'working',
        login: loginFormatted,
        logout: null,
        notLoggedInBy4pm: false,
        lastUpdateAt: nowISO,
        lastUpdateContent: 'Logged in and checking board status',
        lastUpdateType: 'commentCard',
        lastUpdateCard: 'Workspace Ingress Gate',
        hasMissingUpdate: false
      };
    }
  }

  updatedMembers = evaluateMissingUpdates(updatedMembers);
  const stats = calculateStats(updatedMembers);

  return {
    lastUpdated: nowISO,
    stats,
    members: updatedMembers,
    activity: updatedActivity
  };
}

export const getInitialDashboardData = (): DashboardData => {
  const members = INITIAL_MEMBERS();
  const activity = INITIAL_ACTIVITY();
  const evaluated = evaluateMissingUpdates(members);
  
  return {
    lastUpdated: new Date().toISOString(),
    stats: calculateStats(evaluated),
    members: evaluated,
    activity: activity
  };
};
