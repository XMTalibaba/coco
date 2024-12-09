import React, { Component } from 'react';
import { RulesetHandler } from '../../management/components/management/ruleset/utils/ruleset-handler';
import { WzListEditor } from './list-editor';
import { updateListContent } from '../../../redux/actions/rulesetActions';
import { WzRequest } from '../../../react-services/wz-request';
import store from '../../../redux/store';

export class CDBList extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      listInfo: {},
      clusterStatus: {
        contextConfigServer: 'manager',
        status: false
      },
      editList: React.createRef(),
      fileUrl: {
        'brute_force': `/groups/default/files/brute_force_black/xml?pretty=true`,
        'sql_attack': `/groups/default/files/sql_attack_black/xml?pretty=true`,
        'shellshock': `/groups/default/files/shellshock_black/xml?pretty=true`,
      }
    }
    this.rulesetHandler = new RulesetHandler('lists');
  }

  async componentDidMount() {
    this._isMount = true;
    const { fileUrl } = this.state;
    const { filename } = this.props;

    let res = [];
    if (fileUrl[filename]) {
      const result = await WzRequest.apiReq('GET', fileUrl[filename], {});
      res = result.data.length > 4 ? result.data.substring(1, result.data.length-1).split(', ') : [];
      res.length > 0 && res.forEach((k, i) => {
        res[i] = k.substring(1, k.length-1).replace(/\\\\/g, '\\')
      })
    }

    const file = {
      name: filename,
      content: res,
    };
    store.dispatch(updateListContent(file));
    this.setState({ listInfo: file });
  }

  render() {
    const {
      listInfo,
      clusterStatus,
      editList,
    } = this.state;
    return (
      <div style={{ margin: '8px 0' }}>
        { listInfo.content && 
          <WzListEditor clusterStatus={clusterStatus} listInfo={listInfo} ref={editList} toSavePlan={(list) => this.props.toSavePlan(list)} />
        }
      </div>
    )
  }
}
