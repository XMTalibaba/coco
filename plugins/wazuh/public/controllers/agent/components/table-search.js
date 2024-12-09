import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiFieldSearch,
  EuiFieldText,
  EuiText
} from '@elastic/eui';

export class TableSearch extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      searchParams: {}
    };
  }

  async componentDidMount() {
    this._isMount = true;
    this.initParams();
  }

  initParams() {
    const { paramsOptions } = this.props;
    let searchParams = {};
    paramsOptions.forEach(k => {
      searchParams[k.type] = ''
    });
    this.setState({ searchParams })
  }

  onSearchText(value, type, searchDelay = '') {
    const { searchParams } = this.state;
    searchParams[type] = value;
    this.setState({
      searchParams
    });
    if (searchDelay) {
      if (this.textSearchTimer) clearTimeout(this.textSearchTimer);
      this.textSearchTimer = null;
      this.textSearchTimer = setTimeout(() => {
        this.getItems(searchParams)
        clearTimeout(this.textSearchTimer);
        this.textSearchTimer = null;
      }, searchDelay);
    }
    else {
      this.getItems(searchParams);
    }
  }

  onSearchSelect(e, type) {
    const { searchParams } = this.state;
    searchParams[type] = e.target.value;
    this.setState({
      searchParams
    });
    this.getItems(searchParams)
  }

  getItems(searchParams) {
    this.props.getList(searchParams);
  }

  render() {
    const { searchParams } = this.state;
    const { paramsOptions } = this.props;

    return (
      <div>
        <EuiFlexGroup wrap={true}>
        {Object.keys(paramsOptions).map((idx) => (
          <EuiFlexItem grow={false} key={idx}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText textAlign="right">{paramsOptions[idx].label}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: 150 }}>
              { paramsOptions[idx].inputType === 'text' && (
                // <EuiFieldSearch
                <EuiFieldText
                  value={searchParams[paramsOptions[idx].type]}
                  onChange={(e) => this.onSearchText(e.target.value, paramsOptions[idx].type, 500)}
                  // onSearch={(e) => this.onSearchText(searchParams[paramsOptions[idx].type], paramsOptions[idx].type)}
                  placeholder={`筛选 ${paramsOptions[idx].label}`}
                  aria-label={`筛选 ${paramsOptions[idx].label}`}
                  fullWidth
                />
              )}
              { paramsOptions[idx].inputType === 'select' && (
                <EuiSelect
                  options={paramsOptions[idx].selectOptions}
                  value={searchParams[paramsOptions[idx].type]}
                  onChange={(e) => this.onSearchSelect(e, paramsOptions[idx].type)}
                  aria-label={`筛选 ${paramsOptions[idx].label}`}
                />
              )}
              </EuiFlexItem>
            </EuiFlexGroup>
          
          </EuiFlexItem>
        ))}
        </EuiFlexGroup>
      </div>
    )
  }
}