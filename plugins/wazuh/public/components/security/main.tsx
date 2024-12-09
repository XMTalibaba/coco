import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  EuiPage,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTabs,
  EuiTab,
  EuiPanel,
  EuiCallOut,
  EuiEmptyPrompt,
  EuiSpacer,
	EuiButtonIcon,
	EuiTitle,
	EuiPopover,
	EuiPopoverTitle,
} from '@elastic/eui';
import { Users } from './users/users';
import { Roles } from './roles/roles';
import { Policies } from './policies/policies';
import { GenericRequest } from '../../react-services/generic-request';
import { API_USER_STATUS_RUN_AS } from '../../../server/lib/cache-api-user-has-run-as';
import { AppState } from '../../react-services/app-state';
import { ErrorHandler } from '../../react-services/error-handler';
import { RolesMapping } from './roles-mapping/roles-mapping';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../common/hocs';
import { compose } from 'redux';
import { WAZUH_ROLE_ADMINISTRATOR_NAME } from '../../../common/constants';
import { updateSecuritySection } from '../../redux/actions/securityActions';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';

const tabs = [
  // {
  //   id: 'users',
  //   name: '用户',
  //   disabled: false,
  // },
  {
    id: 'roles',
    name: '角色',
    disabled: false,
  },
  // {
  //   id: 'policies',
  //   name: '策略',
  //   disabled: false,
  // },
  {
    id: 'roleMapping',
    name: '角色映射',
    disabled: false,
  },
];

export const WzSecurity = compose(
  withReduxProvider,
  withGlobalBreadcrumb([{ text: '' }, { text: '系统管理' }, { text: '角色管理' }]),
  withUserAuthorizationPrompt(null, [WAZUH_ROLE_ADMINISTRATOR_NAME])
)(() => {
  const dispatch = useDispatch();

  // Get the initial tab when the component is initiated
  const securityTabRegExp = new RegExp(`tab=(${tabs.map(tab => tab.id).join('|')})`);
  const tab = window.location.href.match(securityTabRegExp);

  const [selectedTabId, setSelectedTabId] = useState(tab && tab[1] || 'users');
  const [isDescPopoverOpen, setIsDescPopoverOpen] = useState(false);


  const listenerLocationChanged = () => {
    const tab = window.location.href.match(securityTabRegExp);
    setSelectedTabId(tab && tab[1] || 'users')
  }

  const checkRunAsUser = async () => {
    const currentApi = AppState.getCurrentAPI();
    try {
      const ApiCheck = await GenericRequest.request('POST',
        '/api/check-api',
        currentApi
      );
      return ApiCheck.data.allow_run_as;

    } catch (error) {
      ErrorHandler.handle(error, '检查当前API时出错');
    }
  }

  const [allowRunAs, setAllowRunAs] = useState();
  useEffect(() => {
    checkRunAsUser()
      .then(result => setAllowRunAs(result))
      .catch(error => console.log(error, '检查用户是否启用了run_as时出错'))
  }, [])

  // This allows to redirect to a Security tab if you click a Security link in menu when you're already in a Security section
  useEffect(() => {
    window.addEventListener('popstate', listenerLocationChanged)
    return () => window.removeEventListener('popstate', listenerLocationChanged);
  });

  useEffect(() => {
    dispatch(updateSecuritySection(selectedTabId));
  })

  const onSelectedTabChanged = id => {
    window.location.href = window.location.href.replace(`tab=${selectedTabId}`, `tab=${id}`);
    setSelectedTabId(id);
  };

  const renderTabs = () => {
    return tabs.map((tab, index) => (
      <EuiTab
        {...(tab.href && { href: tab.href, target: '_blank' })}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabId}
        disabled={tab.disabled}
        key={index}>
        {tab.name}
      </EuiTab>
    ));
  };

  const renderTitle = () => {
    return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['rolesOverview'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{marginTop: 3}}
                      color='primary'
                      aria-label='Open/close'
                      onClick={() => { setIsDescPopoverOpen(!isDescPopoverOpen) }}
                    />
                  }
                  anchorPosition="rightUp"
                  isOpen={isDescPopoverOpen}
                  closePopover={() => { setIsDescPopoverOpen(false) }}>
                  <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['rolesOverview'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}></EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }


  const isNotRunAs = (allowRunAs) => {
    let runAsWarningTxt = '';
    switch (allowRunAs) {
      case API_USER_STATUS_RUN_AS.HOST_DISABLED:
        runAsWarningTxt =
          '要使角色映射生效，请启用/usr/share/kibana/data/wazuh/config/wazuh.yml配置文件中的run_as，重新启动Kibana服务，清除浏览器缓存和cookie。';
        break;
      case API_USER_STATUS_RUN_AS.USER_NOT_ALLOWED:
        runAsWarningTxt =
          '角色映射没有作用，因为当前的API用户禁用了allow_run_as。';
        break;
      case API_USER_STATUS_RUN_AS.ALL_DISABLED:
        runAsWarningTxt =
          '要使角色映射生效，请启用/usr/share/kibana/data/wazuh/config/wazuh.yml配置文件中的run_as，并将当前的API用户allow_run_as设置为true。重新启动Kibana服务，清除浏览器缓存和cookie。';
        break;
      default:
        runAsWarningTxt =
          '角色映射没有作用，因为当前的API用户已经禁用了run_as。';
        break;
    }
      
    return (
      <EuiFlexGroup >
        <EuiFlexItem >
          <EuiCallOut title={runAsWarningTxt} color="warning" iconType="alert">
          </EuiCallOut>
          <EuiSpacer></EuiSpacer>
        </EuiFlexItem >
      </EuiFlexGroup>
    );
  }


  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem grow={false}>
        <div className="wz-module">
          <div className='wz-module-header-agent-wrapper'>
            <div className='wz-module-header-agent'>
              {renderTitle()}
            </div>
          </div>
          <div className='wz-module-header-nav-wrapper'>
            <div className='wz-module-header-nav'>
                <div className="wz-welcome-page-agent-tabs">
                  <EuiFlexGroup>
                    <EuiFlexItem style={{ margin: '0 8px 0 8px' }}>
                      <EuiTabs>{renderTabs()}</EuiTabs>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </div>
            </div>
          </div>
          <div className='wz-module-body'>
            <EuiPage>
              <EuiFlexGroup>
                <EuiFlexItem>
                  {selectedTabId === 'users' &&
                    <Users></Users>
                  }
                  {selectedTabId === 'roles' &&
                    <Roles></Roles>
                  }
                  {selectedTabId === 'policies' &&
                    <Policies></Policies>
                  }
                  {selectedTabId === 'roleMapping' &&
                    <>
                      {(allowRunAs !== undefined && allowRunAs !== API_USER_STATUS_RUN_AS.ENABLED) && isNotRunAs(allowRunAs)}
                      <RolesMapping></RolesMapping>
                    </>
                  }
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiPage>
          </div>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
});
