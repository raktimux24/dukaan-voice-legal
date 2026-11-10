import {AuthProvider} from '../components/AuthProvider';
export default function Layout({children}: {children: React.ReactNode}) {return <AuthProvider>{children}</AuthProvider>;}
