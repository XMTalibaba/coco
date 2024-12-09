/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHideFor,
  EuiShowFor,
  EuiHeaderSectionItemButton,
  EuiIcon,
  // htmlIdGenerator,
} from '@elastic/eui';
// import { i18n } from '@kbn/i18n';
import classnames from 'classnames';
import React, { useState, useEffect } from 'react';
// import React, { createRef, useState } from 'react';
// import React from 'react';
import useObservable from 'react-use/lib/useObservable';
import { Observable } from 'rxjs';
// import { CollapsibleNav } from './collapsible_nav';
import { LoadingIndicator } from '../';
import {
  ChromeBadge,
  ChromeBreadcrumb,
  ChromeNavControl,
  ChromeNavLink,
  ChromeRecentlyAccessedHistoryItem,
} from '../..';
import { InternalApplicationStart } from '../../../application/types';
import { HttpStart } from '../../../http';
import { ChromeHelpExtension } from '../../chrome_service';
import { OnIsLockedUpdate } from './';
import { HeaderBadge } from './header_badge';
import { HeaderBreadcrumbs } from './header_breadcrumbs';
// import { HeaderHelpMenu } from './header_help_menu';
// import { HeaderLogo } from './header_logo';
import { NewLogo } from './new_logo';
import { HeaderNavControls } from './header_nav_controls';
import { HeaderActionMenu } from './header_action_menu';
// @ts-expect-error
import { WzMenu } from '../wz-menu-majorsec/wz-menu';
import { VersionInfo } from './version_info';

export interface HeaderProps {
  kibanaVersion: string;
  application: InternalApplicationStart;
  appTitle$: Observable<string>;
  badge$: Observable<ChromeBadge | undefined>;
  breadcrumbs$: Observable<ChromeBreadcrumb[]>;
  customNavLink$: Observable<ChromeNavLink | undefined>;
  homeHref: string;
  isVisible$: Observable<boolean>;
  kibanaDocLink: string;
  navLinks$: Observable<ChromeNavLink[]>;
  recentlyAccessed$: Observable<ChromeRecentlyAccessedHistoryItem[]>;
  forceAppSwitcherNavigation$: Observable<boolean>;
  helpExtension$: Observable<ChromeHelpExtension | undefined>;
  helpSupportUrl$: Observable<string>;
  navControlsLeft$: Observable<readonly ChromeNavControl[]>;
  navControlsCenter$: Observable<readonly ChromeNavControl[]>;
  navControlsRight$: Observable<readonly ChromeNavControl[]>;
  basePath: HttpStart['basePath'];
  isLocked$: Observable<boolean>;
  loadingCount$: ReturnType<HttpStart['getLoadingCount$']>;
  onIsLockedUpdate: OnIsLockedUpdate;
  http: HttpStart;
}

export function Header({
  kibanaVersion,
  kibanaDocLink,
  application,
  basePath,
  onIsLockedUpdate,
  homeHref,
  http,
  ...observables
}: HeaderProps) {
  const isVisible = useObservable(observables.isVisible$, false);
  // const isLocked = useObservable(observables.isLocked$, false);
  // const [isNavOpen, setIsNavOpen] = useState(false);
  // const [isShowNav, setIsShowNav] = useState(false);
  const [isWZNavOpen, setIsWZNavOpen] = useState(false);
  const [rolesType, setRolesType] = useState('admin');

  useEffect(() => {
    // 获取当前安全插件用户
    http.get('/api/v1/configuration/account').then((res) => {
      if (res.data.backend_roles.indexOf('admin') !== -1) {
        // 超级管理员
        setRolesType('admin');
      } else if (res.data.backend_roles.indexOf('adminuser') !== -1) {
        // 用户管理员
        setRolesType('adminuser');
      } else if (res.data.backend_roles.indexOf('system') !== -1) {
        // 系统管理员
        setRolesType('system');
      } else if (res.data.backend_roles.indexOf('audit') !== -1) {
        // 审计管理员
        setRolesType('audit');
      } else if (res.data.backend_roles.indexOf('wazuh') !== -1) {
        // 操作用户
        setRolesType('wazuh');
      }
    });
    setIsWZNavOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isVisible) {
    return <LoadingIndicator loadingCount$={observables.loadingCount$} showAsBar />;
  }

  // const toggleCollapsibleNavRef = createRef<HTMLButtonElement>();
  // const navId = htmlIdGenerator()();
  const className = classnames('hide-for-sharing', 'headerGlobalNav');

  return (
    <>
      <header className={className} data-test-subj="headerGlobalNav">
        <div id="globalHeaderBars">
          <EuiHeader
            theme="dark"
            position="fixed"
            sections={[
              {
                items: [
                  // <HeaderLogo
                  //   href={homeHref}
                  //   forceNavigation$={observables.forceAppSwitcherNavigation$}
                  //   navLinks$={observables.navLinks$}
                  //   navigateToApp={application.navigateToApp}
                  // />,
                  <NewLogo http={http} />,
                  <LoadingIndicator loadingCount$={observables.loadingCount$} />,
                  <WzMenu rolesType={rolesType} isWZNavOpen={isWZNavOpen} http={http} />,
                ],
                borders: 'none',
              },
              {
                ...(observables.navControlsCenter$ && {
                  items: [
                    <EuiShowFor sizes={['m', 'l', 'xl']}>
                      <HeaderNavControls navControls$={observables.navControlsCenter$} />
                    </EuiShowFor>,
                  ],
                }),
                borders: 'none',
              },
              {
                items: [
                  <EuiHideFor sizes={['m', 'l', 'xl']}>
                    <HeaderNavControls navControls$={observables.navControlsCenter$} />
                  </EuiHideFor>,
                  // <HeaderHelpMenu
                  //   helpExtension$={observables.helpExtension$}
                  //   helpSupportUrl$={observables.helpSupportUrl$}
                  //   kibanaDocLink={kibanaDocLink}
                  //   kibanaVersion={kibanaVersion}
                  // />,
                  <VersionInfo http={http} />,
                  <HeaderNavControls navControls$={observables.navControlsRight$} />,
                  <div style={{ width: '8px' }} />,
                ],
                borders: 'none',
              },
            ]}
          />

          <EuiHeader position="fixed" style={isWZNavOpen ? { left: '220px'} : {}}>
            <EuiHeaderSection grow={false}>
              {
                // 去掉侧边导航展开按钮
              }
              {/* {isShowNav && (
                <EuiHeaderSectionItem border="right" className="header__toggleNavButtonSection">
                  <EuiHeaderSectionItemButton
                    data-test-subj="toggleNavButton"
                    aria-label={i18n.translate('core.ui.primaryNav.toggleNavAriaLabel', {
                      defaultMessage: 'Toggle primary navigation',
                    })}
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    aria-expanded={isNavOpen}
                    aria-pressed={isNavOpen}
                    aria-controls={navId}
                    ref={toggleCollapsibleNavRef}
                  >
                    <EuiIcon type="menu" size="m" />
                  </EuiHeaderSectionItemButton>
                </EuiHeaderSectionItem>
              )} */}
              <EuiHeaderSectionItem border="right" className="header__toggleNavButtonSection">
                <EuiHeaderSectionItemButton
                  data-test-subj="toggleNavButton"
                  onClick={() => setIsWZNavOpen(!isWZNavOpen)}
                  aria-expanded={isWZNavOpen}
                  aria-pressed={isWZNavOpen}
                  // aria-controls={navId}
                  // ref={toggleCollapsibleNavRef}
                >
                  <EuiIcon type={isWZNavOpen ? 'menuLeft' : 'menuRight'} size="l" />
                </EuiHeaderSectionItemButton>
              </EuiHeaderSectionItem>

              <HeaderNavControls side="left" navControls$={observables.navControlsLeft$} />
            </EuiHeaderSection>

            <HeaderBreadcrumbs
              appTitle$={observables.appTitle$}
              breadcrumbs$={observables.breadcrumbs$}
            />

            <HeaderBadge badge$={observables.badge$} />

            <EuiHeaderSection side="right">
              <EuiHeaderSectionItem border="none">
                <HeaderActionMenu actionMenu$={application.currentActionMenu$} />
              </EuiHeaderSectionItem>
            </EuiHeaderSection>
          </EuiHeader>
        </div>

        {
          // 去掉侧边导航
        }
        {/* {isShowNav && (
          <CollapsibleNav
            appId$={application.currentAppId$}
            id={navId}
            isLocked={isLocked}
            navLinks$={observables.navLinks$}
            recentlyAccessed$={observables.recentlyAccessed$}
            isNavOpen={isNavOpen}
            homeHref={homeHref}
            basePath={basePath}
            navigateToApp={application.navigateToApp}
            navigateToUrl={application.navigateToUrl}
            onIsLockedUpdate={onIsLockedUpdate}
            closeNav={() => {
              setIsNavOpen(false);
              if (toggleCollapsibleNavRef.current) {
                toggleCollapsibleNavRef.current.focus();
              }
            }}
            customNavLink$={observables.customNavLink$}
          />
        )} */}
      </header>
    </>
  );
}
