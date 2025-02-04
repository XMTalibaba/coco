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
    EuiComboBox
} from '@elastic/eui';

import { WzRequest } from '../../../react-services/wz-request';
import { ErrorHandler } from '../../../react-services/error-handler';



export const CreateRole = ({ closeFlyout }) => {
    const [policies, setPolicies] = useState([]);
    const [roleName, setRoleName] = useState('');
    const [roleNameError, setRoleNameError] = useState(false);
    const [selectedPolicies, setSelectedPolicies] = useState([]);
    const [selectedPoliciesError, setSelectedPoliciesError] = useState(false);

    async function getData() {
        const policies_request = await WzRequest.apiReq(
            'GET',
            '/security/policies',
            {}
        );
        const policies = ((((policies_request || {}).data || {}).data || {}).affected_items || [])
            .map(x => { return { 'label': x.name, id: x.id} });
        setPolicies(policies);
    }

    useEffect(() => {
        getData();
    }, []);



    const createUser = async () => {
        if (!roleName) {
            setRoleNameError(true);
            return;
        } else if (roleNameError) {
            setRoleNameError(false);
        }
        if (!selectedPolicies.length) {
            setSelectedPoliciesError(true);
            return;
        } else if (selectedPoliciesError) {
            setSelectedPoliciesError(false);
        }
        
        try {
            const result = await WzRequest.apiReq(
                'POST',
                '/security/roles',
                {
                    "name": roleName
                }
            );
            const data = (result.data || {}).data;
            if(data.failed_items && data.failed_items.length){
                return;
            }
            let roleId = "";
            if(data.affected_items && data.affected_items){
                roleId = data.affected_items[0].id;
            }
            const policiesId = selectedPolicies.map(policy => {
                return policy.id;
            })
            const policyResult = await WzRequest.apiReq(
                'POST',
                `/security/roles/${roleId}/policies`,
                {
                    params:{
                       policy_ids: policiesId.toString()
                    }  
                }
            );
            
            const policiesData = (policyResult.data || {}).data;
            if(policiesData.failed_items && policiesData.failed_items.length){
                return;
            }
            ErrorHandler.info('使用所选策略已成功创建角色');

        } catch (error) {
            ErrorHandler.handle(error, "有一个错误");
        }
        closeFlyout(false)
    }


    const onChangeRoleName = e => {
        setRoleName(e.target.value);
    };


    const onChangePolicies = selectedPolicies => {
        setSelectedPolicies(selectedPolicies);
    };


    return (
        <EuiFlyout className="wzApp"
            onClose={() => closeFlyout(false)}>
            <EuiFlyoutHeader hasBorder={false}>
                <EuiTitle size="m">
                    <h2>新角色</h2>
                </EuiTitle>
            </EuiFlyoutHeader>
            <EuiFlyoutBody><EuiForm component="form" style={{ padding: 24 }}>

                <EuiFormRow label="角色名称"
                    isInvalid={roleNameError}
                    error={'请提供角色名称'}
                    helpText="为这个新角色介绍一个名字。">
                    <EuiFieldText
                        placeholder=""
                        value={roleName}
                        onChange={e => onChangeRoleName(e)}
                        aria-label=""
                    />
                </EuiFormRow>
                <EuiFormRow label="策略"
                    isInvalid={selectedPoliciesError}
                    error={'至少选择一个策略。'}
                    helpText="为角色分配策略。">
                    <EuiComboBox
                        placeholder="选择策略"
                        options={policies}
                        selectedOptions={selectedPolicies}
                        onChange={onChangePolicies}
                        isClearable={true}
                        data-test-subj="demoComboBox"
                    />
                </EuiFormRow>
                <EuiSpacer />
                <EuiButton fill onClick={createUser}>
                    创建角色
                </EuiButton>
            </EuiForm>
            </EuiFlyoutBody>
        </EuiFlyout>

    )
};