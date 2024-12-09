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

export class ExternalDevice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      isSaving: false,
      editing: false,
      isPopoverOpen: false,
      addingKey: '',
      addingValue: '',
      editingValue: '',
      newListName: '',
      fileType: {
        prompt: '配置设备ID和主机ID，主机ID配置为空时，该规则针对该组下所有主机生效。不可输入中文。',
        keyColumnLabel: '设备ID',
        valueColumnLabel: '主机ID',
      },
      isUploadLoading: false,
      isCluster: false,
      detailsItem: '',
      listInfo: {},
      deleteKey: '',
      isDeleteModalVisible: false,
      queryText: '',
    };
    this.items = [];
    this.fileUpload = React.createRef();
  }

  async componentDidMount() {
    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    this.setState({
      isCluster
    });

    this.setState({detailsItem: this.props.policyManageType});
    if (this.props.policyManageType) this.initData(this.props.policyManageType);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.selectView === 'devicesWhitelist' && prevProps.policyManageType !== this.props.policyManageType) {
      this.initData(this.props.policyManageType);
    }
  }

  async initData(detailsItem) {
    const result = await WzRequest.apiReq('GET', `/groups/${detailsItem}/files/usb_allowed/xml?pretty=true`, { });
    let res = result.data.length > 4 ? result.data.substring(1, result.data.length-1).split(', ') : [];
    res.length > 0 && res.forEach((k, i) => {
      res[i] = k.substring(1, k.length-1).replace(/\\\\/g, '\\')
    })
    const file = {
      name: `${detailsItem}组外设白名单`,
      content: res
    };
    this.items = res;
    const items = this.contentToArray(res);
    this.setState({ items, listInfo: file, detailsItem });
  }

  contentToArray(obj) {
    const items = [];
    obj.length > 0 && obj.forEach((k, i) => {
      items.push({ index: k.split('@')[0], ip: k.split('@')[1] ? k.split('@')[1] : '' });
    })
    return items;
  }

  contentToObject(content) {
    const items = {};
    const lines = content.split('\n');
    lines.forEach(line => {
      const split = line.split(':');
      const key = split[0];
      const value = split[1] || '';
      if (key) items[key] = value; // Prevent add empty keys
    });
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
      let raw = this.itemsToRaw();
      this.setState({ isSaving: true });
      const { isCluster, detailsItem } = this.state;
      await WzRequest.apiReq('PUT', isCluster ? '/cluster' + `/groups/${detailsItem}/usb_allowed` : `/groups/${detailsItem}/usb_allowed`, {
        body: raw.toString(),
        origin: 'raw'
      });
      this.showToast('success', '成功', '列表更新', 3000);
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

  onChangeKey = e => {
    this.setState({
      addingKey: e.target.value.replace(/[^\x00-\xff]/g, '')
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

  onNewListNameChange = e => {
    this.setState({
      newListName: e.target.value
    });
  };

  addItem() {
    const { addingKey, addingValue } = this.state;
    for (let i = 0, length = this.items.length; i < length; i ++) {
      if (this.items[i].split('@')[0] === addingKey) {
        this.showToast(
          'danger',
          '警告',
          <Fragment>
            <strong>{addingKey}</strong> 已经存在
          </Fragment>,
          3000
        );
        return;
      }
    }

    this.items.push(addingValue ? `${addingKey}@${addingValue}` : `${addingKey}`)
    const itemsArr = this.contentToArray(this.items);
    this.setState({
      items: itemsArr,
      addingKey: '',
      addingValue: ''
    });

    this.saveList()
  }

  setEditedValue() {
    const { editingValue, editing } = this.state;
    let isChange = true;
    for (let i = 0, length = this.items.length; i < length; i ++) {
      if (this.items[i].split('@')[0] === editing) {
        if (this.items[i].split('@').length === 1 && !editingValue) {
          isChange = false
        }
        else if (this.items[i].split('@').length === 2 && this.items[i].split('@')[1] === editingValue) {
          isChange = false
        }
        else {
          this.items[i] = editingValue ? `${editing}@${editingValue}` : `${editing}`
        }
      }
    }

    if (!isChange) {
      this.setState({
        editing: false,
        editingValue: '',
        generatingCsv: false
      });
    }
    else {
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
    let itemIndex = this.items.findIndex(k => k.split('@')[0] === deleteKey);
    this.items.splice(itemIndex, 1)
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

  renderAddAndSave() {
    const saveButton = (
      // <WzButtonPermissions
      //   // permissions={this.getUpdatePermissions(name)}
      //   fill
      //   // isDisabled={items.length === 0}
      //   iconType="save"
      //   isLoading={this.state.isSaving}
      //   onClick={async () => this.saveList()}
      // >
      //   保存
      // </WzButtonPermissions>
      <EuiButton
        size="s"
        isLoading={this.state.isSaving}
        onClick={async () => this.saveList()}
      >
        保存
      </EuiButton>
    );

    return (
      <Fragment>
        {!this.state.isPopoverOpen && (
          <EuiFlexItem grow={false}>
            {/* <WzButtonPermissions
              // permissions={this.getUpdatePermissions(name)}
              iconType="plusInCircle"
              onClick={() => this.openAddEntry()}
            >
              添加新条目
            </WzButtonPermissions> */}
            <EuiButton
              size="s"
              onClick={() => this.openAddEntry()}
            >
              新增
            </EuiButton>
          </EuiFlexItem>
        )}
        {/* Save button */}
        {/* <EuiFlexItem grow={false}>{saveButton}</EuiFlexItem> */}
      </Fragment>
    );
  }

  renderAdd() {
    const { addingKey, addingValue, fileType } = this.state;

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
                  placeholder={fileType.keyColumnLabel}
                  value={addingKey}
                  onChange={this.onChangeKey}
                  aria-label="当没有实际使用标签时，使用aria-label"
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFieldText
                  fullWidth={true}
                  placeholder={fileType.valueColumnLabel}
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
                      isDisabled={!addingKey}
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
        field: 'index',
        name: fileType.keyColumnLabel,
        align: 'left',
        sortable: true
      },
      {
        field: 'ip',
        name: fileType.valueColumnLabel,
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
                    // disabled={!this.state.editingValue}
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
                  // permissions={this.getUpdatePermissions(fileName)}
                  tooltip={{position: 'top', content: `编辑该ID`}}
                  onClick={() => {
                    this.setState({
                      editing: item.index,
                      editingValue: item.ip
                    });
                  }}
                  color="primary"
                />
                <WzButtonPermissions
                  buttonType='icon'
                  aria-label="删除内容"
                  iconType="trash"
                  // permissions={this.getDeletePermissions(fileName)}
                  tooltip={{position: 'top', content: `删除该ID`}}
                  // onClick={() => this.deleteItem(item.index)}
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

  filterItems() {
    const { items, queryText } = this.state;
    let res = items.filter(k => k.index.includes(queryText) || k.ip.includes(queryText))
    return res
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
                      itemId="index"
                      items={this.filterItems()}
                      columns={this.buildTableColumns()}
                      pagination={{ pageSizeOptions: [10, 15] }}
                      message={message}
                      search={{ box: { incremental: true, placeholder: '过滤' }, onChange: (arg) => {
                        this.setState({ queryText: arg.queryText })
                        // return true;
                      } }}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        {deleteModal}
      </div>
    );
  }

}