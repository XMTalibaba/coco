import React, { Component } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiTextColor,
	EuiPanel,
  EuiFieldText,
  EuiText,
  EuiInMemoryTable,
	EuiSpacer,
	EuiButton,
	EuiButtonEmpty,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';

export class HostFound extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      isLoading: false,
      showErrors: false,
      paramOptions: [
        {
          label: '起始IP',
          type: 'beginIp'
        },
        {
          label: '终止IP',
          type: 'endIp'
        }
      ],
      saveParams: {
        beginIp: '',
        endIp: ''
      },
      agentList: []
    };
	}

  async componentDidMount() {
    this._isMount = true;
    await this.getList();
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  onChangeIp(e, type) {
    let { saveParams } = this.state;
		saveParams[type] = e.target.value.replace(/[^\x00-\xff]/g, '');
		this.setState({ saveParams });
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  testIp(ip) {
		if (ip === 'any') return true;
    const segments = ip.split(".");
    // 如果是精确的 4 段而且每段转换成数字都在 1~255 就对了
    return segments.length === 4
      && segments
        .map(segment => parseInt(segment, 10) || 0)
        .every(n => n >= 0 && n <= 255);
	}

  async toScan() {
    const { saveParams } = this.state;
    try {
      if (!saveParams.beginIp || !saveParams.endIp) {
        this.showToast(
          'danger',
          '警告',
          '扫描失败: 起始IP、终止IP为必填',
          3000
        );
        return;
      }
      else if (!this.testIp(saveParams.beginIp) || !this.testIp(saveParams.endIp)) {
        this.showToast(
          'danger',
          '警告',
          '扫描失败: IP格式不合法，请输入合法IP',
          3000
        );
        return;
      }
      else if (parseInt(saveParams.beginIp.replaceAll('.', '')) >= parseInt(saveParams.endIp.replaceAll('.', ''))) {
        this.showToast(
          'danger',
          '警告',
          '扫描失败: 起始IP和终止IP不构成网段',
          3000
        );
        return;
      }

      let rawItems = await WzRequest.apiReq('POST', `/ip_scan?startip=${saveParams.beginIp}&endip=${saveParams.endIp}`, {});
      const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('successfully')) {
        this.setState({ saveParams: { beginIp: '', endIp: '' } });
        this.showToast(
          'success',
          '成功',
          '扫描启动成功，扫描执行需要一定时间，请稍后刷新扫描结果列表查看',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '扫描启动失败: 存在正在执行的扫描，请扫描结束后重试',
          3000
        );
      }

    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '扫描启动失败: ' + error,
        3000
      );
    }
  }

  buildTableColumns() {
    return [
      {
        field: 'start_ip',
        name: '扫描起始IP',
        align: 'left'
      },
      {
        field: 'end_ip',
        name: '扫描终止IP',
        align: 'left'
      },
      {
        field: 'ip',
        name: 'IP',
        align: 'left'
      }
    ]
  }

  async getList() {
    try {
      this.setState({ isLoading: true });
      let agentList = [];

      const rawItems = await WzRequest.apiReq('GET', `/ip_scan`, {});
      const items_message = ((rawItems || {}).data || {}).message;
      const { start_ip, end_ip } = (rawItems || {}).data || {}
      if (!items_message) {
        this.showToast(
          'success',
          '成功',
          '没有扫描任务',
          3000
        );
      }
      else if (items_message.includes('failed')) {
        this.showToast(
          'success',
          '成功',
          '扫描执行需要一定时间，请稍后刷新扫描结果列表查看',
          3000
        );
        this.setState({ agentList, isLoading: false });
      }
      else {
        let list = items_message.split(',');
        list.forEach(k => {
          agentList.push({
            start_ip,
            end_ip,
            ip: k
          })
        })
      }
      this.setState({ agentList, isLoading: false });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '扫描结果查询失败: ' + error,
        3000
      );
      this.setState({ agentList, isLoading: false });
    }
  }

  render() {
    const { paramOptions, saveParams, showErrors, agentList, isLoading } = this.state;
    const message = agentList.length > 0 ? false : '暂无数据';

    return (
      <EuiPage>
        <EuiPanel>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiTitle size="s">
                <h3>{'主机发现'}</h3>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiTextColor color="subdued">{'扫描网段内未安装探针的主机列表'}</EuiTextColor>
            </EuiFlexItem>
            <EuiFlexItem />
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                size="s"
                onClick={() => this.props.toHostFound(false)}
                iconType="cross"
              >
                关闭
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiTitle size="xs">
                <h4>{'主机扫描'}</h4>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiTextColor color="subdued">{'配置扫描网段'}</EuiTextColor>
            </EuiFlexItem>
          </EuiFlexGroup>
          {paramOptions.map((item, mdx) => (
            <EuiFlexGroup alignItems="center" key={mdx}>
              <EuiFlexItem grow={false} style={{ width: 100 }}>
                <EuiText textAlign="right">{item.label}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFieldText
                  value={saveParams[item.type]}
                  onChange={(e) => this.onChangeIp(e, item.type)}
                  isInvalid={showErrors}
                />
              </EuiFlexItem>
              { showErrors && (
                <EuiFlexItem grow={false}>
                  <EuiTextColor color="danger">请检验IP格式，多条以英文逗号分隔</EuiTextColor>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          ))}
          <EuiSpacer size="l" />
          <EuiButton
            size="s"
            onClick={() => this.toScan()}
          >
            开启扫描
          </EuiButton>
          <EuiSpacer size="m" />
          <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
          <EuiSpacer size="m" />
          
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiTitle size="xs">
                <h4>{'扫描结果'}</h4>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiTextColor color="subdued">{'未安装探针的主机列表'}</EuiTextColor>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                size="s"
                onClick={() => this.getList()}
              >
                刷新列表
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="l" />
          <EuiInMemoryTable
            itemId="id"
            items={agentList}
            columns={this.buildTableColumns()}
            pagination={{ pageSizeOptions: [10, 15] }}
            sorting={true}
            message={message}
            loading={isLoading}
            search={{ box: { incremental: true, placeholder: '过滤' } }}
          />
        </EuiPanel>
      </EuiPage>
    )
  }
}