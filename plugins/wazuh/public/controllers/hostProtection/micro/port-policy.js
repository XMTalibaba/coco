import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiText,
  EuiFieldText,
	EuiButtonEmpty,
  EuiSpacer,
  EuiInMemoryTable,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiSwitch,
  EuiButton,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import { RulesetHandler } from '../../management/components/management/ruleset/utils/ruleset-handler';
import { WzButtonPermissions } from '../../../components/common/permissions/button';

export class PortPolicy extends Component {
  _isMount = false;
	constructor(props) {
    super(props);
		this.state = {
			portSaveParams: {
				port: ''
			},
      isOpenPort: false,
      saveList: [],
      delItemKey: '',
      isDelModalVisible: false,
      portParamOptions: [
        {
          label: '配置端口',
          note: '',
          type: 'port',
          inputType: 'text'
        }
			],
      
    }
    this.rulesetHandler = new RulesetHandler('micro');
  }

  async componentDidMount() {
    this._isMount = true;
    this.getPortConfig();
  }

  componentWillUnmount() {
    this._isMount = false;
  }

  async componentDidUpdate(prevProps, prevState) {
  }

  async getPortConfig() {
    try {
      const { detailsItem } = this.props;
      this.closeAddEntry();
      const { portSaveParams } = this.state;
      let orderArr = Object.keys(portSaveParams);
      const result = await this.rulesetHandler.getFileContent(`${detailsItem}_port_safe`);
      
			console.log(result);
      let list = []
      let lines = result ? result.split('\n') : [];
      let isOpenPort = false;
      if (lines.length > 0) {
        isOpenPort = lines[0] === 'open' ? true : false;
        lines.shift();
      }
      lines.forEach(l => {
        let arr = l.split(',');
        let item = {};
        orderArr.forEach((p, i) => {
          item[p] = arr[i]
        })
        list.push(item)
      })
      let saveList = this.setListKey(list);
      this.setState({ saveList, isOpenPort });
      // this.props.changeMicroStrategyTypes('port');
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '端口安全策略查询失败: ' + error,
        3000
      );
    }
  }
	
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  setUpdateDatePort(e, type) {
		let { portSaveParams } = this.state;
		portSaveParams[type] =e.target.value.replace(/[^\x00-\xff]/g, '');
		this.setState({ portSaveParams });
	}

  setUpdateSwitchDate(e) {
    let { isOpenPort } = this.state;
		isOpenPort = e.target.checked;
		this.setState({ isOpenPort });
    this.savePort();
  }

  openAddEntry = () => {
    this.setState({
      isPopoverOpen: true
    });
  };

  setListKey(arr) {
    arr.forEach((k, index) => k.key = index);
    return arr;
  }

  testPort(port) {
    if (port === 'any') return true;
    let portReg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
    return portReg.test(port);
  }

  async savePort() {
    try {
      let { saveList, isOpenPort } = this.state;
      const { detailsItem } = this.props;
      let raw = '';
      console.log(saveList)
      saveList.forEach(item => {
        delete item.key;
        raw = raw
        ? `${raw}\n${item.port}`
        : `${item.port}`;
      })
      // 更新策略文件
      if (!raw) {
        await this.rulesetHandler.updateFile(`${detailsItem}_port_safe`, `${isOpenPort ? 'open' : 'close'}`, true);
      }
      else {
        let line = `${isOpenPort ? 'open' : 'close'}\n${raw}`
        await this.rulesetHandler.updateFile(`${detailsItem}_port_safe`, line, true);
      }
      // 下发策略
      let paramsArr = raw.split('\n').join(',');
      let params = {
        command: 'port-safe.sh',
        arguments: [paramsArr, `${isOpenPort ? 'open' : 'close'}`],
        custom: true
      }
      await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${detailsItem}`, params);
      this.showToast(
        'success',
        '成功',
        '端口安全策略配置保存成功',
        3000
      );
    } catch (error) {
      if (error.includes('Agent is not active')) {
        this.showToast(
          'danger',
          '警告',
          '端口安全策略配置保存失败: 该代理为未连接状态，不可配置微隔离策略',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '端口安全策略配置保存失败: ' + error,
          3000
        );
      }
    }
  }

  addItemPort() {
    let { saveList, portSaveParams } = this.state;

    if (!portSaveParams.port) {
      this.showToast(
				'danger',
				'警告',
				'端口安全策略配置新增失败: 端口为必填',
				3000
			);
      return;
    }
    else if (!this.testPort(portSaveParams.port)) {
      this.showToast(
				'danger',
				'警告',
				'端口安全策略配置新增失败: 端口号格式不合法，请输入合法端口号或any',
				3000
			);
      return;
    }
    saveList.push(portSaveParams);
    saveList = this.setListKey(saveList);
    portSaveParams = {
      port: '',
      target_ip: '',
      protocol: '',
      source_port: '',
      target_port: '',
    }
    this.setState({ portSaveParams })

    this.savePort()
  }

  deletePortItem() {
    let { saveList, delItemKey } = this.state;
    saveList.splice(delItemKey, 1);
    saveList = this.setListKey(saveList);
    this.setState({ saveList })
    this.setDelModal(false);
    this.savePort()
  }

  closeAddEntry = () => {
    this.setState({
      isPopoverOpen: false,
      portSaveParams: {
        port: ''
      },
      isOpenPort: false
    });
  };

  buildPortTableColumns() {
    return [
      {
        field: 'port',
        name: '端口',
        align: 'left'
      },
      {
        name: '操作',
        align: 'left',
        render: item => {
          return (
            <Fragment>
              <WzButtonPermissions
                buttonType='icon'
                aria-label="删除内容"
                iconType="trash"
                // permissions={this.getDeletePermissions(fileName)}
                tooltip={{position: 'top', content: `删除该策略`}}
                onClick={ev => {
                  this.toShowDelModal(item.key);
                }}
                color="danger"
              />
            </Fragment>
          );
        }
      }
    ]
  }

  toShowDelModal(key) {
    this.setState({ delItemKey: key });
    this.setDelModal(true);
  }

  setDelModal(flag) {
    this.setState({isDelModalVisible: flag});
    if (!flag) this.setState({ delItemKey: '' });
  }

  render() {
    const { saveList, isDelModalVisible, portParamOptions, portSaveParams, isOpenPort } = this.state;
    const { detailsItemName } = this.props;
    const message = saveList.length > 0 ? false : '没有结果...';
    let delModal;
    if (isDelModalVisible) {
      delModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该策略吗？"
            onCancel={() => this.setDelModal(false)}
            onConfirm={() => this.deletePortItem()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    return (
      <div>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
              <h2>{`配置${detailsItemName}端口安全策略`}</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiText textAlign="right">{'是否开放端口'}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiSwitch
                  label=""
                  checked={isOpenPort}
                  onChange={(e) => this.setUpdateSwitchDate(e)}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
          {!this.state.isPopoverOpen && (
            <EuiButton
              size="s"
              onClick={() => this.openAddEntry()}
            >
              新增
            </EuiButton>
          )}
          </EuiFlexItem>
          {/* <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.savePort()}
            >
              保存
            </EuiButton>
          </EuiFlexItem> */}
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.props.toList()}
              iconType="cross"
            >
              关闭
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs"></EuiSpacer>
        {this.state.isPopoverOpen && (
          <div>
            <EuiText color="subdued">
              {'配置端口号信息。'}
            </EuiText>
            <EuiSpacer size="l" />
            <EuiFlexGroup>
              {Object.keys(portParamOptions).map((idx) => (
                <EuiFlexItem key={idx}>
                  { portParamOptions[idx].inputType === 'text' && (
                    <EuiFieldText
                      fullWidth={true}
                      value={portSaveParams[portParamOptions[idx].type]}
                      placeholder={portParamOptions[idx].label}
                      onChange={(e) => this.setUpdateDatePort(e, portParamOptions[idx].type)}
                    />
                  )}
                </EuiFlexItem>
              ))}
              <EuiFlexItem grow={false}>
                <EuiFlexGroup>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      iconType="plusInCircle"
                      fill="true"
                      isDisabled={!portSaveParams.port}
                      onClick={() => this.addItemPort()}
                    >
                      新增
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                  
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty iconType="cross" onClick={() => this.closeAddEntry()}>
                      关闭
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        )}
        <EuiSpacer size="l"></EuiSpacer>
        <EuiInMemoryTable
          itemId="id"
          items={saveList}
          columns={this.buildPortTableColumns()}
          pagination={{ pageSizeOptions: [10, 15] }}
          sorting={true}
          message={message}
          search={{ box: { incremental: true, placeholder: '过滤' } }}
        />
        {delModal}
      </div>
    )
  }
}
