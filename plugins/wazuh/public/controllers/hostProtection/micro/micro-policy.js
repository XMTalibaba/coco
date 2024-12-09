import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiButtonIcon,
	EuiText,
  EuiFieldText,
  EuiSelect,
	EuiButtonEmpty,
  EuiSpacer,
  EuiInMemoryTable,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiToolTip,
  EuiButton,
  EuiTabs,
  EuiTab,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import { RulesetHandler } from '../../management/components/management/ruleset/utils/ruleset-handler';
import { WzButtonPermissions } from '../../../components/common/permissions/button';

export class MicroPolicy extends Component {
  _isMount = false;
	constructor(props) {
    super(props);
    this.offset = 200;
		this.state = {
      tabs: [
        { id: 'ipv4_input', name: 'ipv4输入' },
        { id: 'ipv4_output', name: 'ipv4输出' },
        { id: 'ipv6_input', name: 'ipv6输入' },
        { id: 'ipv6_output', name: 'ipv6输出' },
      ],
      selectView: 'ipv4_input',
      searchList: {
        'ipv4_input': [],
        'ipv4_output': [],
        'ipv6_input': [],
        'ipv6_output': [],
      },
      isLoading: false,
			microSaveParams: {
				source: '',
				sport: '',
				prot: '',
				destination: '',
				dport: '',
        target: ''
			},
      saveList: [],
      delItemKey: '',
			microParamOptions: [
        {
          label: '源IP',
          note: '',
          type: 'source',
          inputType: 'text'
        },
        {
          label: '源端口',
          note: '',
          type: 'sport',
          inputType: 'text'
        },
        {
          label: '协议号',
          note: '',
          type: 'prot',
          inputType: 'select',
          options: [ { value: '', text: '选择协议号'}, { value: 'all', text: '所有协议'}, { value: 'tcp', text: 'tcp'}, { value: 'udp', text: 'udp'}, { value: 'icmp', text: 'icmp'}]
        },
        {
          label: '目的IP',
          note: '',
          type: 'destination',
          inputType: 'text'
        },
        {
          label: '目的端口',
          note: '',
          type: 'dport',
          inputType: 'text'
        },
        {
          label: '策略动作',
          note: '',
          type: 'target',
          inputType: 'select',
          options: [ { value: '', text: '选择策略动作'}, { value: 'ACCEPT', text: '允许'}, { value: 'DROP', text: '丢弃'}, { value: 'REJECT', text: '拒绝'}]
        },
			],
      isDelModalVisible: false,
      isLogModalVisible: false,
      logModalList: []
    }
    this.rulesetHandler = new RulesetHandler('micro');
  }

  async componentDidMount() {
    this._isMount = true;
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
    window.addEventListener('resize', this.updateHeight);

    this.getMicroConfig();
  }

  componentWillUnmount() {
    this._isMount = false;
  }

  async componentDidUpdate(prevProps, prevState) {
  }

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
  };

  async getMicroConfig() {
    this.setState({ isLoading: true });
    try {
      const { detailsItem } = this.props;
      this.closeAddEntry();
      const { selectView } = this.state;
      const result = await WzRequest.apiReq('GET', `/agents/${detailsItem}/iptables`, {});
      const { affected_items } = ((result || {}).data || {}).data;
      let searchList = {
        'ipv4_input': [],
        'ipv4_output': [],
        'ipv6_input': [],
        'ipv6_output': [],
      }
      affected_items.forEach(item => {
        Object.keys(item).forEach(k => {
          let key = k.toLowerCase();
          if (key.includes('ipv4') && key.includes('input')) {
            searchList['ipv4_input'] = item[k]
          }
          else if (key.includes('ipv4') && key.includes('output')) {
            searchList['ipv4_output'] = item[k]
          }
          else if (key.includes('ipv6') && key.includes('input')) {
            searchList['ipv6_input'] = item[k]
          }
          else if (key.includes('ipv6') && key.includes('output')) {
            searchList['ipv6_output'] = item[k]
          }
        })
      })
      let saveList = this.setListKey(searchList[selectView]);
      this.setState({ saveList, searchList })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '微隔离策略查询失败: ' + error,
        3000
      );
    }
    this.setState({ isLoading: false });
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  setUpdateDate(e, type) {
		let { microSaveParams } = this.state;
		microSaveParams[type] =e.target.value.replace(/[^\x00-\xff]/g, '');
		this.setState({ microSaveParams });
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

  testIp(ip) {
    const { selectView } = this.state;
		if (ip === 'any') return true;
    if (selectView.includes('ipv4')) {
      const segments = ip.split(".");
      // 如果是精确的 4 段而且每段转换成数字都在 1~255 就对了
      return segments.length === 4
        && segments
          .map(segment => parseInt(segment, 10) || 0)
          .every(n => n >= 0 && n <= 255);
    }
    else {
      const ipReg = /^(([\da-fA-F]{1,4}):){8}$/;
      return ipReg.test(ip + ':')
    }
	}

  testPort(port) {
    if (port === 'any') return true;
    let portReg = /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
    return portReg.test(port);
  }

  async addItemMicro() {
    try {
      let { microSaveParams, selectView } = this.state;
      const { detailsItem} = this.props;

      if (!microSaveParams.source || !microSaveParams.destination || !microSaveParams.prot || !microSaveParams.sport || !microSaveParams.dport || !microSaveParams.target) {
        this.showToast(
          'danger',
          '警告',
          '微隔离策略配置新增失败: 源IP、源端口、协议号、目的IP、目的端口、策略动作为必填',
          3000
        );
        return;
      }
      else if (!this.testIp(microSaveParams.source) || !this.testIp(microSaveParams.destination)) {
        this.showToast(
          'danger',
          '警告',
          '微隔离策略配置新增失败: IP格式不合法，请输入合法IP或any',
          3000
        );
        return;
      }
      else if (!this.testPort(microSaveParams.sport) || !this.testPort(microSaveParams.dport)) {
        this.showToast(
          'danger',
          '警告',
          '微隔离策略配置新增失败: 端口号格式不合法，请输入合法端口号或any',
          3000
        );
        return;
      }

      // 下发策略
      let paramsArr = [microSaveParams.source, microSaveParams.sport, microSaveParams.prot, microSaveParams.destination, microSaveParams.dport, microSaveParams.target];
      paramsArr.push('add'); // 加操作
      paramsArr = paramsArr.concat(selectView.split('_')); // 加表名
      let params = {
        command: 'micro-isolate.sh',
        arguments: paramsArr,
        custom: true
      }
      await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${detailsItem}`, params);

      microSaveParams = {
        source: '',
        destination: '',
        prot: '',
        sport: '',
        dport: '',
        target: '',
      }
      this.setState({ microSaveParams })
      this.showToast(
        'success',
        '成功',
        '微隔离策略配置新增成功，数据延迟更新',
        3000
      );
    } catch (error) {
      if (error.includes('Agent is not active')) {
        this.showToast(
          'danger',
          '警告',
          '微隔离策略配置新增失败: 该代理为未连接状态，不可配置微隔离策略',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '微隔离策略配置新增失败: ' + error,
          3000
        );
      }
    }
    
  }

  async deleteMicroItem() {
    try {
      const { saveList, delItemKey, selectView } = this.state;
      const { detailsItem } = this.props;
      let delItem = saveList.find(k => k.key === delItemKey);

      // 下发策略
      delete delItem.key;
      let paramsArr = [delItem.source, delItem.sport, delItem.prot, delItem.destination, delItem.dport, delItem.target];
      paramsArr.push('delete'); // 加操作
      paramsArr = paramsArr.concat(selectView.split('_')); // 加表名
      let params = {
        command: 'micro-isolate.sh',
        arguments: paramsArr,
        custom: true
      }
      await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${detailsItem}`, params);

      this.showToast(
        'success',
        '成功',
        '微隔离策略配置删除成功，数据延迟更新',
        3000
      );
    } catch (error) {
      if (error.includes('Agent is not active')) {
        this.showToast(
          'danger',
          '警告',
          '微隔离策略配置新增失败: 该代理为未连接状态，不可配置微隔离策略',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '微隔离策略配置删除失败: ' + error,
          3000
        );
      }
    }
    this.setDelModal(false);
  }

  closeAddEntry = () => {
    this.setState({
      isPopoverOpen: false,
      microSaveParams: {
        source: '',
        destination: '',
        prot: '',
        sport: '',
        dport: '',
        target: ''
      },
    });
  };

  buildMicroTableColumns() {
    return [
      {
        field: 'source',
        name: '源IP',
        align: 'left'
      },
      {
        field: 'sport',
        name: '源端口',
        align: 'left'
      },
      {
        field: 'prot',
        name: '协议号',
        align: 'left',
        render: prot => {
          return (
            <span>
              { prot === 'all' && '所有协议'}
              { prot !== 'all' && prot}
            </span>
          )
        }
      },
      {
        field: 'destination',
        name: '目的IP',
        align: 'left'
      },
      {
        field: 'dport',
        name: '目的端口',
        align: 'left'
      },
      {
        field: 'target',
        name: '动作',
        align: 'left',
        render: target => {
          return (
            <span>
              { target === 'ACCEPT' && '允许'}
              { target === 'DROP' && '丢弃'}
              { target === 'REJECT' && '拒绝'}
              { target !== 'ACCEPT' && target !== 'DROP' && target !== 'REJECT' && '-'}
            </span>
          )
        }
      },
      {
        // field: 'lognum',
        name: '日志数量',
        align: 'left',
        render: item => {
          return (
            <EuiButtonEmpty
              fill="true"
              onClick={() => this.toShowLogModal(item.log)}
            >
              {item.lognum ? item.lognum : 0}
            </EuiButtonEmpty>
          )
        }
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

  buildLogTableColumns() {
    return [
      {
        field: 'srcip',
        name: '源IP',
        align: 'left'
      },
      {
        field: 'sport',
        name: '源端口',
        align: 'left'
      },
      {
        field: 'proto',
        name: '协议号',
        align: 'left'
      },
      {
        field: 'dstip',
        name: '目的IP',
        align: 'left'
      },
      {
        field: 'dport',
        name: '目的端口',
        align: 'left'
      },
      {
        field: 'time',
        name: '时间',
        align: 'left'
      },
    ]
  }

  toShowLogModal(list) {
    this.setState({ logModalList: list ? list : [] });
    this.setLogModal(true);
  }

  setLogModal(flag) {
    this.setState({isLogModalVisible: flag});
    if (!flag) this.setState({ logModalList: [] });
  }

  toShowDelModal(key) {
    this.setState({ delItemKey: key });
    this.setDelModal(true);
  }

  setDelModal(flag) {
    this.setState({isDelModalVisible: flag});
    if (!flag) this.setState({ delItemKey: '' });
  }

  renderTabs() {
		const { selectView } = this.state;
		return (
			<EuiTabs className="columnTabs" >
				{this.state.tabs.map((tab, index) => {
					return <EuiTab
						onClick={() => this.onSelectedTabChanged(tab.id)}
						isSelected={selectView === tab.id}
						key={index}
					>
						{tab.name}
					</EuiTab>
				}
				)}
			</EuiTabs>
    );
	}

  onSelectedTabChanged(id) {
    if (id !== this.state.selectView) {
      this.closeAddEntry();
      const { searchList } = this.state;
      let saveList = this.setListKey(searchList[id]);
			this.setState({ selectView: id, saveList });
    }
  }

  render() {
    const { microParamOptions, microSaveParams, saveList, isDelModalVisible, isLogModalVisible, logModalList, isLoading } = this.state;
    const { detailsItemName } = this.props;
		const tabs = this.renderTabs();
    const message = saveList.length > 0 ? false : '没有结果...';
    let delModal, logModal;
    const logMessage = logModalList.length > 0 ? false : '没有结果...';
    if (isDelModalVisible) {
      delModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该策略吗？"
            onCancel={() => this.setDelModal(false)}
            onConfirm={() => this.deleteMicroItem()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    if (isLogModalVisible) {
      logModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setLogModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>日志详情</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <EuiInMemoryTable
                style={{ margin: '8px 0' }}
                itemId="id"
                items={logModalList}
                columns={this.buildLogTableColumns()}
                pagination={{ pageSizeOptions: [10, 15] }}
                sorting={true}
                message={logMessage}
                search={{ box: { incremental: true, placeholder: '过滤' } }}
              />
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButton onClick={() => this.setLogModal(false)} fill>确认</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    return (
      <div>
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgb(211, 218, 230)'}}>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem grow={false} style={{ marginRight: 0 }}>
                  <EuiToolTip position="right" content={`返回代理列表`}>
                    <EuiButtonIcon
                      aria-label="Back"
                      style={{ paddingTop: 8 }}
                      color="primary"
                      iconSize="l"
                      iconType="arrowLeft"
                      onClick={() => this.props.toList()}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiTitle>
                    <h1>{`配置${detailsItemName}微隔离策略`}</h1>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiButton
                    size="s"
                    onClick={() => this.getMicroConfig()}
                  >
                    刷新
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        </div>
        <EuiFlexGroup style={{ height: this.height }}>
          <EuiFlexItem grow={false} style={{ borderRight: '1px solid #D3DAE6', overflowY: 'auto' }}>
            {tabs}
          </EuiFlexItem>
          <EuiFlexItem style={{ overflowY: 'auto', overflowX: 'hidden' }}>
            <EuiSpacer size="m" />
            <EuiFlexGroup alignItems="center" style={{ flexGrow: 0 }}>
              <EuiFlexItem>
                <EuiTitle size="xs">
                  <h4>{}</h4>
                </EuiTitle>
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
            </EuiFlexGroup>
            <EuiSpacer size="xs"></EuiSpacer>
            {this.state.isPopoverOpen && (
              <div>
                <EuiText color="subdued">
                  {'配置源IP、目的IP、协议号、源端口、目的端口信息。'}
                </EuiText>
                <EuiSpacer size="l" />
                <EuiFlexGroup>
                  {Object.keys(microParamOptions).map((idx) => (
                    <EuiFlexItem grow={false} style={{ width: 150 }} key={idx}>
                      { microParamOptions[idx].inputType === 'text' && (
                        <EuiFieldText
                          value={microSaveParams[microParamOptions[idx].type]}
                          placeholder={microParamOptions[idx].label}
                          onChange={(e) => this.setUpdateDate(e, microParamOptions[idx].type)}
                        />
                      )}
                      { microParamOptions[idx].inputType === 'select' && (
                        <EuiSelect
                          options={microParamOptions[idx].options}
                          value={microSaveParams[microParamOptions[idx].type]}
                          onChange={(e) => this.setUpdateDate(e, microParamOptions[idx].type)}
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
                          onClick={() => this.addItemMicro()}
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
              loading={isLoading}
              items={saveList}
              columns={this.buildMicroTableColumns()}
              pagination={{ pageSizeOptions: [10, 15] }}
              sorting={true}
              message={message}
              search={{ box: { incremental: true, placeholder: '过滤' } }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        {delModal}
        {logModal}
      </div>
    )
  }
}