/*
 * Wazuh app - React component for show search and filter
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
import PropTypes, {InferProps, bool} from 'prop-types';
import {
  EuiPopover,
  EuiButtonEmpty,
  EuiPopoverFooter,
  EuiButtonGroup,
  EuiPopoverTitle,
  EuiText,
} from '@elastic/eui';

interface toggleButton {
  id: string, label: string
}

export class WzSearchFormatSelector extends Component {
  state: {
    isPopoverOpen:boolean
    toggleIdSelected: toggleButton
  }
  
  toggleButtons: toggleButton[]

  props!: {
    onChange: Function
    qFilterEnabled?: boolean
    apiFilterEnabled?: boolean
    format?: string
  }

  qLegend = (
    <div>
      <p>
        Q过滤器提供了一个简化的查询语法，以获得Wazuh的数据。
      </p>
      <a href="https://documentation.wazuh.com/current/user-manual/api/queries.html"
        target="_blank" >
        Q过滤器文档
      </a>
    </div>
  );
  apiLegend = (
    <div>
      <p>
        使用Wazuh API的参数来过滤数据输出，更多信息请查看我们的文档
      </p>
      <a href="https://documentation.wazuh.com/current/user-manual/api/reference.html"
        target="_blank" >
        API参考
      </a>
    </div>
  );


  constructor(props) {
    super(props);
    const { qFilterEnabled, apiFilterEnabled } = props;  
    this.toggleButtons = this.initToggleButtons(qFilterEnabled, apiFilterEnabled);
    const toggleIndex = props.format === '?Q' ? 0 : 1;
    this.state = {
      isPopoverOpen: false,
      toggleIdSelected: this.toggleButtons[toggleIndex],
    };
  }

  initToggleButtons(qEnable:boolean, apiEnable:boolean):toggleButton[] {
    const makeId = () => {
      const id = Math.random().toString(36).slice(-8);
      return /^\d/.test(id) ? 'x' + id : id;
    }
    const idPrefix = makeId();
    const toggleButtons:toggleButton[] = [];
    if (qEnable) {
      toggleButtons.push(
        {
          id: `${idPrefix}0`,
          label: '?Q',
        }
      )
    } else {
      toggleButtons.push({});
    }

    if (apiEnable) {
      toggleButtons.push(
        {
          id: `${idPrefix}1`,
          label: 'API',
        },
      )
    } else {
      toggleButtons.push({});
    }
    return toggleButtons;
  }
  
  onButtonClick() {
    this.setState({
      isPopoverOpen: !this.state.isPopoverOpen,
    });
  }
  
  closePopover() {
    this.setState({
      isPopoverOpen: false,
    });
  }

  onToggleChange = optionId => {
    const newSelectedOption = this.getLabelButtonSelected(optionId);
    this.setState({
      toggleIdSelected: newSelectedOption,
    });
    this.props.onChange((newSelectedOption || {}).label);
  };

  getLabelButtonSelected(optionId) {
    const toggleIdSelected = this.toggleButtons.find((item) => {return item.id == optionId});
    return toggleIdSelected;
  }

  renderFooter():JSX.Element | null {
    const {toggleIdSelected} = this.state;
    if (this.toggleButtons.length <= 1) {
      return null;
    }
    return (
      <EuiPopoverFooter>
        <EuiButtonGroup
          legend="这是一个基本的组"
          color='primary'
          options={this.toggleButtons}
          idSelected={toggleIdSelected.id}
          onChange={this.onToggleChange}
        />
      </EuiPopoverFooter>
    );
  }

  render() {
    const {toggleIdSelected} = this.state;
    const { apiFilterEnabled, qFilterEnabled } = this.props;
    const button = (
      <EuiButtonEmpty
        onClick={this.onButtonClick.bind(this)}>
        {"帮助"}
      </EuiButtonEmpty>
    );
    const renderFooter = (qFilterEnabled && apiFilterEnabled) 
      ? this.renderFooter()
      : null;
    
    return (
      <EuiPopover 
        id='wzFormatSelector'
        ownFocus
        button={button}
        isOpen={this.state.isPopoverOpen}
        closePopover={this.closePopover.bind(this)}>
        <EuiPopoverTitle>{"帮助"}</EuiPopoverTitle>
          <div style={{ width: '300px' }}>
            <EuiText>
              { (toggleIdSelected.label === '?Q')
               ? this.qLegend
               : this.apiLegend
              }
            </EuiText>
          </div>
          { renderFooter }
      </EuiPopover>
    );
  }
}

WzSearchFormatSelector.propTypes = {
  onChange: PropTypes.func,
}