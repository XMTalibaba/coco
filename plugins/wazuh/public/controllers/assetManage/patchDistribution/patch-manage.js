import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
  EuiBasicTable,
  EuiSpacer,
  EuiToolTip,
  EuiFilePicker,
  EuiInMemoryTable,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiProgress,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import '../../hostProtection/blackWhiteList/blackWhiteList.scss';

export class PatchManage extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      totalItems: 0,
      listItems: [],
      isLoading:false,
      isUploadLoading: false,
      delFile: '',
      isDelModalVisible: false
    }
    this.fileUpload = React.createRef();
  }

  async componentDidMount() {
    this._isMount = true;
    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });

      const rawItems = await WzRequest.apiReq( 'GET', `/manager/uploadfile?pretty=true`, {} );
      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data || {}

      this._isMount &&
        this.setState({
          listItems: affected_items,
          totalItems: total_affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
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

  columns() {
    return [
      {
        field: 'name',
        name: '名称',
      },
      {
        field: 'size',
        name: '大小',
      },
      {
        field: 'ctime',
        name: '上传时间',
      },
      {
        align: 'right',
        name: '操作',
        render: file => this.actionButtonsRender(file)
      }
    ]
  }

  actionButtonsRender(file) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content={'删除补丁'}
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDelModal(file);
            }}
            iconType="trash"
            color={'danger'}
            aria-label="删除补丁"
          />
        </EuiToolTip>
      </div>
    );
  }

  toShowDelModal(file) {
    this.setState({ delFile: file.name });
    this.setDelModal(true);
  }

  setDelModal(flag) {
    this.setState({isDelModalVisible: flag});
    if (!flag) this.setState({ delFile: '', isDelModalVisible: false });
  }

  async toDelFile() {
    try {
      const { delFile } = this.state;
      const rawItems = await WzRequest.apiReq('DELETE', `/manager/uploadfile?pretty=true&uploadfilename=${encodeURIComponent(delFile)}`, {});
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      if (total_affected_items === 1) {
        this.getItems();
        this.showToast(
          'success',
          '成功',
          '删除补丁成功',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '删除补丁失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '删除补丁失败: ' + error,
        3000
      );
    }
    this.setDelModal(false)
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
        itemId="id"
        items={listItems}
        loading={isLoading}
        columns={columns}
        pagination={{ pageSizeOptions: [10, 15] }}
        sorting={true}
        message={message}
        search={{ box: { incremental: true, placeholder: '过滤' }}}
      />
    )
  }

  fileSlice(file, piece = 1024 * 1023) {
    let totalSize = file.length; // 文件总大小
    let start = 0; // 每次上传的开始字节
    let end = start + piece; // 每次上传的结尾字节
    let chunks = []
    while (start < totalSize) {
      // 根据长度截取每次需要上传的数据
      // File对象继承自Blob对象，因此包含slice方法
      let item = file.slice(start, end); 
      chunks.push(item)

      start = end;
      end = start + piece;
    }
    return chunks
  }

  async onFilesChange(files) {
    if (files.length !== 0) {
      this.setState({ isUploadLoading: true });
      let file = files[0];
      if (file.size === 0) {
        this.showToast(
          'danger',
          '警告',
          '文件上传失败: 不可上传空的补丁文件',
          3000
        );
        this.fileUpload.current.fileInput.value = '';
        this.fileUpload.current.fileInput.blur();
        this.fileUpload.current.handleChange();
        this.setState({ isUploadLoading: false });
        return;
      }
      if (file.size >= 1024 * 1024 * 240) {
        this.showToast(
          'danger',
          '警告',
          '文件上传失败: 补丁文件大小不可超过240M',
          3000
        );
        this.fileUpload.current.fileInput.value = '';
        this.fileUpload.current.fileInput.blur();
        this.fileUpload.current.handleChange();
        this.setState({ isUploadLoading: false });
        return;
      }
      let reader = new FileReader();
      reader.onload = async () => {
        let fileSliceArr = this.fileSlice(reader.result);
        try {
          const seqnum = Math.random().toString(36).slice(-8)
          for (let i = 0, length = fileSliceArr.length; i < length; i ++) {
            let fileItem = fileSliceArr[i];
            let isend = '';
            if (length === 1) {
              isend = 'one';
            }
            else if (i === 0) {
              isend = 'start';
            }
            else if (i + 1 === length) {
              isend = 'end';
            }
            else {
              isend = 'middle';
            }
            await WzRequest.apiReq( 'PUT', `/manager/uploadfile?pretty=true&uploadfilename=${encodeURIComponent(file.name)}&isend=${isend}&seqnum=${seqnum}`, {
              body: fileItem,
              origin: "raw"
            });
          }

          this.showToast('success', '成功', '文件上传成功', 3000);
          this.getItems();
          
        } catch (error) {
          this.showToast(
            'danger',
            '警告',
            '文件上传失败: ' + error,
            3000
          );
        }
        this.fileUpload.current.fileInput.value = '';
        this.fileUpload.current.fileInput.blur();
        this.fileUpload.current.handleChange();
        this.setState({ isUploadLoading: false });
      }
      // reader.readAsText(file); // 读取为文本
      reader.readAsDataURL(file); // 读取为dataurl(base64)

    }
  }

  headRender() {
    const { isUploadLoading, totalItems } = this.state;
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>补丁列表 ({totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <div className="custom_input_file_box_blackWhite">
              <EuiFilePicker
                className="euiFileUpload"
                onChange={(files) => this.onFilesChange(files)}
                display={'default'}
                initialPromptText="补丁上传"
                ref={this.fileUpload}
                disabled={isUploadLoading}
              />
              <div className="euiButton euiButton--primary euiButton--small">
                <span className="euiButtonContent euiButton__content">
                  {/* <EuiIcon type="exportAction" color="#006BB4" /> */}
                  <span className="euiButton__text">补丁上传</span>
                </span>
                
              </div>
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
        <div style={ isUploadLoading ? { padding: '5px 0'} : { padding: '6px 0' }}>
          { isUploadLoading && (
          <EuiProgress size="xs" color="primary" />
          )}
        </div>
      </div>
    );
  }

  render() {
    const { isDelModalVisible } = this.state;
    const head = this.headRender();
    const table = this.tableRender();
    let delModal;
    if (isDelModalVisible) {
      delModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该补丁吗？"
            onCancel={() => this.setDelModal(false)}
            onConfirm={() => this.toDelFile()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    return (
      <EuiPage>
        <EuiPanel>
          {head}
          {table}
        </EuiPanel>
        {delModal}
      </EuiPage>
    )
  }

}