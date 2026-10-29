"use client";
import React,{useContext} from 'react';
import {ShopContext} from './context';
import {DeletionView, type DeletionUi} from '../../lib/shop/deletion/view';
import {deletionSupportUrl, deletionPolicyUrl} from '../../lib/shop/deletion/workflow';
import {Button} from './ui';
export const deletionWebUi: DeletionUi = {
  Box: ({children,row}) => <div className={row ? 'shop-actions' : 'grid gap-3'}>{children}</div>,
  Text: ({children,danger,live}) => <p role={live ? 'status' : undefined} className={danger ? 'text-sm text-danger' : 'shop-section-sub'}>{children}</p>,
  Button: ({label,onPress,disabled,danger}) => <Button tone={danger ? 'danger' : 'ghost'} disabled={disabled} onClick={onPress}>{label}</Button>,
};
export function DeletionControl(props: Omit<React.ComponentProps<typeof DeletionView>, 'ui' | 'support' | 'policy'> & {language?: string}) {
  const context=useContext(ShopContext);
  const {language,...viewProps}=props;
  return <DeletionView {...viewProps} ui={deletionWebUi} support={() => {window.location.href=deletionSupportUrl(props.t('settings.delete_account'));}} policy={() => {window.open(deletionPolicyUrl(language??context?.prefs?.appLanguage),'_blank','noopener,noreferrer');}} />;
}
