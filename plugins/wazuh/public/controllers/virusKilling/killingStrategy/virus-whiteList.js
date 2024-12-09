import React, { Component, Fragment } from 'react';
import {
  EuiInMemoryTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiToolTip,
  EuiButtonIcon,
  EuiText,
  EuiButtonEmpty,
  EuiFieldText,
  EuiSpacer,
  EuiButton,
  EuiOverlayMask,
  EuiConfirmModal,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzButtonPermissions } from '../../../components/common/permissions/button';
import { WzRequest } from '../../../react-services/wz-request';

export class VirusWhiteList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      isSaving: false,
      editing: false,
      isPopoverOpen: false,
      addingValue: '',
      editingValue: '',
      newListName: '',
      fileType: {
        prompt: '配置MD5。不可输入中文。',
        addPlaceholder: 'MD5',
        columns: 'MD5'
      },
      isCluster: false,
      listInfo: {
        name: '病毒白名单'
      },
      deleteKey: '',
      isDeleteModalVisible: false
    };
    this.items = [];
  }

  async componentDidMount() {
    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    this.setState({
      isCluster
    });

    if (this.props.groupSelect) this.initData();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.groupSelect !== this.props.groupSelect) {
      this.initData();
    }
  }

  async initData() {
    const { groupSelect } = this.props;
    const result = await WzRequest.apiReq('GET', `/groups/${groupSelect}/files/virus_ignored/xml?pretty=true`, { });
    let res = result.data.length > 4 ? result.data.substring(1, result.data.length-1).split(', ') : [];
    res.length > 0 && res.forEach((k, i) => {
      res[i] = k.substring(1, k.length-1).replace(/\\\\/g, '\\')
    })
    const file = {
      name: `${groupSelect}Virus whitelist`,
      content: res
    };
    this.items = res;
    const items = this.contentToArray(res);
    this.setState({ items, listInfo: file });
  }

  contentToArray(obj) {
    const items = [];
    obj.length > 0 && obj.forEach((k, i) => {
      items.push({ index: i, id: k });
    })
    return items;
  }

  itemsToRaw() {
    let raw = this.items.join('\n');
    if (raw) {
      raw += '\n';
    }
    else {
      raw = 'empty'
    }
    return raw;
  }

  async saveList() {
    try {
      const raw = this.itemsToRaw();
      this.setState({ isSaving: true });
      const { isCluster } = this.state;
      const { groupSelect } = this.props;
      await WzRequest.apiReq('PUT', isCluster ? '/cluster' + `/groups/${groupSelect}/virus_ignored` : `/groups/${groupSelect}/virus_ignored`, {
        body: raw.toString(),
        origin: 'raw'
      });
      this.showToast('success', 'success', 'updata', 3000);
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '列表保存失败: ' + error,
        3000
      );
    }
    this.setState({ isSaving: false });
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  openAddEntry = () => {
    this.setState({
      isPopoverOpen: true
    });
  };

  closeAddEntry = () => {
    this.setState({
      isPopoverOpen: false,
      addingValue: ''
    });
  };

  onChangeValue = e => {
    this.setState({
      addingValue: e.target.value.replace(/[^\x00-\xff]/g, '')
    });
  };

  onChangeEditingValue = e => {
    this.setState({
      editingValue: e.target.value.replace(/[^\x00-\xff]/g, '')
    });
  };

  addItem() {
    const { addingValue } = this.state;
    if (this.items.indexOf(addingValue) !== -1) {
      this.showToast(
        'danger',
        '警告',
        <Fragment>
          <strong>{addingValue}</strong> 已经存在
        </Fragment>,
        3000
      );
      return;
    }
    this.items.push(addingValue)
    const itemsArr = this.contentToArray(this.items);
    this.setState({
      items: itemsArr,
      addingValue: ''
    });

    this.saveList()
  }

  setEditedValue() {
    const { editingValue, editing } = this.state;
    if (this.items.indexOf(editingValue) !== -1 && this.items.indexOf(editingValue) !== editing) {
      this.showToast(
        'danger',
        '警告',
        <Fragment>
          <strong>{editingValue}</strong> 已经存在
        </Fragment>,
        3000
      );
      return;
    }

    if (this.items[editing] === editingValue) {
      this.setState({
        editing: false,
        editingValue: '',
        generatingCsv: false
      });
    }
    else {
      this.items[editing] = editingValue;
      const itemsArr = this.contentToArray(this.items);
      this.setState({
        items: itemsArr,
        editing: false,
        editingValue: '',
        generatingCsv: false
      });

      this.saveList()
    }
  }

  deleteItem() {
    const { deleteKey } = this.state;
    this.items.splice(deleteKey, 1)
    const items = this.contentToArray(this.items);
    this.setState({ items });

    this.saveList()
    this.setDeleteModal(false);
  }

  toShowDeleteModal(item) {
    this.setState({ deleteKey: item });
    this.setDeleteModal(true);
  }
  setDeleteModal(type) {
    this.setState({isDeleteModalVisible: type});
    if (!type) this.setState({ deleteKey: '' });
  };

  uploadCheck(content, file) {
    let hash = {};
    let isFileRepeat = false;
    for (let i = 0, length = file.length; i < length; i ++) {
      if (hash[file[i]]) {
        isFileRepeat = true;
        break;
      }
      hash[file[i]] = true;
    }

    let includesArr = content.filter((x)=>{
      return file.includes(x)
    })
    return includesArr.length === 0 && !isFileRepeat;
  }

  renderAddAndSave() {

    return (
      <Fragment>
        {!this.state.isPopoverOpen && (
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.openAddEntry()}
            >
              新增
            </EuiButton>
          </EuiFlexItem>
        )}
      </Fragment>
    );
  }

  renderAdd() {
    const { addingValue, fileType } = this.state;

    return (
      <Fragment>
        {this.state.isPopoverOpen && (
          <div>
            <EuiText color="subdued">
              {fileType.prompt}
            </EuiText>
            <EuiSpacer size="l" />
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFieldText
                  fullWidth={true}
                  placeholder={fileType.addPlaceholder}
                  value={addingValue}
                  onChange={this.onChangeValue}
                  aria-label="当没有实际使用标签时，使用aria-label"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup>
                  <EuiFlexItem grow={false}>
                    <EuiButtonEmpty
                      iconType="plusInCircle"
                      isDisabled={!addingValue}
                      fill="true"
                      onClick={() => this.addItem()}
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
      </Fragment>
    );
  }

  renderTitle(name) {
    return (
      <Fragment>
        <EuiFlexItem grow={false}>
          <EuiTitle size="xs">
            <h4>{name}</h4>
          </EuiTitle>
        </EuiFlexItem>
      </Fragment>
    );
  }

  buildTableColumns(){
    const { fileType } = this.state;
    return [
      {
        field: 'id',
        name: fileType.columns,
        align: 'left',
        render: (value, item) => {
          if (this.state.editing === item.index) {
            return (
              <EuiFieldText
                placeholder="新的值"
                value={this.state.editingValue}
                onChange={this.onChangeEditingValue}
                aria-label="当没有实际使用标签时，使用aria-label"
              />
            );
          } else {
            return <span>{value}</span>;
          }
        }
      },
      {
        name: '操作',
        align: 'left',
        render: item => {
          if (this.state.editing === item.index) {
            return (
              <Fragment>
                <EuiToolTip position="top" content={'确认值'}>
                  <EuiButtonIcon
                    aria-label="确认值"
                    disabled={!this.state.editingValue}
                    iconType="check"
                    onClick={() => {
                      this.setEditedValue();
                    }}
                    color="primary"
                  />
                </EuiToolTip>
                <EuiToolTip position="top" content={'取消编辑'}>
                  <EuiButtonIcon
                    aria-label="取消编辑"
                    iconType="cross"
                    onClick={() => this.setState({ editing: false })}
                    color="danger"
                  />
                </EuiToolTip>
              </Fragment>
            );
          } else {
            return (
              <Fragment>
                <WzButtonPermissions
                  buttonType='icon'
                  aria-label="编辑内容"
                  iconType="pencil"
                  tooltip={{position: 'top', content: `编辑该ID`}}
                  onClick={() => {
                    this.setState({
                      editing: item.index,
                      editingValue: item.id
                    });
                  }}
                  color="primary"
                />
                <WzButtonPermissions
                  buttonType='icon'
                  aria-label="删除内容"
                  iconType="trash"
                  tooltip={{position: 'top', content: `删除该ID`}}
                  onClick={() => this.toShowDeleteModal(item.index)}
                  color="danger"
                />
              </Fragment>
            );
          }
        }
      }
    ];
  }

  render() {
    const { listInfo, isDeleteModalVisible } = this.state;
    const { name } = listInfo;

    const message = '没有结果...';

    let deleteModal;
    if (isDeleteModalVisible) {
      deleteModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该数据吗？"
            onCancel={() => this.setDeleteModal(false)}
            onConfirm={() => this.deleteItem()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    return (
      <div>
        <EuiSpacer size="m" />
        <EuiFlexGroup>
          <EuiFlexItem>
            {/* File name and back button when watching or editing a CDB list */}
            <EuiFlexGroup alignItems="center">
              {this.renderTitle(name)}
              <EuiFlexItem />
              {!this.state.editing &&
                this.renderAddAndSave()}
            </EuiFlexGroup>
            {/* CDB list table */}
            {this.renderAdd()}
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFlexGroup>
                  <EuiFlexItem style={{ marginTop: '30px' }}>
                    <EuiInMemoryTable
                      itemId="id"
                      items={this.state.items}
                      columns={this.buildTableColumns()}
                      pagination={{ pageSizeOptions: [10, 15] }}
                      message={message}
                      search={{ box: { incremental: true, placeholder: '过滤' } }}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        {deleteModal}
      </div>
    )
  }

}