import React, { Component } from 'react';
import { EuiPanel, EuiFlexGroup, EuiFlexItem, EuiToolTip, EuiButtonIcon, EuiTitle, EuiInMemoryTable, EuiFieldSearch } from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';

export class NodeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [],
            loading: false
        };
    }
    async componentDidMount() {
        this.search();
    }

    async search(searchTerm = false) {
        let params = {};
        if (searchTerm) {
            params.search = searchTerm;
        }
        this.setState({ loading: true });
        try{
            const request = await WzRequest.apiReq('GET', '/cluster/nodes', {params});
            this.setState({ nodes: (((request || {}).data || {}).data || {}).affected_items || [], loading: false });
        }catch(error){
            this.setState({ loading: false });
        }
    }

    render() {
        const columns = [
            {
                field: 'name',
                name: '名称',
                sortable: true,
                truncateText: true,
            },
            {
                field: 'version',
                name: '版本',
                sortable: true,
            },
            {
                field: 'ip',
                name: 'IP',
                sortable: true,
            },
            {
                field: 'type',
                name: '类型',
                sortable: true,
            }
        ];

        const sorting = {
            sort: {
                field: 'name',
                direction: 'asc',
            },
        };
        return (
            <EuiPanel>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiFlexGroup>
                            <EuiFlexItem grow={false} style={{ marginRight: 0 }}>
                                <EuiToolTip position="right" content={`返回组`}>
                                    <EuiButtonIcon
                                        aria-label="返回"
                                        style={{ paddingTop: 8 }}
                                        color="primary"
                                        iconSize="l"
                                        iconType="arrowLeft"
                                        onClick={() => this.props.goBack()}
                                    />
                                </EuiToolTip>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                                <EuiTitle>
                                    <h1>节点</h1>
                                </EuiTitle>
                            </EuiFlexItem>
                        </EuiFlexGroup>
                    </EuiFlexItem>
                </EuiFlexGroup>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiFieldSearch
                            placeholder="过滤节点..."
                            onSearch={e => this.search(e)}
                            isClearable={true}
                            fullWidth={true}
                            aria-label="过滤"
                        />
                    </EuiFlexItem>
                </EuiFlexGroup>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiInMemoryTable
                            items={this.state.nodes}
                            columns={columns}
                            pagination={true}
                            sorting={sorting}
                            loading={this.state.loading}
                        />
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiPanel>
        );
    }
};
