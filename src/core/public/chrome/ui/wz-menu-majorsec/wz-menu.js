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

/*
 * Wazuh app - React component for build q queries.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component, Fragment } from 'react';
import { MenuNav } from './wz-menu-nav';
import './wz-menu.scss';
import { createBrowserHistory } from "history";

export class WzMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMenuTab: '',
      sections: {},
      navItems: {},
    };
    this.isLoading = false;
  }

  async componentDidMount() {
    const response = await this.props.http.get('/api/getPagePermission');
    this.setState({ sections: response.data.sections, navItems: response.data.NavPermission });
    this.load();
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.isWZNavOpen !== this.props.isWZNavOpen) {
      const wzWrap = document.getElementById('kibana-body');
      if (this.props.isWZNavOpen) {
        wzWrap.style.paddingLeft = '220px';
      } else {
        wzWrap.style.paddingLeft = '0';
      }
    }
  }


  getCurrentTab(location = window.location.hash) {
    const { sections } = this.state;
    let currentWindowLocation = location;
    let currentTab = 'homeOverview';
 
   
  let outTime=Number(JSON.parse(window.localStorage.getItem('outTimeString')))||35
          // let currentTab = 'kibanaManage';
      
  const bol =window.location.pathname.includes('wazuh')
//     let currentTab;
console.log(bol,outTime,window.location.pathname,'window.location.pathname')
if(!bol){
     currentWindowLocation=window.location.pathname   
   
}

let timeoutId
//定义一个计时器
if(timeoutId ){
  clearInterval(timeoutId)
}
let oldTime=new Date().getTime();
let currentTime;
window.document.onmouseover=function(){
  oldTime=new Date().getTime()
}
timeoutId = setInterval(()=>{
    currentTime=new Date().getTime();
  
    if(currentTime - oldTime>=outTime*60*1000){
  
     const history = createBrowserHistory()
    history.replace({
      pathname: `/app/login`,
    });
    history.go()
    
    }

},60*1000)



    


    Object.keys(sections).some((section) => {
      if (currentWindowLocation.includes(`${section}`)) {
        currentTab = sections[section];

        return true;
      }
    });
    return currentTab;
  }

  async load() {
    try {
      // const wzWrap = document.getElementsByTagName('body')[0];
      // if (wzWrap.className.indexOf('euiBody--collapsibleNavIsDocked--majorsec') === -1) {
      //   wzWrap.className += ' euiBody--collapsibleNavIsDocked--majorsec';
      // }
      const wzWrap = document.getElementById('kibana-body');
      wzWrap.style.paddingLeft = '220px';
      const currentTab = this.getCurrentTab();
      if (currentTab !== this.state.currentMenuTab) {
        this.setState({ currentMenuTab: currentTab });
      }
    } catch (error) {
      console.log(error);
    }
    this.isLoading = false;
  }

  navigateToModule(e, section, params, app) {
    const urlParams = {};

    if (Object.keys(params).length) {
      Object.keys(params).forEach((key) => {
        if (key === 'filters') {
          urlParams._w = this.buildFilter_w(params[key], {});
        } else {
          urlParams[key] = params[key];
        }
      });
    }
    const url = Object.entries(urlParams)
      .map((e) => e.join('='))
      .join('&');
    const currentUrl = window.location.href.split('#/')[0].split('/app/')[0];
   
    const newUrl =currentUrl + `/app/${app}#/${section}?` + url;
    const location = `#/${section}?${url}`;

    const currentTab = this.getCurrentTab(location);


    if (currentTab !== this.state.currentMenuTab) {
      this.setState({ currentMenuTab: currentTab });
    }

    window.location.href = newUrl;
  }

  render() {
    const { rolesType, isWZNavOpen } = this.props;
    const { currentMenuTab, navItems } = this.state;

    return (
      <Fragment>
        {isWZNavOpen && (
          <MenuNav
            rolesType={rolesType}
            navigateToModule={(e, section, params, app) =>
              this.navigateToModule(e, section, params, app)
            }
            currentMenuTab={currentMenuTab}
            navItems={navItems}
          />
        )}
      </Fragment>
    );
  }
}
