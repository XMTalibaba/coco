import React, { Component, Fragment } from 'react';
import {
  EuiFlexGrid,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
	EuiFieldText,
	EuiText,
  EuiButton,
  EuiBasicTable,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiForm,
  EuiFormRow,
  EuiFilePicker,
  EuiIcon,
} from '@elastic/eui';
import { WzButtonPermissions } from '../../../components/common/permissions/button';
import { getToasts } from '../../../kibana-services';
import './tasks.scss';
import * as FileSaver from '../../../services/file-saver';
import { WzRequest } from '../../../react-services/wz-request';

export class Tasks extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      relsList: [],
      itemIdToExpandedRowMap: {},
      isRulesModalVisible: false,
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      rulesItems: [],
      sortField: 'id',
      sortDirection: 'asc',
      isLoading: false,
      rulesTable: React.createRef(),
      ruleForm: [
        {label: '服务器IP', params: 'ip'},
        {label: '用户名称', params: 'user'},
        {label: '用户密码', params: 'pwd'},
      ],
      ruleFormParams: {
        ip: '',
        user: '',
        pwd: '',
        accountDes: ''
      },
      formParams: {
        taskTitle: ''
      },
      isUploadLoading: false,
    }
    this.fileUpload = React.createRef();
  }

  async componentDidMount() {
    this._isMount = true;
    // 如果是详情，在这里查询
    if (this.props.batchDeploymentType !== 'add') {
      await this.getDetails();
    }
  }

  async getDetails() {
    try {
      const res = await WzRequest.apiReq('PUT', `/manager/agentmanage?pretty=true&login_alias=${encodeURIComponent(this.props.detailsTasks)}&login_operation=info`, {});
      const tasksItems = (
        ((res || {}).data || {}).data || {}
      ).affected_items[0]
      let formParams = {
        taskTitle: tasksItems.task,
        date_created: tasksItems.createtime
      }
      let groupsItems = tasksItems.detail.login_info

      this.setState({ formParams, relsList: groupsItems })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '探针详情获取失败: ' + error,
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

  addColumns() {
    return [
      {
        field: 'ip',
        name: '服务器IP',
      },
      {
        field: 'user',
        name: '用户名称',
      },
      {
        // field: 'pwd',
        name: '用户密码',
        render: col => col.pwd.replace(/./g, '*')
      }
    ]
  }
  detailColumns() {
    return [
      {
        field: 'ip',
        name: '服务器IP',
      },
      {
        field: 'user',
        name: '用户名称',
      }
    ]
  }

  relsListTableRender() {
    const { relsList, itemIdToExpandedRowMap } = this.state;
    const { batchDeploymentType } = this.props;
    let columns = [];
    if (batchDeploymentType === 'add') {
      columns = this.addColumns()
    }
    else {
      columns = this.detailColumns()
    }
    return (
      <EuiBasicTable
        items={relsList}
        itemId="name"
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        isExpandable={true}
        columns={columns}
        noItemsMessage="无数据"
      />
    );
  }
  columns() {
    return [
      {
        field: 'id',
        name: 'ID',
        sortable: true,
      },
      {
        field: 'name',
        name: '名称',
        sortable: true,
        truncateText: true,
        render: name => (<span>{name.substring(0, name.length-15)}</span>)
      }
    ];
  }

	setUpdateDate(e, type) {
		let { formParams } = this.state;
		formParams[type] = e.target.value;
		this.setState({ formParams });
	}
  setRuleUpdateDate(e, type) {
    let { ruleFormParams } = this.state;
		ruleFormParams[type] = e.target.value;
		this.setState({ ruleFormParams });
  }
  setUpdateRels(value) {
    let { ruleFormParams } = this.state;
		ruleFormParams.relsId = value;
		this.setState({ ruleFormParams });
  }

  async saveDate() {
    const { formParams, relsList } = this.state;
    if (relsList.length === 0) {
      this.showToast(
        'danger',
        '警告',
        '请输入服务器数据！',
        3000
      );
      return;
    }
    else if (!formParams.taskTitle) {
      this.showToast(
        'danger',
        '警告',
        '请输入任务名称！',
        3000
      );
      return;
    }
    // let relsInfo = relsList.map(k => `${k.ip}-${k.user}-${k.pwd}`);
    // let url = `/manager/agentmanage?pretty=true&login_alias=${encodeURIComponent(formParams.taskTitle)}&login_operation=add&login_info=${encodeURIComponent(relsInfo.join(';'))}`;
    let params = {
      login_info: relsList
    }
    let url = `/manager/agentmanage?pretty=true&login_alias=${encodeURIComponent(formParams.taskTitle)}&login_operation=add`;
    const res = await WzRequest.apiReq('POST', url, params);
    const failedItems = (
      ((res || {}).data || {}).data || {}
    ).total_failed_items;
    if (failedItems === 0) {
      this.showToast(
        'success',
        '成功',
        '探针保存成功',
        3000
      );
      this.props.toList();
    }
  }

  showAgentModal() {
    this.setState({ isRulesModalVisible: true });
  }
  closeAgentModal() {
    this.setState({ isRulesModalVisible: false, ruleFormParams: {ip: '', user: '', pwd: '', accountDes: ''} })
  }
  addRels() {
    const { relsList, ruleFormParams } = this.state;
    let regexp = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/;
    let listItem = relsList.find(k => k.ip === ruleFormParams.ip);
    if (!ruleFormParams.ip || !ruleFormParams.user || !ruleFormParams.pwd) {
      this.showToast(
        'danger',
        '警告',
        '服务器IP、用户名称、用户密码为必填。',
        3000
      );
      return;
    }
    else if (listItem) {
      this.showToast(
        'danger',
        '警告',
        '服务器IP重复，请重新输入。',
        3000
      );
      return;
    }
    else if (!regexp.test(ruleFormParams.ip)) {
      this.showToast(
        'danger',
        '警告',
        '服务器IP格式不正确，请重新输入。',
        3000
      );
      return;
    }
    relsList.push(ruleFormParams);
    this.setState({ relsList })
    this.closeAgentModal()
  }

  downloadTemplate() {
    let data = `"服务器IP","用户名称","用户密码"`;
    const blob = new Blob(["\ufeff" + data], { type: 'text/csv,charset=UTF-8' });
    FileSaver.saveAs(blob, `填写模板.csv`);
  }

  checkRepeat(list, fileData) {
    let hash = {};
    let isFileRepeat = false;
    for (let i = 0, length = fileData.length; i < length; i ++) {
      if (hash[fileData[i]['ip']]) {
        isFileRepeat = true;
        break;
      }
      hash[fileData[i]['ip']] = true;
    }

    let includesArr = list.filter((x)=>{
      return hash[x.ip]
    })
    return includesArr.length === 0 && !isFileRepeat;
  }

  onFilesChange(files) {
    if (files.length !== 0) {
      this.setState({ isUploadLoading: true });
      let { relsList } = this.state;
      try {
        let file = files[0];
        let reader = new FileReader();
        reader.onload = e => {
          let isLegal = true; // 数据是否合法
          let regexp = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/;
          const { result } = e.target;
          const fileArr = result.includes('\r\n') ? result.split('\r\n').filter(i => i && i.trim()) : result.split('\n').filter(i => i && i.trim());
          const csvHeader = fileArr[0].split(',');
          const csvData = fileArr.splice(1);
          const field = {
            '服务器IP': 'ip',
            '用户名称': 'user',
            '用户密码': 'pwd'
          }
          const data = csvData.map(k => {
            let item = {};
            let rowArr = k.split(',');
            Object.keys(field).forEach(f => {
              item[field[f]] = rowArr[csvHeader.indexOf(f)]
            })
            if (!item.ip || !item.user || !item.pwd || !regexp.test(item.ip)) {
              isLegal = false;
            }
            return item;
          })

          if (!isLegal) {
            this.showToast(
              'danger',
              '警告',
              '文件读取失败，请检查表格数据: 服务器IP、用户名称、用户密码为必填，服务器IP须为IP格式',
              3000
            );
          }
          else if (!this.checkRepeat(relsList, data)) {
            this.showToast(
              'danger',
              '警告',
              '文件读取失败，文件中有重复服务器IP，请检查',
              3000
            );
          }
          else {
            relsList = relsList.concat(data);
            this.showToast('success', '成功', '文件读取成功', 3000);
          }

          this.fileUpload.current.fileInput.value = '';
          this.fileUpload.current.fileInput.blur();
          this.fileUpload.current.handleChange();
          this.setState({ isUploadLoading: false, relsList });
        }
        reader.readAsText(file, 'GB2312')
      } catch (error) {
        this.showToast(
          'danger',
          '警告',
          '文件上传失败: ' + error,
          3000
        );
        this.setState({ isUploadLoading: false });
      }
    }
  }

  render() {
    const {
      formParams,
      relsList,
      isRulesModalVisible,
      ruleForm,
      ruleFormParams,
      isUploadLoading
    } = this.state;
    const { batchDeploymentType } = this.props;
    const relsListTable = this.relsListTableRender();
    let modal;
    if (isRulesModalVisible) {
      modal = (
        <EuiOverlayMask onClick={() => this.closeAgentModal()}>
          <EuiModal
            onClose={() => this.closeAgentModal()}
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>新增服务器</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <EuiForm component="form">
              {Object.keys(ruleForm).map((idx) => (
                <EuiFormRow label={ruleForm[idx].label} key={idx}>
                  <EuiFieldText
                    type={ruleForm[idx].label === '用户密码' ? 'password' : 'text'}
                    value={ruleFormParams[ruleForm[idx].params]}
                    onChange={(e) => this.setRuleUpdateDate(e, ruleForm[idx].params)}
                  />
                </EuiFormRow>
              ))}
              </EuiForm>
            </EuiModalBody>
            <EuiModalFooter>
              <EuiButton onClick={() => this.addRels()} fill>保存</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle>
              <h2>{batchDeploymentType === 'add' ? '部署任务' : '任务详情'}</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.props.toList()}
              iconType="cross"
            >
              返回任务列表
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiFlexGrid columns={2}>
          <EuiFlexItem>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
                <EuiText textAlign="right">
                  任务名称:
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
              {batchDeploymentType !== 'add' && (
                <p>{formParams['taskTitle']}</p>
              )}
              {batchDeploymentType === 'add' && (
                <EuiFieldText
                  value={formParams['taskTitle']}
                  onChange={(e) => this.setUpdateDate(e, 'taskTitle')}
                />
              )}
              </EuiFlexItem>
            </EuiFlexGroup>
            
          </EuiFlexItem>
          {batchDeploymentType !== 'add' && (
            <EuiFlexItem>
              <EuiFlexGroup alignItems="center">
                <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
                  <EuiText textAlign="right">
                    创建时间:
                  </EuiText>
                </EuiFlexItem>
                <EuiFlexItem>
                  <p>{formParams['date_created']}</p>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          )}
        </EuiFlexGrid>
        <EuiSpacer size="l" />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>部署服务器列表 ({relsList.length})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          { batchDeploymentType === 'add' && (
            <EuiFlexItem grow={false}>
              <EuiFlexGroup alignItems='center'>
                <EuiFlexItem>
                  <EuiButton
                    size="s"
                    onClick={() => this.downloadTemplate()}
                  >
                    下载批量模板
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem>
                <div className="custom_input_file_box">
                  <EuiFilePicker
                    className="euiFileUpload_probeTask"
                    onChange={(files) => this.onFilesChange(files)}
                    display={'default'}
                    initialPromptText="批量上传"
                    accept=".csv"
                    ref={this.fileUpload}
                    isLoading={isUploadLoading}
                  />
                  {/* 下方注释掉有上传icon */}
                  {/* <div className="custom_input_file">
                    <EuiIcon type="exportAction" className="euiFilePicker__icon" color="#006BB4" />
                    <div className="euiFilePicker__promptText">批量上传</div>
                  </div> */}
                </div>
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiButton
                    size="s"
                    onClick={() => this.showAgentModal()}
                  >
                    新增服务器
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
        {relsListTable}
        <EuiSpacer size="l" />
        {batchDeploymentType === 'add' && (
          <EuiButton
            size="s"
            onClick={() => this.saveDate()}
          >
            保存
          </EuiButton>
        )}
        {modal}
      </div>
    )
  }
}
