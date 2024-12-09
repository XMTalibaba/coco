import React, { useState, useEffect } from 'react';
import {
    EuiButton,
    EuiTitle,
    EuiFlyout,
    EuiFlyoutHeader,
    EuiFlyoutBody,
    EuiForm,
    EuiFieldText,
    EuiFormRow,
    EuiSpacer,
    EuiFlexGroup,
    EuiFlexItem,
    EuiBadge,
    EuiComboBox,
} from '@elastic/eui';

import { WzRequest } from '../../../react-services/wz-request';
import { ErrorHandler } from '../../../react-services/error-handler';
import { EditRolesTable } from './edit-role-table';

const reservedRoles = ['administrator', 'readonly', 'users_admin', 'agents_readonly', 'agents_admin', 'cluster_readonly', 'cluster_admin'];


export const EditRole = ({ role, closeFlyout }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentRole, setCurrentRole] = useState({});
    const [isReserved, setIsReserved] = useState(reservedRoles.includes(role.name))
    const [policies, setPolicies] = useState([]);
    const [selectedPolicies, setSelectedPolicies] = useState([]);
    const [selectedPoliciesError, setSelectedPoliciesError] = useState(false);
    const [assignedPolicies, setAssignedPolicies] = useState([]);

    async function getData() {
        try{
            setIsLoading(true);
            const roleDataResponse = await WzRequest.apiReq(
                'GET',
                '/security/roles',            
                {
                    params: {
                        role_ids: role.id
                    }
                }
            );
            const roleData = (((roleDataResponse.data || {}).data || {}).affected_items || [])[0];
            setCurrentRole(roleData);
            const policies_request = await WzRequest.apiReq(
                'GET',
                '/security/policies',
                {}
            );
            const selectedPoliciesCopy = [];
            const policies = ((((policies_request || {}).data || {}).data || {}).affected_items || [])
                .map(x => {
                    const currentPolicy = { 'label': x.name, id: x.id, roles: x.roles, policy: x.policy };
                    if (roleData.policies.includes(x.id)) {
                        selectedPoliciesCopy.push(currentPolicy);
                        return false;
                    } else {
                        return currentPolicy
                    }
                });
            const filteredPolicies = policies.filter(item => item !== false);
            setAssignedPolicies(selectedPoliciesCopy)
            setPolicies(filteredPolicies);
        }catch(error){
            ErrorHandler.handle( error, 'Error');
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getData();
    }, []);



    const addPolicy = async () => {
        if (!selectedPolicies.length) {
            setSelectedPoliciesError(true);
            return;
        } else if (selectedPoliciesError) {
            setSelectedPoliciesError(false);
        }

        try {
            let roleId = currentRole.id;

            const policiesId = selectedPolicies.map(policy => {
                return policy.id;
            })
            const policyResult = await WzRequest.apiReq(
                'POST',
                `/security/roles/${roleId}/policies`,
                {
                    params: {
                        policy_ids: policiesId.toString()
                    }
                }
            );

            const policiesData = (policyResult.data || {}).data;
            if (policiesData.failed_items && policiesData.failed_items.length) {
                return;
            }
            ErrorHandler.info('使用所选策略已成功更新角色');
            setSelectedPolicies([])
            await update();
        } catch (error) {
            ErrorHandler.handle(error, "有一个错误");
        }
    }

    const update = async() => {
        await getData();
    }


    const onChangePolicies = selectedPolicies => {
        setSelectedPolicies(selectedPolicies);
    };


    return (
        <EuiFlyout className="wzApp"
            onClose={() => closeFlyout(false)}>
            <EuiFlyoutHeader hasBorder={false}>
                <EuiTitle size="m">
                    <h2>
                        编辑 {role.name} 角色 &nbsp;
                        {isReserved &&
                            <EuiBadge color='primary'>保留</EuiBadge>
                        }
                    </h2>
                </EuiTitle>
            </EuiFlyoutHeader>
            <EuiFlyoutBody><EuiForm component="form" style={{ padding: 24 }}>
                <EuiFlexGroup>
                    <EuiFlexItem grow={true}>
                        <EuiFormRow label="策略"
                            isInvalid={selectedPoliciesError}
                            error={'至少选择一个策略。'}
                            helpText="为角色分配策略。">
                            <EuiComboBox
                                placeholder="选择策略"
                                options={policies}
                                isDisabled={isReserved}
                                selectedOptions={selectedPolicies}
                                onChange={onChangePolicies}
                                isClearable={true}
                                data-test-subj="demoComboBox"
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                    <EuiFlexItem grow={true}>
                        <EuiButton style={{ marginTop: 20, maxWidth: 45 }} isDisabled={isReserved} fill onClick={addPolicy}>
                            添加策略
                    </EuiButton>

                    </EuiFlexItem>
                </EuiFlexGroup>


                <EuiSpacer />
            </EuiForm>
                <div style={{ margin: 20 }}>
                    <EditRolesTable policies={assignedPolicies} role={currentRole} onChange={update} isDisabled={isReserved} loading={isLoading}/>
                </div>
            </EuiFlyoutBody>
        </EuiFlyout>

    )
};