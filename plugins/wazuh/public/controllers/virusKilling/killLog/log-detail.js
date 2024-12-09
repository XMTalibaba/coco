import React, { Component } from 'react';
import {
  EuiButtonEmpty,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiInMemoryTable,
	EuiSpacer,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiToolTip,
  EuiButtonIcon,
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { getToasts }  from '../../../kibana-services';

export class LogDetail extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      listItems: [],
      isLoading: false,
      isolateFile: false,
      isOlateModalVisible: false,
      fileItem: {},
    }
  }

  async componentDidMount() {
    this._isMount = true;
    await this.getIsolateFile()
    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
  }

  async getIsolateFile() {
    const isolateFileItems = await WzRequest.apiReq('GET', `/manager/configuration?pretty=true&section=active-response`, {});
    const isolateFileItem = (
      ((isolateFileItems || {}).data || {}).data || {}
    ).affected_items[0]['active-response'].find(k => k.command === 'isolate-file');
    const isolateFile = isolateFileItem && (!isolateFileItem.disabled || isolateFileItem.disabled === 'no') ? true : false;

    const isolateFileWinItem = (
      ((isolateFileItems || {}).data || {}).data || {}
    ).affected_items[0]['active-response'].find(k => k.command === 'isolate-file-win');
    const isolateFileWin = isolateFileWinItem && (!isolateFileWinItem.disabled || isolateFileWinItem.disabled === 'no') ? true : false;
    this.setState({ isolateFile: isolateFile && isolateFileWin })
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const { detailsItem } = this.props;
      const rawItems = await WzRequest.apiReq( 'GET', `/malware/detail/${detailsItem.agent_id}?pretty=true&scan_id=${detailsItem.scan_id}`, {} );

      const { affected_items } = ((rawItems || {}).data || {}).data || {};

      this._isMount &&
        this.setState({
          listItems: affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }

  columns() {
    return [
      {
        field: 'agent_id',
        name: '主机ID',
        width: '80'
      },
      {
        field: 'agent_name',
        name: '主机名'
      },
      {
        field: 'agent_ip',
        name: '主机IP'
      },
      {
        field: 'malware_path',
        name: '恶意文件路径'
      },
      {
        field: 'hit_sign',
        name: '恶意文件类型'
      },
      {
        field: 'md5',
        name: 'MD5'
      },
      {
        field: 'is_isolated',
        name: '隔离状态',
        align: 'left',
        render: is_isolated => is_isolated === '0' ? '未隔离' : '已隔离'
      },
      {
        align: 'right',
        width: '80',
        name: '操作',
        render: agent => this.actionButtonsRender(agent)
      }
    ];
  }
  actionButtonsRender(item) {
    const { isolateFile } = this.state;
    return (
      <div className={'icon-box-action'}>
        { !isolateFile && item.is_isolated === '0' && 
          <span>
            <EuiToolTip
              content="隔离文件"
              position="left"
            >
              <EuiButtonIcon
                onClick={ev => {
                  ev.stopPropagation();
                  this.toShowOlateModal(item);
                }}
                iconType="inputOutput"
                color={'primary'}
                aria-label="隔离文件"
              />
            </EuiToolTip>
            &nbsp;
          </span>
        }
      </div>
    )
  }
  tableRender() {
    const {
      listItems,
      isLoading,
    } = this.state;
    const columns = this.columns();
    const message = isLoading ? false : '没有结果...';
    return (
      <EuiInMemoryTable
        itemId="scan_id"
        items={listItems}
        loading={isLoading}
        columns={columns}
        pagination={{ pageSizeOptions: [10, 15] }}
        message={message}
        search={{ box: { incremental: true, placeholder: '过滤' } } }
      />
    )
  }

  toShowOlateModal(item) {
    this.setState({ fileItem: item });
    this.setOlateModal(true);
  }

  setOlateModal(flag) {
    this.setState({isOlateModalVisible: flag});
    if (!flag) this.setState({ fileItem: {} });
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async toOlateFile() {
    const { fileItem } = this.state;
    try {
      let paramsLinux = {
        command: 'isolate_file.sh',
        arguments: [`${fileItem.malware_path} -a move`],
        custom: true
      }
      let paramsWindows = {
        command: 'isolate_file.cmd',
        arguments: [`${fileItem.malware_path} -a move`],
        custom: true
      }
      await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${fileItem.agent_id}`, paramsLinux);
      await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${fileItem.agent_id}`, paramsWindows);

      this.getItems();
      this.showToast(
        'success',
        '成功',
        '隔离文件成功，隔离状态需要几秒钟延迟更新，请稍后刷新列表。',
        3000
      );
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '隔离文件失败: ' + error,
        3000
      );
    }
    this.setOlateModal(false)
  }

  render() {
    const { isOlateModalVisible } = this.state;
    const { detailsItem } = this.props;
    const table = this.tableRender();

    let olateModal;
    if (isOlateModalVisible) {
      olateModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认隔离该文件吗？"
            onCancel={() => this.setOlateModal(false)}
            onConfirm={() => this.toOlateFile()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      )
    }
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>{`${detailsItem.agent_name}病毒查杀详情`}</h3>
            </EuiTitle>
          </EuiFlexItem>
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
        <EuiSpacer></EuiSpacer>
        {table}
        {olateModal}
      </div>
    )
  }

}