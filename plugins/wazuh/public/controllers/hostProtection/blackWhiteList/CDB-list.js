import React, { Component } from 'react';
import { RulesetHandler } from '../../management/components/management/ruleset/utils/ruleset-handler';
import { WzListEditor } from './list-editor';
import { updateListContent } from '../../../redux/actions/rulesetActions';
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
      }
    }
    this.rulesetHandler = new RulesetHandler('lists');
  }

  async componentDidMount() {
    this._isMount = true;
    const result = await this.rulesetHandler.getFileContent(this.props.filename);
    const file = {
      name: this.props.filename,
      content: result ? result : '\n',
      path: 'etc/lists',
    };
    store.dispatch(updateListContent(file));
    this.setState({ listInfo: file });
  }

  render() {
    const {
      listInfo,
      clusterStatus,
    } = this.state;
    return (
      <>
        { listInfo.content && 
          <WzListEditor clusterStatus={clusterStatus} listInfo={listInfo} />
        }
      </>
    )
  }
}
