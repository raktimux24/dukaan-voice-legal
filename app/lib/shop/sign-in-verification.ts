export const SIGN_IN_METHODS = ['email_code', 'phone_code', 'totp', 'backup_code'] as const;
export type SignInMethod = typeof SIGN_IN_METHODS[number];
type Result = { error: { message?: string; longMessage?: string } | null };
type Code = { code: string };
export interface SignInVerification {
  status: string | null;
  supportedSecondFactors?: readonly { strategy: string }[] | null;
  mfa: {
    sendEmailCode(): Promise<Result>;
    sendPhoneCode(): Promise<Result>;
    verifyEmailCode(code: Code): Promise<Result>;
    verifyPhoneCode(code: Code): Promise<Result>;
    verifyTOTP(code: Code): Promise<Result>;
    verifyBackupCode(code: Code): Promise<Result>;
  };
}
export function signInVerificationMethods(signIn: Pick<SignInVerification, 'status' | 'supportedSecondFactors'>): SignInMethod[] {
  if (signIn.status !== 'needs_client_trust' && signIn.status !== 'needs_second_factor') return [];
  return SIGN_IN_METHODS.filter(method => signIn.supportedSecondFactors?.some(factor => factor.strategy === method));
}
export function validSignInCode(method: SignInMethod, code: string) {
  return method === 'backup_code' ? code.trim().length > 0 && code.trim().length <= 64 : /^\d{6}$/.test(code.trim());
}
export async function sendSignInCode(signIn: SignInVerification, method: SignInMethod): Promise<Result> {
  if (!signInVerificationMethods(signIn).includes(method)) throw new Error('Unsupported sign-in method');
  if (method === 'email_code') return signIn.mfa.sendEmailCode();
  if (method === 'phone_code') return signIn.mfa.sendPhoneCode();
  return { error: null };
}
export async function verifySignInCode(signIn: SignInVerification, method: SignInMethod, code: string): Promise<Result> {
  if (!signInVerificationMethods(signIn).includes(method) || !validSignInCode(method, code)) throw new Error('Invalid sign-in verification');
  const params = { code: code.trim() };
  if (method === 'email_code') return signIn.mfa.verifyEmailCode(params);
  if (method === 'phone_code') return signIn.mfa.verifyPhoneCode(params);
  if (method === 'totp') return signIn.mfa.verifyTOTP(params);
  return signIn.mfa.verifyBackupCode(params);
}
