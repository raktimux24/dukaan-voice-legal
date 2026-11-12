'use client';

import {useEffect, useRef, useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useSearchParams} from 'next/navigation';
import {useShop} from '../context';
import {useShopDates} from '../use-shop-dates';
import {VoiceSheet} from '../voice-sheet';
import {Button, EmptyState, Field, NoAccess, Notice, PageHeader, Pill, Skeleton, Spinner, inputClass} from '../ui';
import {canManageMember, canViewStaff, staffActivity, staffDirectory, staffInitials, staffInviteCode, staffInviteLink} from '../../../lib/shop/staff';
import type {Member} from '../../../lib/shop/types';

type Confirm = {kind:'role'|'remove'|'tax'; member:Member; authorized?:boolean; eventId?:string|null; managerId?:string} | {kind:'rotate'};

export function StaffScreen() {
  const {shop, userId, role} = useShop();
  return <StaffWorkspace key={`${shop?.id}:${userId}:${role}`} />;
}

function StaffWorkspace() {
  const {api, shop, userId, role, perms, offline, refreshShops, t} = useShop();
  const {formatDay, formatWhen} = useShopDates();
  const params = useSearchParams(), qc = useQueryClient();
  const [query, setQuery] = useState(''), [filter, setFilter] = useState('ALL');
  const selectedId = params.get('member'), pushed = useRef(false);
  // Member detail lives in the URL so the browser Back button returns to the team list.
  const setSelectedId = (id:string|null) => {
    if (id) {pushed.current = true; window.history.pushState(null, '', '?member=' + encodeURIComponent(id)); return;}
    if (!params.get('member')) return;
    if (pushed.current) {pushed.current = false; window.history.back();}
    else window.history.replaceState(null, '', window.location.pathname);
  };
  const [invite, setInvite] = useState(false), [inviteRole, setInviteRole] = useState<'MANAGER'|'HELPER'>('HELPER');
  const [confirm, setConfirm] = useState<Confirm|null>(null), [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null), [notice, setNotice] = useState<string|null>(null);
  const lock = useRef(false);
  useEffect(() => { window.scrollTo({top:0, behavior:'instant'}); }, [selectedId]);
  const allowed = canViewStaff(role, offline), owner = perms.canManageStaff && !offline;
  const members = useQuery({queryKey:['members',userId,shop?.id], enabled:!!shop&&allowed, queryFn:()=>api.getMembers(shop!.id)});
  const tax = useQuery({queryKey:['product-tax-authorizations',userId,shop?.id],enabled:!!shop&&owner,queryFn:()=>api.getProductTaxAuthorizations(shop!.id)});
  const text = (key:string, fallback:string, vars?:Record<string,string|number>) => t('staffweb.'+key,fallback,vars);
  const roleName = (value:string) => text('role_'+value.toLowerCase(), value.charAt(0)+value.slice(1).toLowerCase());
  const roleDescription = (value:string) => text('desc_'+value.toLowerCase(), value==='OWNER'?'Manage the team, shop settings and all shop work.':value==='MANAGER'?'Manage sales, stock and customers. View costs and reports.':'Sell and update stock. Costs and staff controls stay restricted.');
  const nameOf = (m:Member) => m.user.fullName || m.user.email || text('member','Team member');
  const activity = (m:Member) => {const a=staffActivity(m.lastActiveAt);return t(a.key,'—',a.n==null?undefined:{n:a.n});};
  if (!shop) return <Spinner/>;
  if (!allowed) return <NoAccess what={text(offline?'offline':'access',offline?'Reconnect to view your team.':'Staff is available to owners and managers.')}/>;
  const rows=members.data??[], selected=rows.find(m=>m.id===selectedId), visible=staffDirectory(rows,query,filter);
  const code=staffInviteCode(shop,role,inviteRole);
  const entry=selected?tax.data?.managers.find(m=>m.memberId===selected.id):undefined;

  async function refresh() {await Promise.all([members.refetch(),...(owner?[tax.refetch()]:[])]);}
  function request(next:Confirm) {if(lock.current)return;setError(null);setNotice(null);setConfirm(next);}
  async function apply() {
    if (!confirm || !owner || offline || lock.current) return;
    lock.current=true;setBusy(true);setError(null);setNotice(null);
    try {
      api.assertSession();
      if (confirm.kind==='rotate') {
        await api.regenerateInvite(shop!.id,inviteRole);
        api.assertSession();await refreshShops();
      } else {
        const current=rows.find(m=>m.id===confirm.member.id);
        if (!current || current.role!==confirm.member.role || !canManageMember(role,current,offline)) throw Error(text('changed','This member changed. Refresh the team before trying again.'));
        if (confirm.kind==='role') await api.updateMemberRole(shop!.id,current.id,current.role==='MANAGER'?'HELPER':'MANAGER');
        if (confirm.kind==='remove') await api.removeMember(shop!.id,current.id);
        if (confirm.kind==='tax') await api.setProductTaxAuthorization(shop!.id,{managerId:confirm.managerId!,authorized:!!confirm.authorized,requestId:crypto.randomUUID(),expectedMemberId:current.id,expectedEventId:confirm.eventId??null});
        api.assertSession();
        if (confirm.kind==='remove') setSelectedId(null);
      }
      await Promise.all([qc.invalidateQueries({queryKey:['members',userId,shop!.id]}),qc.invalidateQueries({queryKey:['product-tax-authorizations',userId,shop!.id]}),qc.invalidateQueries({queryKey:['product-tax']})]);
      setConfirm(null);setNotice(text('saved','Team settings updated.'));
    } catch (caught) {setError(caught);await refresh();}
    finally {lock.current=false;setBusy(false);}
  }
  async function copyInvite(link:boolean) {
    if (!code) return;
    try {await navigator.clipboard.writeText(link?staffInviteLink(code):code);setNotice(text('copied','Invite copied.'));setError(null);} catch {setError(Error(text('copy_failed','Copy failed. Select and copy the code shown above.')));}
  }
  const inviteMessage=code?text('share_message','Join {{shop}} as {{role}}. Enter code {{code}} in Samaan Bol, or open {{url}}',{shop:shop.name,role:roleName(inviteRole),code,url:staffInviteLink(code)}):'';
  async function shareInvite() {
    if (!code) return;
    const message=inviteMessage;
    try {if(navigator.share)await navigator.share({text:message});else {await navigator.clipboard.writeText(message);setNotice(text('copied','Invite copied.'));}} catch(e) {if((e as Error).name!=='AbortError')setError(Error(text('copy_failed','Copy failed. Select and copy the code shown above.')));}
  }
  const closeInvite=()=>{if(!busy){setConfirm(null);setInvite(false);}};
  const roleTarget=confirm&&confirm.kind==='role'?(confirm.member.role==='MANAGER'?'HELPER':'MANAGER'):null;
  const confirmationTitle=confirm?.kind==='rotate'?text('rotate','Replace invite code'):confirm?.kind==='remove'?text('remove','Remove from shop'):confirm?.kind==='tax'?text('tax_title','Product tax confirmation'):text('change_role','Change role');
  const confirmationBody=confirm?.kind==='rotate'?text('rotate_hint','The previous {{role}} code will stop working. Existing team members keep their access.',{role:roleName(inviteRole)}):confirm?.kind==='remove'?text('remove_hint','Remove {{name}} from this shop? They lose access but their past records remain.',{name:nameOf(confirm.member)}):confirm?.kind==='tax'?text(confirm.authorized?'tax_grant_confirm':'tax_revoke_confirm',confirm.authorized?'Allow {{name}} to confirm product tax data? Shop GST registration stays owner-only.':'Stop {{name}} from confirming new product tax data? Existing confirmations remain recorded.',{name:nameOf(confirm.member)}):confirm?.kind==='role'?text('role_confirm','Change {{name}} to {{role}}?',{name:nameOf(confirm.member),role:roleName(roleTarget!)}):'';

  const confirmPanel=confirm?<div className="staff-confirm" role="region" aria-label={confirmationTitle}><h3>{confirmationTitle}</h3><p>{confirmationBody}</p>{roleTarget?<p>{roleDescription(roleTarget)}{roleTarget==='HELPER'?' '+text('demote_hint','Any product tax confirmation permission is revoked with this change.'):''}</p>:null}<div className="shop-actions"><Button tone={confirm.kind==='remove'?'danger':'primary'} disabled={busy} onClick={()=>void apply()}>{busy?t('common.loading','Loading…'):text('confirm','Confirm change')}</Button><Button tone="ghost" disabled={busy} onClick={()=>{setConfirm(null);setError(null);}}>{t('common.cancel','Cancel')}</Button></div></div>:null;

  return <div className="shop-page staff-workspace">
    <PageHeader kicker={text('people','People')} title={selected?nameOf(selected):text('title','Staff')} description={selected?undefined:text('intro','One shop. A team with the right access.')} actions={<Button disabled={busy||!!confirm} onClick={()=>{setError(null);setNotice(null);setInvite(true);}}>{text('invite','Invite teammate')} +</Button>}/>
    {!invite?<><Notice error={error??members.error}/>{members.isError?<Button tone="ghost" disabled={busy} onClick={()=>void refresh()}>{t('common.retry','Try again')}</Button>:null}{notice?<p className="shop-notice" role="status">{notice}</p>:null}</>:null}
    {members.isLoading?<Skeleton variant="row" count={3} label={t('common.loading','Loading')}/>:null}
    {selectedId&&!selected&&members.isSuccess?<EmptyState icon="user" title={text('missing','Member not found')} action={<Button tone="quiet" onClick={()=>{setSelectedId(null);setConfirm(null);}}>{text('back','Back to team')}</Button>}/>:null}
    {selected?<>
      <Button className="staff-back" tone="quiet" disabled={busy} onClick={()=>{setSelectedId(null);setConfirm(null);setError(null);}}>← {text('back','Back to team')}</Button>
      <div className="staff-profile"><span className="staff-avatar" aria-hidden="true">{staffInitials(nameOf(selected))}</span><div><Pill tone={selected.role==='OWNER'?'saffron':'neutral'}>{roleName(selected.role)}</Pill>{selected.userId===userId?<small className="staff-self">{text('you','You')}</small>:null}<p>{selected.user.email||'—'}</p></div></div>
      <dl className="staff-facts"><div><dt>{text('joined','Joined')}</dt><dd>{formatDay(selected.joinedAt)}</dd></div><div><dt>{text('activity','App activity')}</dt><dd>{activity(selected)}</dd><small>{formatWhen(selected.lastActiveAt)}</small></div>{selected.user.phoneNumber?<div><dt>{text('phone','Phone')}</dt><dd>{selected.user.phoneNumber}</dd></div>:null}</dl>
      <section className="staff-permissions"><div><h2>{text('access_title','Role & access')}</h2><p>{roleDescription(selected.role)}</p>{!owner?<p>{text('owner_controls','Only the owner can change roles and permissions.')}</p>:null}</div>{canManageMember(role,selected,offline)?<Button tone="ghost" disabled={busy||!!confirm} onClick={()=>request({kind:'role',member:selected})}>{text('change_role','Change role')}</Button>:null}</section>
      {selected.role==='MANAGER'&&owner?<section className="staff-tax"><h2>{text('tax_title','Product tax confirmation')}</h2><p>{text('tax_hint','Separate permission to confirm product tax data. Shop GST registration remains owner-only. Changes are recorded.')}</p>{tax.isLoading?<Spinner/>:tax.isError?<><Notice error={tax.error}/><Button tone="ghost" onClick={()=>void tax.refetch()}>{t('common.retry','Retry')}</Button></>:entry?<><Pill tone={entry.authorization?.authorized?'ok':'neutral'}>{text(entry.authorization?.authorized?'authorized':'not_authorized',entry.authorization?.authorized?'Authorized':'Not authorized')}</Pill><div className="shop-actions"><Button tone="ghost" disabled={busy||tax.isFetching||!!confirm} onClick={()=>request({kind:'tax',member:selected,authorized:!entry.authorization?.authorized,eventId:entry.authorization?.id??null,managerId:entry.managerId})}>{text(entry.authorization?.authorized?'revoke':'authorize',entry.authorization?.authorized?'Revoke permission':'Authorize confirmation')}</Button></div>{entry.authorization?<details className="staff-record"><summary>{text('record','Permission record')}</summary><p>{formatWhen(entry.authorization.createdAt)}</p><code>{entry.authorization.id}</code></details>:null}</>:<><p>{text('tax_unavailable','Permission details are unavailable. Refresh before making changes.')}</p><Button tone="ghost" disabled={busy||tax.isFetching} onClick={()=>void refresh()}>{t('common.retry','Try again')}</Button></>}</section>:null}
      {confirm&&confirm.kind!=='rotate'?<VoiceSheet title={confirmationTitle} closeLabel={t('common.cancel','Cancel')} onClose={()=>{if(!busy){setConfirm(null);setError(null);}}}><Notice error={error}/>{confirmPanel}</VoiceSheet>:null}
      {canManageMember(role,selected,offline)?<section className="staff-remove"><div><h2>{text('remove','Remove from shop')}</h2><p>{text('remove_short','Remove access to this shop. Past records are kept.')}</p></div><Button tone="danger" disabled={busy||!!confirm} onClick={()=>request({kind:'remove',member:selected})}>{text('remove','Remove from shop')}</Button></section>:null}
    </>:!selectedId?<>
      {members.isSuccess?<p className="staff-counts">{['OWNER','MANAGER','HELPER'].map(r=>roleName(r)+' '+rows.filter(m=>m.role===r).length).join(' · ')}</p>:null}
      <div className="staff-tools"><Field label={text('search','Search name or email')}><input type="search" className={inputClass} value={query} onChange={e=>setQuery(e.target.value)}/></Field><Field label={text('role','Role')}><select className={inputClass} value={filter} onChange={e=>setFilter(e.target.value)}>{['ALL','OWNER','MANAGER','HELPER'].map(r=><option key={r} value={r}>{r==='ALL'?text('all','All roles'):roleName(r)}</option>)}</select></Field></div>
      <div className="staff-directory">{visible.map(member=><button className="staff-row" key={member.id} onClick={()=>{setSelectedId(member.id);setNotice(null);setError(null);}}><span className="staff-avatar" aria-hidden="true">{staffInitials(nameOf(member))}</span><div className="staff-person"><h2>{nameOf(member)}{member.userId===userId?<small>{text('you','You')}</small>:null}</h2><p>{member.user.email||'—'}</p></div><span className="staff-row-role"><Pill tone={member.role==='OWNER'?'saffron':'neutral'}>{roleName(member.role)}</Pill></span><span className="staff-activity"><small>{text('activity','App activity')}</small>{activity(member)}</span><span aria-hidden="true">→</span></button>)}</div>
      {members.isSuccess&&!visible.length?<EmptyState icon="staff" title={text('empty','No matching team members')} body={text('empty_hint','Try a different name or role, or invite a teammate.')}/>:null}
      {!owner?<p className="shop-hint">{text('manager_hint','You can view the team and invite Helpers. The owner manages roles and permissions.')}</p>:null}
    </>:null}
    {invite?<VoiceSheet title={text('invite','Invite teammate')} closeLabel={t('common.close','Close')} onClose={closeInvite}><div className="staff-invite"><p>{text('invite_hint','Choose the access your teammate needs, then share their invite.')}</p><Field label={text('role','Role')}><select className={inputClass} value={inviteRole} disabled={busy||!!confirm} onChange={e=>{setInviteRole(e.target.value as 'MANAGER'|'HELPER');setNotice(null);setError(null);}}>{(owner?['HELPER','MANAGER']:['HELPER']).map(r=><option value={r} key={r}>{roleName(r)}</option>)}</select></Field><p>{roleDescription(inviteRole)}</p><div className="staff-code"><small>{text('invite_code','Invite code')}</small><strong>{code||'—'}</strong></div>{!code?<p>{text('code_unavailable','Invite code unavailable. Refresh the shop and try again.')}</p>:null}<div className="shop-actions"><Button disabled={!code||busy||!!confirm} onClick={()=>void shareInvite()}>{text('share','Share invite')}</Button>{code&&!busy&&!confirm?<a className="shop-btn shop-btn-ghost" href={'https://wa.me/?text='+encodeURIComponent(inviteMessage)} target="_blank" rel="noopener noreferrer">{text('whatsapp','Send on WhatsApp')} <span aria-hidden="true">↗</span></a>:null}<Button tone="ghost" disabled={!code||busy||!!confirm} onClick={()=>void copyInvite(false)}>{text('copy_code','Copy code')}</Button><Button tone="quiet" disabled={!code||busy||!!confirm} onClick={()=>void copyInvite(true)}>{text('copy_link','Copy app link')}</Button></div><p className="shop-hint">{text('link_hint','The link opens the phone app. You can also enter the code when joining a shop.')}</p><Notice error={error}/>{notice?<p role="status" className="shop-notice">{notice}</p>:null}{owner?<div className="staff-rotate"><Button tone="quiet" disabled={busy||!!confirm} onClick={()=>request({kind:'rotate'})}>{text('rotate','Replace invite code')}</Button>{confirm?.kind==='rotate'?confirmPanel:null}</div>:null}</div></VoiceSheet>:null}
  </div>;
}
