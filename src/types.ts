/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MemberStatus = 'working' | 'break' | 'logged_out';

export interface Member {
  id: string;
  name: string;
  status: MemberStatus;
  login: string | null;
  breakStart: string | null;
  back: string | null;
  logout: string | null;
  dayOff: string[];
  missedCounter: number; // monthly missed-update counter
  lastUpdateAt: string | null; // ISO timestamp or absolute time
  lastUpdateContent: string | null;
  lastUpdateType: string | null;
  lastUpdateCard: string | null;
  hasMissingUpdate: boolean;
  onBreakTooLong: boolean;
  notLoggedInBy4pm?: boolean;
}

export interface ActivityItem {
  id?: string; // unique key for animations
  name: string;
  type: string; // "commentCard" | "updateCheckItemStateOnCard" | "cardComplete" | "createCard" | "addAttachmentToCard" | "updateCard (labels)" | "updateCard (description)"
  content: string;
  card: string;
  date: string; // ISO timestamp
}

export interface Stats {
  total: number;
  working: number;
  onBreak: number;
  loggedOut: number;
  updatedLast2h: number;
  missingUpdate: number;
  notLoggedInBy4pm: number;
}

export interface DashboardData {
  lastUpdated: string;
  stats: Stats;
  members: Member[];
  activity: ActivityItem[];
}
