import type {Metadata} from 'next';
import {AccountDeletionPage} from './screen';
export const metadata: Metadata={title:'Delete account — Samaan Bol',description:'Request account deletion and review retained business records in Samaan Bol.'};
export default function Page(){return <AccountDeletionPage/>;}
