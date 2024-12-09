/*
 * Wazuh app - React component for registering agents.
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
import { connect } from 'react-redux';

import {
  updateFilters,
  updateIsProcessing
} from '../../../../../redux/actions/rulesetActions';
import { WzRequest } from '../../../../../react-services/wz-request';
import { WzSearchBar } from '../../../../../components/wz-search-bar';

class WzRulesetSearchBar extends Component {
  constructor(props) {
    super(props);
  }

  rulesItems = [
    {
      type: 'params',
      label: '状态',
      description: '按状态过滤规则。',
      values: ['enabled', 'disabled']
    },
    {
      type: 'params',
      label: '组',
      description: '按组过滤规则',
      values: async value => {
        const filter = { limit: 30 };
        if (value) {
          filter['search'] = value;
        }
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/groups', filter);
        return (((result || {}).data || {}).data || {}).affected_items;
      },
    },
    {
      type: 'params',
      label: '等级',
      description: '按等级过滤规则',
      values: [...Array(16).keys()]
    },
    {
      type: 'params',
      label: '文件名称',
      description: '按文件名称过滤规则。',
      values: async value => {
        const filter = { limit: 30 };
        if (value) {
          filter['search'] = value;
        }
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/files', filter);
        return (((result || {}).data || {}).data || {}).affected_items.map((item) => {return item.filename});
      },
    },
    {
      type: 'params',
      label: '相对目录名',
      description: '规则文件的路径',
      values: async value => {
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/manager/configuration', {params: {
          section: 'ruleset',
          field: 'rule_dir'
        }});
        return (((result || {}).data || {}).data || {}).affected_items[0].ruleset.rule_dir;
      }
    },
    {
      type: 'params',
      label: 'hipaa',
      description: '按HIPAA要求过滤规则',
      values: async () => {
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/requirement/hipaa', {});
        return (((result || {}).data || {}).data || {}).affected_items;
      }
    },
    {
      type: 'params',
      label: 'gdpr',
      description: '按GDPR要求过滤规则',
      values: async () => {
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/requirement/gdpr', {});
        return (((result || {}).data || {}).data || {}).affected_items;
      }
    },
    {
      type: 'params',
      label: 'nist-800-53',
      description: '按NIST要求过滤规则',
      values: async () => {
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/requirement/nist-800-53', {});
        return (((result || {}).data || {}).data || {}).affected_items;
      }
    },
    {
      type: 'params',
      label: 'gpg13',
      description: '按GPG要求过滤规则',
      values: async () => {
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/requirement/gpg13', {});
        return (((result || {}).data || {}).data || {}).affected_items;
      }
    },
    {
      type: 'params',
      label: 'pci_dss',
      description: '按PCI DSS要求过滤规则',
      values: async () => {
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/requirement/pci_dss', {});
        return (((result || {}).data || {}).data || {}).affected_items;
      }
    },
    {
      type: 'params',
      label: 'tsc',
      description: '按TSC要求过滤规则',
      values: async () => {
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/requirement/tsc', {});
        return (((result || {}).data || {}).data || {}).affected_items;
      }
    },
    {
      type: 'params',
      label: 'mitre',
      description: '按MITRE要求过滤规则',
      values: async () => {
        const result = await WzRequest.apiReq('GET', '/rules/requirement/mitre', {});
        return (((result || {}).data || {}).data || {}).affected_items;
      }
    }
  ];
  rulesFiles = [
    {
      type: 'params',
      label: '文件名称',
      description: '按文件名称过滤规则。',
      values: async value => {
        const filter = { limit: 30 };
        if (value) {
          filter['search'] = value;
        }
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/rules/files', filter);
        return (((result || {}).data || {}).data || {}).affected_items.map((item) => {return item.filename});
      },
    },
  ];

  decodersItems = [
    {
      type: 'params',
      label: '文件名称',
      description: '按文件名称过滤解码器。',
      values: async value => {
        const filter = { limit: 30 };
        if (value) {
          filter['search'] = value;
        }
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/decoders/files', filter);
        return (((result || {}).data || {}).data || {}).affected_items.map((item) => {return item.filename});
      },
    },
    {
      type: 'params',
      label: '相对目录名',
      description: '解码器文件的路径。',
      values: async () => {
        const wzReq = (...args) => WzRequest.apiReq(...args);
        const result = await wzReq('GET', '/manager/configuration', {params: {
          section: 'ruleset',
          field: 'decoder_dir'
        }});
        return (((result || {}).data || {}).data || {}).affected_items[0].ruleset.decoder_dir;
      }
    },
    {
      type: 'params',
      label: '状态',
      description: '按状态过滤解码器。',
      values: ['enabled', 'disabled']
    }
  ];

  apiSuggestsItems = {
    items: {
      rules: this.rulesItems,
      decoders: this.decodersItems,
      list: []
    },
    files: {
      rule: this.rulesFiles,
      decoders: [],
      list: []
    }
  };

  buttonOptions = {
    rules: [{label: "定制规则", field:"relative_dirname", value:"etc/rules"}, ],
    decoders: [{label: "定制解码器", field:"relative_dirname", value:"etc/decoders"}, ],
    list: []
  };

  render() {
    const { section, showingFiles, filters } = this.props.state;
    const type = showingFiles ? 'files' : 'items';
    const suggestions = this.apiSuggestsItems[type][section] || [];
    const buttonOptions = this.buttonOptions[section];
    return (
      <WzSearchBar
        noDeleteFiltersOnUpdateSuggests
        suggestions={suggestions}
        buttonOptions={buttonOptions}
        placeholder='筛选或查询'
        filters={filters}
        onFiltersChange={this.props.updateFilters}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.rulesetReducers
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateFilters: filters => dispatch(updateFilters(filters)),
    updateIsProcessing: state => dispatch(updateIsProcessing(state))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzRulesetSearchBar);
