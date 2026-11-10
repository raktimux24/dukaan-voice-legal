import type {Member, ShopRecord} from './types';
import type {Role} from './permissions';

export const canViewStaff = (role: Role | null, offline = false) => !offline && (role === 'OWNER' || role === 'MANAGER');
export const canManageMember = (role: Role | null, member: Member, offline = false) => !offline && role === 'OWNER' && member.role !== 'OWNER';
export const staffInitials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('') || '?';
export const staffDirectory = (members: Member[], query: string, role: string) => members.filter(member =>
  (role === 'ALL' || member.role === role) &&
  `${member.user.fullName} ${member.user.email}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
).sort((a, b) => ({OWNER: 0, MANAGER: 1, HELPER: 2}[a.role] - {OWNER: 0, MANAGER: 1, HELPER: 2}[b.role]) || a.user.fullName.localeCompare(b.user.fullName));
export function staffInviteCode(shop: ShopRecord, actor: Role | null, invited: 'MANAGER' | 'HELPER') {
  if (actor !== 'OWNER' && (actor !== 'MANAGER' || invited !== 'HELPER')) return null;
  return invited === 'MANAGER' ? shop.managerInviteCode : shop.helperInviteCode;
}
export const staffInviteLink = (code: string) => `samaan-bol://join?code=${encodeURIComponent(code)}`;
export function staffActivity(value?: string | null, now = Date.now()): {key:string; n?:number} {
  const at = value ? Date.parse(value) : NaN;
  if (!Number.isFinite(at) || at > now) return {key:'staffweb.activity_unknown'};
  const minutes = Math.floor((now - at) / 60000);
  if (minutes < 5) return {key:'staffweb.active_now'};
  if (minutes < 60) return {key:'staffweb.active_minutes', n:minutes};
  if (minutes < 1440) return {key:'staffweb.active_hours', n:Math.floor(minutes / 60)};
  return {key:'staffweb.active_days', n:Math.floor(minutes / 1440)};
}
