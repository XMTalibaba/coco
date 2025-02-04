/*
 * Wazuh app - React component building the configuration component.
 *
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { } from 'react';
import ConfigurationHandler from '../utils/configuration-handler';
//@ts-ignore
import { getToasts } from '../../../../kibana-services';
import { ISetting } from '../configuration'
import {
  EuiBottomBar,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiButtonEmpty,
  EuiButton
} from '@elastic/eui';
import { WazuhConfig } from '../../../../react-services/wazuh-config';


interface IBottomBarProps {
  updatedConfig: { [setting: string]: string | number | boolean | object }
  setUpdateConfig(setting: {}): void
  setLoading(loading: boolean): void
  config: ISetting[]
}

export const BottomBar: React.FunctionComponent<IBottomBarProps> = ({ updatedConfig, setUpdateConfig, setLoading, config }) => {
  return (!!Object.keys(updatedConfig).length
    ? <EuiBottomBar paddingSize="m">
      <EuiFlexGroup alignItems='center' justifyContent='spaceBetween' gutterSize='s'>
        <SettingLabel updatedConfig={updatedConfig} />
        <CancelButton setUpdateConfig={setUpdateConfig} />
        <SaveButton
          updatedConfig={updatedConfig}
          setUpdateConfig={setUpdateConfig}
          setLoading={setLoading}
          config={config} />
      </EuiFlexGroup>
    </EuiBottomBar>
    : null
  );
}

const SettingLabel = ({ updatedConfig }) => (
  <EuiFlexItem className='mgtAdvancedSettingsForm__unsavedCount'>
    <EuiText color='ghost' className='mgtAdvancedSettingsForm__unsavedCountMessage'>
      {`${Object.keys(updatedConfig).length} unsaved settings`}
    </EuiText>
  </EuiFlexItem>
);


const CancelButton = ({ setUpdateConfig }) => (
  <EuiFlexItem grow={false}>
    <EuiButtonEmpty
      size='s'
      iconSide='left'
      iconType='cross'
      color="ghost"
      className="mgtAdvancedSettingsForm__button"
      onClick={() => setUpdateConfig({})}>
      取消更改
    </EuiButtonEmpty>
  </EuiFlexItem>
)

const SaveButton = ({ updatedConfig, setUpdateConfig, setLoading, config }) => (
  <EuiFlexItem grow={false}>
    <EuiButton
      fill
      size='s'
      iconSide='left'
      iconType='check'
      color='secondary'
      className="mgtAdvancedSettingsForm__button"
      onClick={() => saveSettings(updatedConfig, setUpdateConfig, setLoading, config)} >
      保存更改
      </EuiButton>
  </EuiFlexItem>
)

const saveSettings = async (updatedConfig: {}, setUpdateConfig: Function, setLoading: Function, config: ISetting[]) => {
  setLoading(true);
  try {
    await Promise.all(Object.keys(updatedConfig).map(async setting => await saveSetting(setting, updatedConfig, config)));
    successToast();
    setUpdateConfig({});
  } catch (error) {
    errorToast(error);
  } finally {
    setLoading(false);
  }
}

const saveSetting = async (setting, updatedConfig, config: ISetting[]) => {
  try {
    (config.find(item => item.setting === setting) || { value: '' }).value = updatedConfig[setting];
    const result = await ConfigurationHandler.editKey(setting, updatedConfig[setting]);

    // Update the app configuration frontend-cached setting in memory with the new value
    const wzConfig = new WazuhConfig();
    wzConfig.setConfig({ ...wzConfig.getConfig(), ...{ [setting]: formatValueCachedConfiguration(updatedConfig[setting]) } });

    // Show restart and/or reload message in toast
    const response = result.data.data;
    response.needRestart && restartToast();
    response.needReload && reloadToast();
    response.needHealtCheck && executeHealtCheck();
  } catch (error) {
    return Promise.reject(error);
  }
}

const reloadToast = () => {
  getToasts().add({
    color: 'success',
    title: '此设置要求您重新加载页面才能生效。',
    text: <EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
      <EuiFlexItem grow={false}>
        <EuiButton onClick={() => window.location.reload()} size="s">重新加载页面</EuiButton>
      </EuiFlexItem>
    </EuiFlexGroup>
  })
}

const executeHealtCheck = () => {
  const toast = getToasts().add({
    color: 'warning',
    title: '您必须执行状态检查，以使更改生效。',
    toastLifeTimeMs: 5000,
    text:
      <EuiFlexGroup alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false} >
          <EuiButton onClick={() => {
            getToasts().remove(toast);
            window.location.href = '#/health-check';
          }} size="s">执行状态检查</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
  });
}

const restartToast = () => {
  getToasts().add({
    color: 'warning',
    title: '你必须重启Kibana才能使更改生效',
  });
}

const successToast = () => {
  getToasts().add({
    color: 'success',
    title: '已成功更新配置',
  });
}

const errorToast = (error) => {
  getToasts().add({
    color: 'danger',
    title: `保存配置错误: ${error.message || error}`,
  });
}

const formatValueCachedConfiguration = (value) => typeof value === 'string'
  ? isNaN(Number(value)) ? value : Number(value)
  : value;
