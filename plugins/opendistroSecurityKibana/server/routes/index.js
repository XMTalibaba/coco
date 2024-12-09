"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defineRoutes = defineRoutes;

var _configSchema = require("@kbn/config-schema");

var _common = require("../../common");

/*
 *   Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License").
 *   You may not use this file except in compliance with the License.
 *   A copy of the License is located at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   or in the "license" file accompanying this file. This file is distributed
 *   on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 *   express or implied. See the License for the specific language governing
 *   permissions and limitations under the License.
 */
// TODO: consider to extract entity CRUD operations and put it into a client class
function defineRoutes(router) {
  const internalUserSchema = _configSchema.schema.object({
    description: _configSchema.schema.maybe(_configSchema.schema.string()),
    password: _configSchema.schema.maybe(_configSchema.schema.string()),
    backend_roles: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
      defaultValue: []
    }),
    attributes: _configSchema.schema.any({
      defaultValue: {}
    })
  });

  const actionGroupSchema = _configSchema.schema.object({
    description: _configSchema.schema.maybe(_configSchema.schema.string()),
    allowed_actions: _configSchema.schema.arrayOf(_configSchema.schema.string()) // type field is not supported in legacy implementation, comment it out for now.
    // type: schema.oneOf([
    //   schema.literal('cluster'),
    //   schema.literal('index'),
    //   schema.literal('kibana'),
    // ]),

  });

  const roleMappingSchema = _configSchema.schema.object({
    description: _configSchema.schema.maybe(_configSchema.schema.string()),
    backend_roles: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
      defaultValue: []
    }),
    hosts: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
      defaultValue: []
    }),
    users: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
      defaultValue: []
    })
  });

  const roleSchema = _configSchema.schema.object({
    description: _configSchema.schema.maybe(_configSchema.schema.string()),
    cluster_permissions: _configSchema.schema.arrayOf(_configSchema.schema.string(), {
      defaultValue: []
    }),
    tenant_permissions: _configSchema.schema.arrayOf(_configSchema.schema.any(), {
      defaultValue: []
    }),
    index_permissions: _configSchema.schema.arrayOf(_configSchema.schema.any(), {
      defaultValue: []
    })
  });

  const tenantSchema = _configSchema.schema.object({
    description: _configSchema.schema.string()
  });

  const accountSchema = _configSchema.schema.object({
    password: _configSchema.schema.string(),
    current_password: _configSchema.schema.string()
  });

  const schemaMap = {
    internalusers: internalUserSchema,
    actiongroups: actionGroupSchema,
    rolesmapping: roleMappingSchema,
    roles: roleSchema,
    tenants: tenantSchema,
    account: accountSchema
  };

  function validateRequestBody(resourceName, requestBody) {
    const inputSchema = schemaMap[resourceName];

    if (!inputSchema) {
      throw new Error(`Unknown resource ${resourceName}`);
    }

    inputSchema.validate(requestBody); // throws error if validation fail
  }

  function validateEntityId(resourceName) {
    if (!(0, _common.isValidResourceName)(resourceName)) {
      return 'Invalid entity name or id.';
    }
  }
  /**
   * Lists resources by resource name.
   *
   * The response format is:
   * {
   *   "total": <total_entity_count>,
   *   "data": {
   *     "entity_id_1": { <entity_structure> },
   *     "entity_id_2": { <entity_structure> },
   *     ...
   *   }
   * }
   *
   * e.g. when listing internal users, response may look like:
   * {
   *   "total": 2,
   *   "data": {
   *     "api_test_user2": {
   *       "hash": "",
   *       "reserved": false,
   *       "hidden": false,
   *       "backend_roles": [],
   *       "attributes": {},
   *       "description": "",
   *       "static": false
   *     },
   *     "api_test_user1": {
   *       "hash": "",
   *       "reserved": false,
   *       "hidden": false,
   *       "backend_roles": [],
   *       "attributes": {},
   *       "static": false
   *     }
   * }
   *
   * when listing action groups, response will look like:
   * {
   *   "total": 2,
   *   "data": {
   *     "read": {
   *       "reserved": true,
   *       "hidden": false,
   *       "allowed_actions": ["indices:data/read*", "indices:admin/mappings/fields/get*"],
   *       "type": "index",
   *       "description": "Allow all read operations",
   *       "static": false
   *     },
   *     "cluster_all": {
   *       "reserved": true,
   *       "hidden": false,
   *       "allowed_actions": ["cluster:*"],
   *       "type": "cluster",
   *       "description": "Allow everything on cluster level",
   *       "static": false
   *     }
   * }
   *
   * role:
   * {
   *   "total": 2,
   *   "data": {
   *     "kibana_user": {
   *       "reserved": true,
   *       "hidden": false,
   *       "description": "Provide the minimum permissions for a kibana user",
   *       "cluster_permissions": ["cluster_composite_ops"],
   *       "index_permissions": [{
   *         "index_patterns": [".kibana", ".kibana-6", ".kibana_*"],
   *         "fls": [],
   *         "masked_fields": [],
   *         "allowed_actions": ["read", "delete", "manage", "index"]
   *       }, {
   *         "index_patterns": [".tasks", ".management-beats"],
   *         "fls": [],
   *         "masked_fields": [],
   *         "allowed_actions": ["indices_all"]
   *       }],
   *       "tenant_permissions": [],
   *       "static": false
   *     },
   *     "all_access": {
   *       "reserved": true,
   *       "hidden": false,
   *       "description": "Allow full access to all indices and all cluster APIs",
   *       "cluster_permissions": ["*"],
   *       "index_permissions": [{
   *         "index_patterns": ["*"],
   *         "fls": [],
   *         "masked_fields": [],
   *         "allowed_actions": ["*"]
   *       }],
   *       "tenant_permissions": [{
   *         "tenant_patterns": ["*"],
   *         "allowed_actions": ["kibana_all_write"]
   *       }],
   *       "static": false
   *     }
   *   }
   * }
   *
   * rolesmapping:
   * {
   *   "total": 2,
   *   "data": {
   *     "security_manager": {
   *       "reserved": false,
   *       "hidden": false,
   *       "backend_roles": [],
   *       "hosts": [],
   *       "users": ["zengyan", "admin"],
   *       "and_backend_roles": []
   *     },
   *     "all_access": {
   *       "reserved": false,
   *       "hidden": false,
   *       "backend_roles": [],
   *       "hosts": [],
   *       "users": ["zengyan", "admin", "indextest"],
   *       "and_backend_roles": []
   *     }
   *   }
   * }
   *
   * tenants:
   * {
   *   "total": 2,
   *   "data": {
   *     "global_tenant": {
   *       "reserved": true,
   *       "hidden": false,
   *       "description": "Global tenant",
   *       "static": false
   *     },
   *     "test tenant": {
   *       "reserved": false,
   *       "hidden": false,
   *       "description": "tenant description",
   *       "static": false
   *     }
   *   }
   * }
   */


  router.get({
    path: `${_common.API_PREFIX}/${_common.CONFIGURATION_API_PREFIX}/{resourceName}`,
    validate: {
      params: _configSchema.schema.object({
        resourceName: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);
    let esResp;

    try {
      esResp = await client.callAsCurrentUser('opendistro_security.listResource', {
        resourceName: request.params.resourceName
      });
      return response.ok({
        body: {
          total: Object.keys(esResp).length,
          data: esResp
        }
      });
    } catch (error) {
      console.log(JSON.stringify(error));
      return errorResponse(response, error);
    }
  });
  /**
   * Gets entity by id.
   *
   * the response format differs from different resource types. e.g.
   *
   * for internal user, response will look like:
   * {
   *   "hash": "",
   *   "reserved": false,
   *   "hidden": false,
   *   "backend_roles": [],
   *   "attributes": {},
   *   "static": false
   * }
   *
   * for role, response will look like:
   * {
   *   "reserved": true,
   *   "hidden": false,
   *   "description": "Allow full access to all indices and all cluster APIs",
   *   "cluster_permissions": ["*"],
   *   "index_permissions": [{
   *     "index_patterns": ["*"],
   *     "fls": [],
   *     "masked_fields": [],
   *     "allowed_actions": ["*"]
   *   }],
   *   "tenant_permissions": [{
   *     "tenant_patterns": ["*"],
   *     "allowed_actions": ["kibana_all_write"]
   *   }],
   *   "static": false
   * }
   *
   * for roles mapping, response will look like:
   * {
   *   "reserved": true,
   *   "hidden": false,
   *   "description": "Allow full access to all indices and all cluster APIs",
   *   "cluster_permissions": ["*"],
   *   "index_permissions": [{
   *     "index_patterns": ["*"],
   *     "fls": [],
   *     "masked_fields": [],
   *     "allowed_actions": ["*"]
   *   }],
   *   "tenant_permissions": [{
   *     "tenant_patterns": ["*"],
   *     "allowed_actions": ["kibana_all_write"]
   *   }],
   *   "static": false
   * }
   *
   * for action groups, response will look like:
   * {
   *   "reserved": true,
   *   "hidden": false,
   *   "allowed_actions": ["indices:data/read*", "indices:admin/mappings/fields/get*"],
   *   "type": "index",
   *   "description": "Allow all read operations",
   *   "static": false
   * }
   *
   * for tenant, response will look like:
   * {
   *   "reserved": true,
   *   "hidden": false,
   *   "description": "Global tenant",
   *   "static": false
   * },
   */

  router.get({
    path: `${_common.API_PREFIX}/${_common.CONFIGURATION_API_PREFIX}/{resourceName}/{id}`,
    validate: {
      params: _configSchema.schema.object({
        resourceName: _configSchema.schema.string(),
        id: _configSchema.schema.string()
      })
    }
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);
    let esResp;

    try {
      esResp = await client.callAsCurrentUser('opendistro_security.getResource', {
        resourceName: request.params.resourceName,
        id: request.params.id
      });
      return response.ok({
        body: esResp[request.params.id]
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Deletes an entity by id.
   */

  router.delete({
    path: `${_common.API_PREFIX}/${_common.CONFIGURATION_API_PREFIX}/{resourceName}/{id}`,
    validate: {
      params: _configSchema.schema.object({
        resourceName: _configSchema.schema.string(),
        id: _configSchema.schema.string({
          minLength: 1
        })
      })
    }
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);
    let esResp;

    try {
      esResp = await client.callAsCurrentUser('opendistro_security.deleteResource', {
        resourceName: request.params.resourceName,
        id: request.params.id
      });
      return response.ok({
        body: {
          message: esResp.message
        }
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Update object with out Id. Resource identification is expected to computed from headers. Eg: auth headers
   *
   * Request sample:
   * /configuration/account
   * {
   *   "password": "new-password",
   *   "current_password": "old-password"
   * }
   */

  router.post({
    path: `${_common.API_PREFIX}/${_common.CONFIGURATION_API_PREFIX}/{resourceName}`,
    validate: {
      params: _configSchema.schema.object({
        resourceName: _configSchema.schema.string()
      }),
      body: _configSchema.schema.any()
    }
  }, async (context, request, response) => {
    try {
      validateRequestBody(request.params.resourceName, request.body);
    } catch (error) {
      return response.badRequest({
        body: error
      });
    }

    const client = context.security_plugin.esClient.asScoped(request);
    let esResp;

    try {
      esResp = await client.callAsCurrentUser('opendistro_security.saveResourceWithoutId', {
        resourceName: request.params.resourceName,
        body: request.body
      });
      return response.ok({
        body: {
          message: esResp.message
        }
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Update entity by Id.
   */

  router.post({
    path: `${_common.API_PREFIX}/${_common.CONFIGURATION_API_PREFIX}/{resourceName}/{id}`,
    validate: {
      params: _configSchema.schema.object({
        resourceName: _configSchema.schema.string(),
        id: _configSchema.schema.string({
          validate: validateEntityId
        })
      }),
      body: _configSchema.schema.any()
    }
  }, async (context, request, response) => {
    try {
      validateRequestBody(request.params.resourceName, request.body);
    } catch (error) {
      return response.badRequest({
        body: error
      });
    }

    const client = context.security_plugin.esClient.asScoped(request);
    let esResp;

    try {
      esResp = await client.callAsCurrentUser('opendistro_security.saveResource', {
        resourceName: request.params.resourceName,
        id: request.params.id,
        body: request.body
      });
      return response.ok({
        body: {
          message: esResp.message
        }
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Gets authentication info of the user.
   *
   * The response looks like:
   * {
   *   "user": "User [name=admin, roles=[], requestedTenant=__user__]",
   *   "user_name": "admin",
   *   "user_requested_tenant": "__user__",
   *   "remote_address": "127.0.0.1:35044",
   *   "backend_roles": [],
   *   "custom_attribute_names": [],
   *   "roles": ["all_access", "security_manager"],
   *   "tenants": {
   *     "another_tenant": true,
   *     "admin": true,
   *     "global_tenant": true,
   *     "aaaaa": true,
   *     "test tenant": true
   *   },
   *   "principal": null,
   *   "peer_certificates": "0",
   *   "sso_logout_url": null
   * }
   */

  router.get({
    path: `${_common.API_PREFIX}/auth/authinfo`,
    validate: false
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);
    let esResp;

    try {
      esResp = await client.callAsCurrentUser('opendistro_security.authinfo');
      return response.ok({
        body: esResp
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Gets audit log configuration。
   *
   * Sample payload:
   * {
   *   "enabled":true,
   *   "audit":{
   *     "enable_rest":false,
   *     "disabled_rest_categories":[
   *       "FAILED_LOGIN",
   *       "AUTHENTICATED"
   *     ],
   *     "enable_transport":true,
   *     "disabled_transport_categories":[
   *       "GRANTED_PRIVILEGES"
   *     ],
   *     "resolve_bulk_requests":true,
   *     "log_request_body":false,
   *     "resolve_indices":true,
   *     "exclude_sensitive_headers":true,
   *     "ignore_users":[
   *       "admin",
   *     ],
   *     "ignore_requests":[
   *       "SearchRequest",
   *       "indices:data/read/*"
   *     ]
   *   },
   *   "compliance":{
   *     "enabled":true,
   *     "internal_config":false,
   *     "external_config":false,
   *     "read_metadata_only":false,
   *     "read_watched_fields":{
   *       "indexName1":[
   *         "field1",
   *         "fields-*"
   *       ]
   *     },
   *     "read_ignore_users":[
   *       "kibanaserver",
   *       "operator/*"
   *     ],
   *     "write_metadata_only":false,
   *     "write_log_diffs":false,
   *     "write_watched_indices":[
   *       "indexName2",
   *       "indexPatterns-*"
   *     ],
   *     "write_ignore_users":[
   *       "admin"
   *     ]
   *   }
   * }
   */

  router.get({
    path: `${_common.API_PREFIX}/configuration/audit`,
    validate: false
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);
    let esResp;

    try {
      esResp = await client.callAsCurrentUser('opendistro_security.getAudit');
      return response.ok({
        body: esResp
      });
    } catch (error) {
      return response.custom({
        statusCode: error.statusCode,
        body: parseEsErrorResponse(error)
      });
    }
  });
  /**
   * Update audit log configuration。
   *
   * Sample payload:
   * {
   *   "enabled":true,
   *   "audit":{
   *     "enable_rest":false,
   *     "disabled_rest_categories":[
   *       "FAILED_LOGIN",
   *       "AUTHENTICATED"
   *     ],
   *     "enable_transport":true,
   *     "disabled_transport_categories":[
   *       "GRANTED_PRIVILEGES"
   *     ],
   *     "resolve_bulk_requests":true,
   *     "log_request_body":false,
   *     "resolve_indices":true,
   *     "exclude_sensitive_headers":true,
   *     "ignore_users":[
   *       "admin",
   *     ],
   *     "ignore_requests":[
   *       "SearchRequest",
   *       "indices:data/read/*"
   *     ]
   *   },
   *   "compliance":{
   *     "enabled":true,
   *     "internal_config":false,
   *     "external_config":false,
   *     "read_metadata_only":false,
   *     "read_watched_fields":{
   *       "indexName1":[
   *         "field1",
   *         "fields-*"
   *       ]
   *     },
   *     "read_ignore_users":[
   *       "kibanaserver",
   *       "operator/*"
   *     ],
   *     "write_metadata_only":false,
   *     "write_log_diffs":false,
   *     "write_watched_indices":[
   *       "indexName2",
   *       "indexPatterns-*"
   *     ],
   *     "write_ignore_users":[
   *       "admin"
   *     ]
   *   }
   * }
   */

  router.post({
    path: `${_common.API_PREFIX}/configuration/audit/config`,
    validate: {
      body: _configSchema.schema.any()
    }
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);
    let esResp;

    try {
      esResp = await client.callAsCurrentUser('opendistro_security.saveAudit', {
        body: request.body
      });
      return response.ok({
        body: {
          message: esResp.message
        }
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Deletes cache.
   *
   * Sample response: {"message":"Cache flushed successfully."}
   */

  router.delete({
    path: `${_common.API_PREFIX}/configuration/cache`,
    validate: false
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);
    let esResponse;

    try {
      esResponse = await client.callAsCurrentUser('opendistro_security.clearCache');
      return response.ok({
        body: {
          message: esResponse.message
        }
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Gets permission info of current user.
   *
   * Sample response:
   * {
   *   "user": "User [name=admin, roles=[], requestedTenant=__user__]",
   *   "user_name": "admin",
   *   "has_api_access": true,
   *   "disabled_endpoints": {}
   * }
   */

  router.get({
    path: `${_common.API_PREFIX}/restapiinfo`,
    validate: false
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);

    try {
      const esResponse = await client.callAsCurrentUser('opendistro_security.restapiinfo');
      return response.ok({
        body: esResponse
      });
    } catch (error) {
      return response.badRequest({
        body: error
      });
    }
  });
  /**
   * Validates DLS (document level security) query.
   *
   * Request payload is an ES query.
   */

  router.post({
    path: `${_common.API_PREFIX}/${_common.CONFIGURATION_API_PREFIX}/validatedls/{indexName}`,
    validate: {
      params: _configSchema.schema.object({
        // in legacy plugin implmentation, indexName is not used when calling ES API.
        indexName: _configSchema.schema.maybe(_configSchema.schema.string())
      }),
      body: _configSchema.schema.any()
    }
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);

    try {
      const esResponse = await client.callAsCurrentUser('opendistro_security.validateDls', {
        body: request.body
      });
      return response.ok({
        body: esResponse
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Gets index mapping.
   *
   * Calling ES _mapping API under the hood. see
   * https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-mapping.html
   */

  router.post({
    path: `${_common.API_PREFIX}/${_common.CONFIGURATION_API_PREFIX}/index_mappings`,
    validate: {
      body: _configSchema.schema.object({
        index: _configSchema.schema.arrayOf(_configSchema.schema.string())
      })
    }
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);

    try {
      const esResponse = await client.callAsCurrentUser('opendistro_security.getIndexMappings', {
        index: request.body.index.join(','),
        ignore_unavailable: true,
        allow_no_indices: true
      });
      return response.ok({
        body: esResponse
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
  /**
   * Gets all indices, and field mappings.
   *
   * Calls ES API '/_all/_mapping/field/*' under the hood. see
   * https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-get-mapping.html
   */

  router.get({
    path: `${_common.API_PREFIX}/${_common.CONFIGURATION_API_PREFIX}/indices`,
    validate: false
  }, async (context, request, response) => {
    const client = context.security_plugin.esClient.asScoped(request);

    try {
      const esResponse = await client.callAsCurrentUser('opendistro_security.indices');
      return response.ok({
        body: esResponse
      });
    } catch (error) {
      return errorResponse(response, error);
    }
  });
}

function parseEsErrorResponse(error) {
  if (error.response) {
    try {
      const esErrorResponse = JSON.parse(error.response);
      return esErrorResponse.reason || error.response;
    } catch (parsingError) {
      return error.response;
    }
  }

  return error.message;
}

function errorResponse(response, error) {
  return response.custom({
    statusCode: error.statusCode,
    body: parseEsErrorResponse(error)
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbImRlZmluZVJvdXRlcyIsInJvdXRlciIsImludGVybmFsVXNlclNjaGVtYSIsInNjaGVtYSIsIm9iamVjdCIsImRlc2NyaXB0aW9uIiwibWF5YmUiLCJzdHJpbmciLCJwYXNzd29yZCIsImJhY2tlbmRfcm9sZXMiLCJhcnJheU9mIiwiZGVmYXVsdFZhbHVlIiwiYXR0cmlidXRlcyIsImFueSIsImFjdGlvbkdyb3VwU2NoZW1hIiwiYWxsb3dlZF9hY3Rpb25zIiwicm9sZU1hcHBpbmdTY2hlbWEiLCJob3N0cyIsInVzZXJzIiwicm9sZVNjaGVtYSIsImNsdXN0ZXJfcGVybWlzc2lvbnMiLCJ0ZW5hbnRfcGVybWlzc2lvbnMiLCJpbmRleF9wZXJtaXNzaW9ucyIsInRlbmFudFNjaGVtYSIsImFjY291bnRTY2hlbWEiLCJjdXJyZW50X3Bhc3N3b3JkIiwic2NoZW1hTWFwIiwiaW50ZXJuYWx1c2VycyIsImFjdGlvbmdyb3VwcyIsInJvbGVzbWFwcGluZyIsInJvbGVzIiwidGVuYW50cyIsImFjY291bnQiLCJ2YWxpZGF0ZVJlcXVlc3RCb2R5IiwicmVzb3VyY2VOYW1lIiwicmVxdWVzdEJvZHkiLCJpbnB1dFNjaGVtYSIsIkVycm9yIiwidmFsaWRhdGUiLCJ2YWxpZGF0ZUVudGl0eUlkIiwiZ2V0IiwicGF0aCIsIkFQSV9QUkVGSVgiLCJDT05GSUdVUkFUSU9OX0FQSV9QUkVGSVgiLCJwYXJhbXMiLCJjb250ZXh0IiwicmVxdWVzdCIsInJlc3BvbnNlIiwiY2xpZW50Iiwic2VjdXJpdHlfcGx1Z2luIiwiZXNDbGllbnQiLCJhc1Njb3BlZCIsImVzUmVzcCIsImNhbGxBc0N1cnJlbnRVc2VyIiwib2siLCJib2R5IiwidG90YWwiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwiZGF0YSIsImVycm9yIiwiY29uc29sZSIsImxvZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJlcnJvclJlc3BvbnNlIiwiaWQiLCJkZWxldGUiLCJtaW5MZW5ndGgiLCJtZXNzYWdlIiwicG9zdCIsImJhZFJlcXVlc3QiLCJjdXN0b20iLCJzdGF0dXNDb2RlIiwicGFyc2VFc0Vycm9yUmVzcG9uc2UiLCJlc1Jlc3BvbnNlIiwiaW5kZXhOYW1lIiwiaW5kZXgiLCJqb2luIiwiaWdub3JlX3VuYXZhaWxhYmxlIiwiYWxsb3dfbm9faW5kaWNlcyIsImVzRXJyb3JSZXNwb25zZSIsInBhcnNlIiwicmVhc29uIiwicGFyc2luZ0Vycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBZUE7O0FBRUE7O0FBakJBOzs7Ozs7Ozs7Ozs7OztBQW1CQTtBQUNPLFNBQVNBLFlBQVQsQ0FBc0JDLE1BQXRCLEVBQXVDO0FBQzVDLFFBQU1DLGtCQUFrQixHQUFHQyxxQkFBT0MsTUFBUCxDQUFjO0FBQ3ZDQyxJQUFBQSxXQUFXLEVBQUVGLHFCQUFPRyxLQUFQLENBQWFILHFCQUFPSSxNQUFQLEVBQWIsQ0FEMEI7QUFFdkNDLElBQUFBLFFBQVEsRUFBRUwscUJBQU9HLEtBQVAsQ0FBYUgscUJBQU9JLE1BQVAsRUFBYixDQUY2QjtBQUd2Q0UsSUFBQUEsYUFBYSxFQUFFTixxQkFBT08sT0FBUCxDQUFlUCxxQkFBT0ksTUFBUCxFQUFmLEVBQWdDO0FBQUVJLE1BQUFBLFlBQVksRUFBRTtBQUFoQixLQUFoQyxDQUh3QjtBQUl2Q0MsSUFBQUEsVUFBVSxFQUFFVCxxQkFBT1UsR0FBUCxDQUFXO0FBQUVGLE1BQUFBLFlBQVksRUFBRTtBQUFoQixLQUFYO0FBSjJCLEdBQWQsQ0FBM0I7O0FBT0EsUUFBTUcsaUJBQWlCLEdBQUdYLHFCQUFPQyxNQUFQLENBQWM7QUFDdENDLElBQUFBLFdBQVcsRUFBRUYscUJBQU9HLEtBQVAsQ0FBYUgscUJBQU9JLE1BQVAsRUFBYixDQUR5QjtBQUV0Q1EsSUFBQUEsZUFBZSxFQUFFWixxQkFBT08sT0FBUCxDQUFlUCxxQkFBT0ksTUFBUCxFQUFmLENBRnFCLENBR3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFSc0MsR0FBZCxDQUExQjs7QUFXQSxR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QU94QixLQUFLLENBQUNkLFFBQWI7QUFDRDtBQUNGOztBQUNELFNBQU9jLEtBQUssQ0FBQ1MsT0FBYjtBQUNEOztBQUVELFNBQVNKLGFBQVQsQ0FBdUJuQixRQUF2QixFQUF3RGMsS0FBeEQsRUFBb0U7QUFDbEUsU0FBT2QsUUFBUSxDQUFDMEIsTUFBVCxDQUFnQjtBQUNyQkMsSUFBQUEsVUFBVSxFQUFFYixLQUFLLENBQUNhLFVBREc7QUFFckJuQixJQUFBQSxJQUFJLEVBQUVvQixvQkFBb0IsQ0FBQ2QsS0FBRDtBQUZMLEdBQWhCLENBQVA7QUFJRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiAgIENvcHlyaWdodCAyMDIwIEFtYXpvbi5jb20sIEluYy4gb3IgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpLlxuICogICBZb3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiAgIEEgY29weSBvZiB0aGUgTGljZW5zZSBpcyBsb2NhdGVkIGF0XG4gKlxuICogICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogICBvciBpbiB0aGUgXCJsaWNlbnNlXCIgZmlsZSBhY2NvbXBhbnlpbmcgdGhpcyBmaWxlLiBUaGlzIGZpbGUgaXMgZGlzdHJpYnV0ZWRcbiAqICAgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyXG4gKiAgIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nXG4gKiAgIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBzY2hlbWEgfSBmcm9tICdAa2JuL2NvbmZpZy1zY2hlbWEnO1xuaW1wb3J0IHsgSVJvdXRlciwgUmVzcG9uc2VFcnJvciwgSUtpYmFuYVJlc3BvbnNlLCBLaWJhbmFSZXNwb25zZUZhY3RvcnkgfSBmcm9tICdraWJhbmEvc2VydmVyJztcbmltcG9ydCB7IEFQSV9QUkVGSVgsIENPTkZJR1VSQVRJT05fQVBJX1BSRUZJWCwgaXNWYWxpZFJlc291cmNlTmFtZSB9IGZyb20gJy4uLy4uL2NvbW1vbic7XG5cbi8vIFRPRE86IGNvbnNpZGVyIHRvIGV4dHJhY3QgZW50aXR5IENSVUQgb3BlcmF0aW9ucyBhbmQgcHV0IGl0IGludG8gYSBjbGllbnQgY2xhc3NcbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVSb3V0ZXMocm91dGVyOiBJUm91dGVyKSB7XG4gIGNvbnN0IGludGVybmFsVXNlclNjaGVtYSA9IHNjaGVtYS5vYmplY3Qoe1xuICAgIGRlc2NyaXB0aW9uOiBzY2hlbWEubWF5YmUoc2NoZW1hLnN0cmluZygpKSxcbiAgICBwYXNzd29yZDogc2NoZW1hLm1heWJlKHNjaGVtYS5zdHJpbmcoKSksXG4gICAgYmFja2VuZF9yb2xlczogc2NoZW1hLmFycmF5T2Yoc2NoZW1hLnN0cmluZygpLCB7IGRlZmF1bHRWYWx1ZTogW10gfSksXG4gICAgYXR0cmlidXRlczogc2NoZW1hLmFueSh7IGRlZmF1bHRWYWx1ZToge30gfSksXG4gIH0pO1xuXG4gIGNvbnN0IGFjdGlvbkdyb3VwU2NoZW1hID0gc2NoZW1hLm9iamVjdCh7XG4gICAgZGVzY3JpcHRpb246IHNjaGVtYS5tYXliZShzY2hlbWEuc3RyaW5nKCkpLFxuICAgIGFsbG93ZWRfYWN0aW9uczogc2NoZW1hLmFycmF5T2Yoc2NoZW1hLnN0cmluZygpKSxcbiAgICAvLyB0eXBlIGZpZWxkIGlzIG5vdCBzdXBwb3J0ZWQgaW4gbGVnYWN5IGltcGxlbWVudGF0aW9uLCBjb21tZW50IGl0IG91dCBmb3Igbm93LlxuICAgIC8vIHR5cGU6IHNjaGVtYS5vbmVPZihbXG4gICAgLy8gICBzY2hlbWEubGl0ZXJhbCgnY2x1c3RlcicpLFxuICAgIC8vICAgc2NoZW1hLmxpdGVyYWwoJ2luZGV4JyksXG4gICAgLy8gICBzY2hlbWEubGl0ZXJhbCgna2liYW5hJyksXG4gICAgLy8gXSksXG4gIH0pO1xuXG4gIGNvbnN0IHJvbGVNYXBwaW5nU2NoZW1hID0gc2NoZW1hLm9iamVjdCh7XG4gICAgZGVzY3JpcHRpb246IHNjaGVtYS5tYXliZShzY2hlbWEuc3RyaW5nKCkpLFxuICAgIGJhY2tlbmRfcm9sZXM6IHNjaGVtYS5hcnJheU9mKHNjaGVtYS5zdHJpbmcoKSwgeyBkZWZhdWx0VmFsdWU6IFtdIH0pLFxuICAgIGhvc3RzOiBzY2hlbWEuYXJyYXlPZihzY2hlbWEuc3RyaW5nKCksIHsgZGVmYXVsdFZhbHVlOiBbXSB9KSxcbiAgICB1c2Vyczogc2NoZW1hLmFycmF5T2Yoc2NoZW1hLnN0cmluZygpLCB7IGRlZmF1bHRWYWx1ZTogW10gfSksXG4gIH0pO1xuXG4gIGNvbnN0IHJvbGVTY2hlbWEgPSBzY2hlbWEub2JqZWN0KHtcbiAgICBkZXNjcmlwdGlvbjogc2NoZW1hLm1heWJlKHNjaGVtYS5zdHJpbmcoKSksXG4gICAgY2x1c3Rlcl9wZXJtaXNzaW9uczogc2NoZW1hLmFycmF5T2Yoc2NoZW1hLnN0cmluZygpLCB7IGRlZmF1bHRWYWx1ZTogW10gfSksXG4gICAgdGVuYW50X3Blcm1pc3Npb25zOiBzY2hlbWEuYXJyYXlPZihzY2hlbWEuYW55KCksIHsgZGVmYXVsdFZhbHVlOiBbXSB9KSxcbiAgICBpbmRleF9wZXJtaXNzaW9uczogc2NoZW1hLmFycmF5T2Yoc2NoZW1hLmFueSgpLCB7IGRlZmF1bHRWYWx1ZTogW10gfSksXG4gIH0pO1xuXG4gIGNvbnN0IHRlbmFudFNjaGVtYSA9IHNjaGVtYS5vYmplY3Qoe1xuICAgIGRlc2NyaXB0aW9uOiBzY2hlbWEuc3RyaW5nKCksXG4gIH0pO1xuXG4gIGNvbnN0IGFjY291bnRTY2hlbWEgPSBzY2hlbWEub2JqZWN0KHtcbiAgICBwYXNzd29yZDogc2NoZW1hLnN0cmluZygpLFxuICAgIGN1cnJlbnRfcGFzc3dvcmQ6IHNjaGVtYS5zdHJpbmcoKSxcbiAgfSk7XG5cbiAgY29uc3Qgc2NoZW1hTWFwOiBhbnkgPSB7XG4gICAgaW50ZXJuYWx1c2VyczogaW50ZXJuYWxVc2VyU2NoZW1hLFxuICAgIGFjdGlvbmdyb3VwczogYWN0aW9uR3JvdXBTY2hlbWEsXG4gICAgcm9sZXNtYXBwaW5nOiByb2xlTWFwcGluZ1NjaGVtYSxcbiAgICByb2xlczogcm9sZVNjaGVtYSxcbiAgICB0ZW5hbnRzOiB0ZW5hbnRTY2hlbWEsXG4gICAgYWNjb3VudDogYWNjb3VudFNjaGVtYSxcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZVJlcXVlc3RCb2R5KHJlc291cmNlTmFtZTogc3RyaW5nLCByZXF1ZXN0Qm9keTogYW55KTogYW55IHtcbiAgICBjb25zdCBpbnB1dFNjaGVtYSA9IHNjaGVtYU1hcFtyZXNvdXJjZU5hbWVdO1xuICAgIGlmICghaW5wdXRTY2hlbWEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biByZXNvdXJjZSAke3Jlc291cmNlTmFtZX1gKTtcbiAgICB9XG4gICAgaW5wdXRTY2hlbWEudmFsaWRhdGUocmVxdWVzdEJvZHkpOyAvLyB0aHJvd3MgZXJyb3IgaWYgdmFsaWRhdGlvbiBmYWlsXG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZUVudGl0eUlkKHJlc291cmNlTmFtZTogc3RyaW5nKSB7XG4gICAgaWYgKCFpc1ZhbGlkUmVzb3VyY2VOYW1lKHJlc291cmNlTmFtZSkpIHtcbiAgICAgIHJldHVybiAnSW52YWxpZCBlbnRpdHkgbmFtZSBvciBpZC4nO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0cyByZXNvdXJjZXMgYnkgcmVzb3VyY2UgbmFtZS5cbiAgICpcbiAgICogVGhlIHJlc3BvbnNlIGZvcm1hdCBpczpcbiAgICoge1xuICAgKiAgIFwidG90YWxcIjogPHRvdGFsX2VudGl0eV9jb3VudD4sXG4gICAqICAgXCJkYXRhXCI6IHtcbiAgICogICAgIFwiZW50aXR5X2lkXzFcIjogeyA8ZW50aXR5X3N0cnVjdHVyZT4gfSxcbiAgICogICAgIFwiZW50aXR5X2lkXzJcIjogeyA8ZW50aXR5X3N0cnVjdHVyZT4gfSxcbiAgICogICAgIC4uLlxuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBlLmcuIHdoZW4gbGlzdGluZyBpbnRlcm5hbCB1c2VycywgcmVzcG9uc2UgbWF5IGxvb2sgbGlrZTpcbiAgICoge1xuICAgKiAgIFwidG90YWxcIjogMixcbiAgICogICBcImRhdGFcIjoge1xuICAgKiAgICAgXCJhcGlfdGVzdF91c2VyMlwiOiB7XG4gICAqICAgICAgIFwiaGFzaFwiOiBcIlwiLFxuICAgKiAgICAgICBcInJlc2VydmVkXCI6IGZhbHNlLFxuICAgKiAgICAgICBcImhpZGRlblwiOiBmYWxzZSxcbiAgICogICAgICAgXCJiYWNrZW5kX3JvbGVzXCI6IFtdLFxuICAgKiAgICAgICBcImF0dHJpYnV0ZXNcIjoge30sXG4gICAqICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcIixcbiAgICogICAgICAgXCJzdGF0aWNcIjogZmFsc2VcbiAgICogICAgIH0sXG4gICAqICAgICBcImFwaV90ZXN0X3VzZXIxXCI6IHtcbiAgICogICAgICAgXCJoYXNoXCI6IFwiXCIsXG4gICAqICAgICAgIFwicmVzZXJ2ZWRcIjogZmFsc2UsXG4gICAqICAgICAgIFwiaGlkZGVuXCI6IGZhbHNlLFxuICAgKiAgICAgICBcImJhY2tlbmRfcm9sZXNcIjogW10sXG4gICAqICAgICAgIFwiYXR0cmlidXRlc1wiOiB7fSxcbiAgICogICAgICAgXCJzdGF0aWNcIjogZmFsc2VcbiAgICogICAgIH1cbiAgICogfVxuICAgKlxuICAgKiB3aGVuIGxpc3RpbmcgYWN0aW9uIGdyb3VwcywgcmVzcG9uc2Ugd2lsbCBsb29rIGxpa2U6XG4gICAqIHtcbiAgICogICBcInRvdGFsXCI6IDIsXG4gICAqICAgXCJkYXRhXCI6IHtcbiAgICogICAgIFwicmVhZFwiOiB7XG4gICAqICAgICAgIFwicmVzZXJ2ZWRcIjogdHJ1ZSxcbiAgICogICAgICAgXCJoaWRkZW5cIjogZmFsc2UsXG4gICAqICAgICAgIFwiYWxsb3dlZF9hY3Rpb25zXCI6IFtcImluZGljZXM6ZGF0YS9yZWFkKlwiLCBcImluZGljZXM6YWRtaW4vbWFwcGluZ3MvZmllbGRzL2dldCpcIl0sXG4gICAqICAgICAgIFwidHlwZVwiOiBcImluZGV4XCIsXG4gICAqICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBbGxvdyBhbGwgcmVhZCBvcGVyYXRpb25zXCIsXG4gICAqICAgICAgIFwic3RhdGljXCI6IGZhbHNlXG4gICAqICAgICB9LFxuICAgKiAgICAgXCJjbHVzdGVyX2FsbFwiOiB7XG4gICAqICAgICAgIFwicmVzZXJ2ZWRcIjogdHJ1ZSxcbiAgICogICAgICAgXCJoaWRkZW5cIjogZmFsc2UsXG4gICAqICAgICAgIFwiYWxsb3dlZF9hY3Rpb25zXCI6IFtcImNsdXN0ZXI6KlwiXSxcbiAgICogICAgICAgXCJ0eXBlXCI6IFwiY2x1c3RlclwiLFxuICAgKiAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQWxsb3cgZXZlcnl0aGluZyBvbiBjbHVzdGVyIGxldmVsXCIsXG4gICAqICAgICAgIFwic3RhdGljXCI6IGZhbHNlXG4gICAqICAgICB9XG4gICAqIH1cbiAgICpcbiAgICogcm9sZTpcbiAgICoge1xuICAgKiAgIFwidG90YWxcIjogMixcbiAgICogICBcImRhdGFcIjoge1xuICAgKiAgICAgXCJraWJhbmFfdXNlclwiOiB7XG4gICAqICAgICAgIFwicmVzZXJ2ZWRcIjogdHJ1ZSxcbiAgICogICAgICAgXCJoaWRkZW5cIjogZmFsc2UsXG4gICAqICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQcm92aWRlIHRoZSBtaW5pbXVtIHBlcm1pc3Npb25zIGZvciBhIGtpYmFuYSB1c2VyXCIsXG4gICAqICAgICAgIFwiY2x1c3Rlcl9wZXJtaXNzaW9uc1wiOiBbXCJjbHVzdGVyX2NvbXBvc2l0ZV9vcHNcIl0sXG4gICAqICAgICAgIFwiaW5kZXhfcGVybWlzc2lvbnNcIjogW3tcbiAgICogICAgICAgICBcImluZGV4X3BhdHRlcm5zXCI6IFtcIi5raWJhbmFcIiwgXCIua2liYW5hLTZcIiwgXCIua2liYW5hXypcIl0sXG4gICAqICAgICAgICAgXCJmbHNcIjogW10sXG4gICAqICAgICAgICAgXCJtYXNrZWRfZmllbGRzXCI6IFtdLFxuICAgKiAgICAgICAgIFwiYWxsb3dlZF9hY3Rpb25zXCI6IFtcInJlYWRcIiwgXCJkZWxldGVcIiwgXCJtYW5hZ2VcIiwgXCJpbmRleFwiXVxuICAgKiAgICAgICB9LCB7XG4gICAqICAgICAgICAgXCJpbmRleF9wYXR0ZXJuc1wiOiBbXCIudGFza3NcIiwgXCIubWFuYWdlbWVudC1iZWF0c1wiXSxcbiAgICogICAgICAgICBcImZsc1wiOiBbXSxcbiAgICogICAgICAgICBcIm1hc2tlZF9maWVsZHNcIjogW10sXG4gICAqICAgICAgICAgXCJhbGxvd2VkX2FjdGlvbnNcIjogW1wiaW5kaWNlc19hbGxcIl1cbiAgICogICAgICAgfV0sXG4gICAqICAgICAgIFwidGVuYW50X3Blcm1pc3Npb25zXCI6IFtdLFxuICAgKiAgICAgICBcInN0YXRpY1wiOiBmYWxzZVxuICAgKiAgICAgfSxcbiAgICogICAgIFwiYWxsX2FjY2Vzc1wiOiB7XG4gICAqICAgICAgIFwicmVzZXJ2ZWRcIjogdHJ1ZSxcbiAgICogICAgICAgXCJoaWRkZW5cIjogZmFsc2UsXG4gICAqICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBbGxvdyBmdWxsIGFjY2VzcyB0byBhbGwgaW5kaWNlcyBhbmQgYWxsIGNsdXN0ZXIgQVBJc1wiLFxuICAgKiAgICAgICBcImNsdXN0ZXJfcGVybWlzc2lvbnNcIjogW1wiKlwiXSxcbiAgICogICAgICAgXCJpbmRleF9wZXJtaXNzaW9uc1wiOiBbe1xuICAgKiAgICAgICAgIFwiaW5kZXhfcGF0dGVybnNcIjogW1wiKlwiXSxcbiAgICogICAgICAgICBcImZsc1wiOiBbXSxcbiAgICogICAgICAgICBcIm1hc2tlZF9maWVsZHNcIjogW10sXG4gICAqICAgICAgICAgXCJhbGxvd2VkX2FjdGlvbnNcIjogW1wiKlwiXVxuICAgKiAgICAgICB9XSxcbiAgICogICAgICAgXCJ0ZW5hbnRfcGVybWlzc2lvbnNcIjogW3tcbiAgICogICAgICAgICBcInRlbmFudF9wYXR0ZXJuc1wiOiBbXCIqXCJdLFxuICAgKiAgICAgICAgIFwiYWxsb3dlZF9hY3Rpb25zXCI6IFtcImtpYmFuYV9hbGxfd3JpdGVcIl1cbiAgICogICAgICAgfV0sXG4gICAqICAgICAgIFwic3RhdGljXCI6IGZhbHNlXG4gICAqICAgICB9XG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIHJvbGVzbWFwcGluZzpcbiAgICoge1xuICAgKiAgIFwidG90YWxcIjogMixcbiAgICogICBcImRhdGFcIjoge1xuICAgKiAgICAgXCJzZWN1cml0eV9tYW5hZ2VyXCI6IHtcbiAgICogICAgICAgXCJyZXNlcnZlZFwiOiBmYWxzZSxcbiAgICogICAgICAgXCJoaWRkZW5cIjogZmFsc2UsXG4gICAqICAgICAgIFwiYmFja2VuZF9yb2xlc1wiOiBbXSxcbiAgICogICAgICAgXCJob3N0c1wiOiBbXSxcbiAgICogICAgICAgXCJ1c2Vyc1wiOiBbXCJ6ZW5neWFuXCIsIFwiYWRtaW5cIl0sXG4gICAqICAgICAgIFwiYW5kX2JhY2tlbmRfcm9sZXNcIjogW11cbiAgICogICAgIH0sXG4gICAqICAgICBcImFsbF9hY2Nlc3NcIjoge1xuICAgKiAgICAgICBcInJlc2VydmVkXCI6IGZhbHNlLFxuICAgKiAgICAgICBcImhpZGRlblwiOiBmYWxzZSxcbiAgICogICAgICAgXCJiYWNrZW5kX3JvbGVzXCI6IFtdLFxuICAgKiAgICAgICBcImhvc3RzXCI6IFtdLFxuICAgKiAgICAgICBcInVzZXJzXCI6IFtcInplbmd5YW5cIiwgXCJhZG1pblwiLCBcImluZGV4dGVzdFwiXSxcbiAgICogICAgICAgXCJhbmRfYmFja2VuZF9yb2xlc1wiOiBbXVxuICAgKiAgICAgfVxuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiB0ZW5hbnRzOlxuICAgKiB7XG4gICAqICAgXCJ0b3RhbFwiOiAyLFxuICAgKiAgIFwiZGF0YVwiOiB7XG4gICAqICAgICBcImdsb2JhbF90ZW5hbnRcIjoge1xuICAgKiAgICAgICBcInJlc2VydmVkXCI6IHRydWUsXG4gICAqICAgICAgIFwiaGlkZGVuXCI6IGZhbHNlLFxuICAgKiAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiR2xvYmFsIHRlbmFudFwiLFxuICAgKiAgICAgICBcInN0YXRpY1wiOiBmYWxzZVxuICAgKiAgICAgfSxcbiAgICogICAgIFwidGVzdCB0ZW5hbnRcIjoge1xuICAgKiAgICAgICBcInJlc2VydmVkXCI6IGZhbHNlLFxuICAgKiAgICAgICBcImhpZGRlblwiOiBmYWxzZSxcbiAgICogICAgICAgXCJkZXNjcmlwdGlvblwiOiBcInRlbmFudCBkZXNjcmlwdGlvblwiLFxuICAgKiAgICAgICBcInN0YXRpY1wiOiBmYWxzZVxuICAgKiAgICAgfVxuICAgKiAgIH1cbiAgICogfVxuICAgKi9cbiAgcm91dGVyLmdldChcbiAgICB7XG4gICAgICBwYXRoOiBgJHtBUElfUFJFRklYfS8ke0NPTkZJR1VSQVRJT05fQVBJX1BSRUZJWH0ve3Jlc291cmNlTmFtZX1gLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiBzY2hlbWEub2JqZWN0KHtcbiAgICAgICAgICByZXNvdXJjZU5hbWU6IHNjaGVtYS5zdHJpbmcoKSxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYXN5bmMgKGNvbnRleHQsIHJlcXVlc3QsIHJlc3BvbnNlKTogUHJvbWlzZTxJS2liYW5hUmVzcG9uc2U8YW55IHwgUmVzcG9uc2VFcnJvcj4+ID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudCA9IGNvbnRleHQuc2VjdXJpdHlfcGx1Z2luLmVzQ2xpZW50LmFzU2NvcGVkKHJlcXVlc3QpO1xuICAgICAgbGV0IGVzUmVzcDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVzUmVzcCA9IGF3YWl0IGNsaWVudC5jYWxsQXNDdXJyZW50VXNlcignb3BlbmRpc3Ryb19zZWN1cml0eS5saXN0UmVzb3VyY2UnLCB7XG4gICAgICAgICAgcmVzb3VyY2VOYW1lOiByZXF1ZXN0LnBhcmFtcy5yZXNvdXJjZU5hbWUsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIHRvdGFsOiBPYmplY3Qua2V5cyhlc1Jlc3ApLmxlbmd0aCxcbiAgICAgICAgICAgIGRhdGE6IGVzUmVzcCxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGVycm9yKSk7XG4gICAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKHJlc3BvbnNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIC8qKlxuICAgKiBHZXRzIGVudGl0eSBieSBpZC5cbiAgICpcbiAgICogdGhlIHJlc3BvbnNlIGZvcm1hdCBkaWZmZXJzIGZyb20gZGlmZmVyZW50IHJlc291cmNlIHR5cGVzLiBlLmcuXG4gICAqXG4gICAqIGZvciBpbnRlcm5hbCB1c2VyLCByZXNwb25zZSB3aWxsIGxvb2sgbGlrZTpcbiAgICoge1xuICAgKiAgIFwiaGFzaFwiOiBcIlwiLFxuICAgKiAgIFwicmVzZXJ2ZWRcIjogZmFsc2UsXG4gICAqICAgXCJoaWRkZW5cIjogZmFsc2UsXG4gICAqICAgXCJiYWNrZW5kX3JvbGVzXCI6IFtdLFxuICAgKiAgIFwiYXR0cmlidXRlc1wiOiB7fSxcbiAgICogICBcInN0YXRpY1wiOiBmYWxzZVxuICAgKiB9XG4gICAqXG4gICAqIGZvciByb2xlLCByZXNwb25zZSB3aWxsIGxvb2sgbGlrZTpcbiAgICoge1xuICAgKiAgIFwicmVzZXJ2ZWRcIjogdHJ1ZSxcbiAgICogICBcImhpZGRlblwiOiBmYWxzZSxcbiAgICogICBcImRlc2NyaXB0aW9uXCI6IFwiQWxsb3cgZnVsbCBhY2Nlc3MgdG8gYWxsIGluZGljZXMgYW5kIGFsbCBjbHVzdGVyIEFQSXNcIixcbiAgICogICBcImNsdXN0ZXJfcGVybWlzc2lvbnNcIjogW1wiKlwiXSxcbiAgICogICBcImluZGV4X3Blcm1pc3Npb25zXCI6IFt7XG4gICAqICAgICBcImluZGV4X3BhdHRlcm5zXCI6IFtcIipcIl0sXG4gICAqICAgICBcImZsc1wiOiBbXSxcbiAgICogICAgIFwibWFza2VkX2ZpZWxkc1wiOiBbXSxcbiAgICogICAgIFwiYWxsb3dlZF9hY3Rpb25zXCI6IFtcIipcIl1cbiAgICogICB9XSxcbiAgICogICBcInRlbmFudF9wZXJtaXNzaW9uc1wiOiBbe1xuICAgKiAgICAgXCJ0ZW5hbnRfcGF0dGVybnNcIjogW1wiKlwiXSxcbiAgICogICAgIFwiYWxsb3dlZF9hY3Rpb25zXCI6IFtcImtpYmFuYV9hbGxfd3JpdGVcIl1cbiAgICogICB9XSxcbiAgICogICBcInN0YXRpY1wiOiBmYWxzZVxuICAgKiB9XG4gICAqXG4gICAqIGZvciByb2xlcyBtYXBwaW5nLCByZXNwb25zZSB3aWxsIGxvb2sgbGlrZTpcbiAgICoge1xuICAgKiAgIFwicmVzZXJ2ZWRcIjogdHJ1ZSxcbiAgICogICBcImhpZGRlblwiOiBmYWxzZSxcbiAgICogICBcImRlc2NyaXB0aW9uXCI6IFwiQWxsb3cgZnVsbCBhY2Nlc3MgdG8gYWxsIGluZGljZXMgYW5kIGFsbCBjbHVzdGVyIEFQSXNcIixcbiAgICogICBcImNsdXN0ZXJfcGVybWlzc2lvbnNcIjogW1wiKlwiXSxcbiAgICogICBcImluZGV4X3Blcm1pc3Npb25zXCI6IFt7XG4gICAqICAgICBcImluZGV4X3BhdHRlcm5zXCI6IFtcIipcIl0sXG4gICAqICAgICBcImZsc1wiOiBbXSxcbiAgICogICAgIFwibWFza2VkX2ZpZWxkc1wiOiBbXSxcbiAgICogICAgIFwiYWxsb3dlZF9hY3Rpb25zXCI6IFtcIipcIl1cbiAgICogICB9XSxcbiAgICogICBcInRlbmFudF9wZXJtaXNzaW9uc1wiOiBbe1xuICAgKiAgICAgXCJ0ZW5hbnRfcGF0dGVybnNcIjogW1wiKlwiXSxcbiAgICogICAgIFwiYWxsb3dlZF9hY3Rpb25zXCI6IFtcImtpYmFuYV9hbGxfd3JpdGVcIl1cbiAgICogICB9XSxcbiAgICogICBcInN0YXRpY1wiOiBmYWxzZVxuICAgKiB9XG4gICAqXG4gICAqIGZvciBhY3Rpb24gZ3JvdXBzLCByZXNwb25zZSB3aWxsIGxvb2sgbGlrZTpcbiAgICoge1xuICAgKiAgIFwicmVzZXJ2ZWRcIjogdHJ1ZSxcbiAgICogICBcImhpZGRlblwiOiBmYWxzZSxcbiAgICogICBcImFsbG93ZWRfYWN0aW9uc1wiOiBbXCJpbmRpY2VzOmRhdGEvcmVhZCpcIiwgXCJpbmRpY2VzOmFkbWluL21hcHBpbmdzL2ZpZWxkcy9nZXQqXCJdLFxuICAgKiAgIFwidHlwZVwiOiBcImluZGV4XCIsXG4gICAqICAgXCJkZXNjcmlwdGlvblwiOiBcIkFsbG93IGFsbCByZWFkIG9wZXJhdGlvbnNcIixcbiAgICogICBcInN0YXRpY1wiOiBmYWxzZVxuICAgKiB9XG4gICAqXG4gICAqIGZvciB0ZW5hbnQsIHJlc3BvbnNlIHdpbGwgbG9vayBsaWtlOlxuICAgKiB7XG4gICAqICAgXCJyZXNlcnZlZFwiOiB0cnVlLFxuICAgKiAgIFwiaGlkZGVuXCI6IGZhbHNlLFxuICAgKiAgIFwiZGVzY3JpcHRpb25cIjogXCJHbG9iYWwgdGVuYW50XCIsXG4gICAqICAgXCJzdGF0aWNcIjogZmFsc2VcbiAgICogfSxcbiAgICovXG4gIHJvdXRlci5nZXQoXG4gICAge1xuICAgICAgcGF0aDogYCR7QVBJX1BSRUZJWH0vJHtDT05GSUdVUkFUSU9OX0FQSV9QUkVGSVh9L3tyZXNvdXJjZU5hbWV9L3tpZH1gLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiBzY2hlbWEub2JqZWN0KHtcbiAgICAgICAgICByZXNvdXJjZU5hbWU6IHNjaGVtYS5zdHJpbmcoKSxcbiAgICAgICAgICBpZDogc2NoZW1hLnN0cmluZygpLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhc3luYyAoY29udGV4dCwgcmVxdWVzdCwgcmVzcG9uc2UpOiBQcm9taXNlPElLaWJhbmFSZXNwb25zZTxhbnkgfCBSZXNwb25zZUVycm9yPj4gPT4ge1xuICAgICAgY29uc3QgY2xpZW50ID0gY29udGV4dC5zZWN1cml0eV9wbHVnaW4uZXNDbGllbnQuYXNTY29wZWQocmVxdWVzdCk7XG4gICAgICBsZXQgZXNSZXNwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZXNSZXNwID0gYXdhaXQgY2xpZW50LmNhbGxBc0N1cnJlbnRVc2VyKCdvcGVuZGlzdHJvX3NlY3VyaXR5LmdldFJlc291cmNlJywge1xuICAgICAgICAgIHJlc291cmNlTmFtZTogcmVxdWVzdC5wYXJhbXMucmVzb3VyY2VOYW1lLFxuICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5vayh7IGJvZHk6IGVzUmVzcFtyZXF1ZXN0LnBhcmFtcy5pZF0gfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShyZXNwb25zZSwgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICAvKipcbiAgICogRGVsZXRlcyBhbiBlbnRpdHkgYnkgaWQuXG4gICAqL1xuICByb3V0ZXIuZGVsZXRlKFxuICAgIHtcbiAgICAgIHBhdGg6IGAke0FQSV9QUkVGSVh9LyR7Q09ORklHVVJBVElPTl9BUElfUFJFRklYfS97cmVzb3VyY2VOYW1lfS97aWR9YCxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczogc2NoZW1hLm9iamVjdCh7XG4gICAgICAgICAgcmVzb3VyY2VOYW1lOiBzY2hlbWEuc3RyaW5nKCksXG4gICAgICAgICAgaWQ6IHNjaGVtYS5zdHJpbmcoe1xuICAgICAgICAgICAgbWluTGVuZ3RoOiAxLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhc3luYyAoY29udGV4dCwgcmVxdWVzdCwgcmVzcG9uc2UpOiBQcm9taXNlPElLaWJhbmFSZXNwb25zZTxhbnkgfCBSZXNwb25zZUVycm9yPj4gPT4ge1xuICAgICAgY29uc3QgY2xpZW50ID0gY29udGV4dC5zZWN1cml0eV9wbHVnaW4uZXNDbGllbnQuYXNTY29wZWQocmVxdWVzdCk7XG4gICAgICBsZXQgZXNSZXNwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZXNSZXNwID0gYXdhaXQgY2xpZW50LmNhbGxBc0N1cnJlbnRVc2VyKCdvcGVuZGlzdHJvX3NlY3VyaXR5LmRlbGV0ZVJlc291cmNlJywge1xuICAgICAgICAgIHJlc291cmNlTmFtZTogcmVxdWVzdC5wYXJhbXMucmVzb3VyY2VOYW1lLFxuICAgICAgICAgIGlkOiByZXF1ZXN0LnBhcmFtcy5pZCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgbWVzc2FnZTogZXNSZXNwLm1lc3NhZ2UsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShyZXNwb25zZSwgZXJyb3IpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICAvKipcbiAgICogVXBkYXRlIG9iamVjdCB3aXRoIG91dCBJZC4gUmVzb3VyY2UgaWRlbnRpZmljYXRpb24gaXMgZXhwZWN0ZWQgdG8gY29tcHV0ZWQgZnJvbSBoZWFkZXJzLiBFZzogYXV0aCBoZWFkZXJzXG4gICAqXG4gICAqIFJlcXVlc3Qgc2FtcGxlOlxuICAgKiAvY29uZmlndXJhdGlvbi9hY2NvdW50XG4gICAqIHtcbiAgICogICBcInBhc3N3b3JkXCI6IFwibmV3LXBhc3N3b3JkXCIsXG4gICAqICAgXCJjdXJyZW50X3Bhc3N3b3JkXCI6IFwib2xkLXBhc3N3b3JkXCJcbiAgICogfVxuICAgKi9cbiAgcm91dGVyLnBvc3QoXG4gICAge1xuICAgICAgcGF0aDogYCR7QVBJX1BSRUZJWH0vJHtDT05GSUdVUkFUSU9OX0FQSV9QUkVGSVh9L3tyZXNvdXJjZU5hbWV9YCxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIHBhcmFtczogc2NoZW1hLm9iamVjdCh7XG4gICAgICAgICAgcmVzb3VyY2VOYW1lOiBzY2hlbWEuc3RyaW5nKCksXG4gICAgICAgIH0pLFxuICAgICAgICBib2R5OiBzY2hlbWEuYW55KCksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYXN5bmMgKGNvbnRleHQsIHJlcXVlc3QsIHJlc3BvbnNlKTogUHJvbWlzZTxJS2liYW5hUmVzcG9uc2U8YW55IHwgUmVzcG9uc2VFcnJvcj4+ID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhbGlkYXRlUmVxdWVzdEJvZHkocmVxdWVzdC5wYXJhbXMucmVzb3VyY2VOYW1lLCByZXF1ZXN0LmJvZHkpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJhZFJlcXVlc3QoeyBib2R5OiBlcnJvciB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNsaWVudCA9IGNvbnRleHQuc2VjdXJpdHlfcGx1Z2luLmVzQ2xpZW50LmFzU2NvcGVkKHJlcXVlc3QpO1xuICAgICAgbGV0IGVzUmVzcDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVzUmVzcCA9IGF3YWl0IGNsaWVudC5jYWxsQXNDdXJyZW50VXNlcignb3BlbmRpc3Ryb19zZWN1cml0eS5zYXZlUmVzb3VyY2VXaXRob3V0SWQnLCB7XG4gICAgICAgICAgcmVzb3VyY2VOYW1lOiByZXF1ZXN0LnBhcmFtcy5yZXNvdXJjZU5hbWUsXG4gICAgICAgICAgYm9keTogcmVxdWVzdC5ib2R5LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBlc1Jlc3AubWVzc2FnZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKHJlc3BvbnNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIC8qKlxuICAgKiBVcGRhdGUgZW50aXR5IGJ5IElkLlxuICAgKi9cbiAgcm91dGVyLnBvc3QoXG4gICAge1xuICAgICAgcGF0aDogYCR7QVBJX1BSRUZJWH0vJHtDT05GSUdVUkFUSU9OX0FQSV9QUkVGSVh9L3tyZXNvdXJjZU5hbWV9L3tpZH1gLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiBzY2hlbWEub2JqZWN0KHtcbiAgICAgICAgICByZXNvdXJjZU5hbWU6IHNjaGVtYS5zdHJpbmcoKSxcbiAgICAgICAgICBpZDogc2NoZW1hLnN0cmluZyh7XG4gICAgICAgICAgICB2YWxpZGF0ZTogdmFsaWRhdGVFbnRpdHlJZCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSksXG4gICAgICAgIGJvZHk6IHNjaGVtYS5hbnkoKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhc3luYyAoY29udGV4dCwgcmVxdWVzdCwgcmVzcG9uc2UpOiBQcm9taXNlPElLaWJhbmFSZXNwb25zZTxhbnkgfCBSZXNwb25zZUVycm9yPj4gPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFsaWRhdGVSZXF1ZXN0Qm9keShyZXF1ZXN0LnBhcmFtcy5yZXNvdXJjZU5hbWUsIHJlcXVlc3QuYm9keSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYmFkUmVxdWVzdCh7IGJvZHk6IGVycm9yIH0pO1xuICAgICAgfVxuICAgICAgY29uc3QgY2xpZW50ID0gY29udGV4dC5zZWN1cml0eV9wbHVnaW4uZXNDbGllbnQuYXNTY29wZWQocmVxdWVzdCk7XG4gICAgICBsZXQgZXNSZXNwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZXNSZXNwID0gYXdhaXQgY2xpZW50LmNhbGxBc0N1cnJlbnRVc2VyKCdvcGVuZGlzdHJvX3NlY3VyaXR5LnNhdmVSZXNvdXJjZScsIHtcbiAgICAgICAgICByZXNvdXJjZU5hbWU6IHJlcXVlc3QucGFyYW1zLnJlc291cmNlTmFtZSxcbiAgICAgICAgICBpZDogcmVxdWVzdC5wYXJhbXMuaWQsXG4gICAgICAgICAgYm9keTogcmVxdWVzdC5ib2R5LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBlc1Jlc3AubWVzc2FnZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKHJlc3BvbnNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIC8qKlxuICAgKiBHZXRzIGF1dGhlbnRpY2F0aW9uIGluZm8gb2YgdGhlIHVzZXIuXG4gICAqXG4gICAqIFRoZSByZXNwb25zZSBsb29rcyBsaWtlOlxuICAgKiB7XG4gICAqICAgXCJ1c2VyXCI6IFwiVXNlciBbbmFtZT1hZG1pbiwgcm9sZXM9W10sIHJlcXVlc3RlZFRlbmFudD1fX3VzZXJfX11cIixcbiAgICogICBcInVzZXJfbmFtZVwiOiBcImFkbWluXCIsXG4gICAqICAgXCJ1c2VyX3JlcXVlc3RlZF90ZW5hbnRcIjogXCJfX3VzZXJfX1wiLFxuICAgKiAgIFwicmVtb3RlX2FkZHJlc3NcIjogXCIxMjcuMC4wLjE6MzUwNDRcIixcbiAgICogICBcImJhY2tlbmRfcm9sZXNcIjogW10sXG4gICAqICAgXCJjdXN0b21fYXR0cmlidXRlX25hbWVzXCI6IFtdLFxuICAgKiAgIFwicm9sZXNcIjogW1wiYWxsX2FjY2Vzc1wiLCBcInNlY3VyaXR5X21hbmFnZXJcIl0sXG4gICAqICAgXCJ0ZW5hbnRzXCI6IHtcbiAgICogICAgIFwiYW5vdGhlcl90ZW5hbnRcIjogdHJ1ZSxcbiAgICogICAgIFwiYWRtaW5cIjogdHJ1ZSxcbiAgICogICAgIFwiZ2xvYmFsX3RlbmFudFwiOiB0cnVlLFxuICAgKiAgICAgXCJhYWFhYVwiOiB0cnVlLFxuICAgKiAgICAgXCJ0ZXN0IHRlbmFudFwiOiB0cnVlXG4gICAqICAgfSxcbiAgICogICBcInByaW5jaXBhbFwiOiBudWxsLFxuICAgKiAgIFwicGVlcl9jZXJ0aWZpY2F0ZXNcIjogXCIwXCIsXG4gICAqICAgXCJzc29fbG9nb3V0X3VybFwiOiBudWxsXG4gICAqIH1cbiAgICovXG4gIHJvdXRlci5nZXQoXG4gICAge1xuICAgICAgcGF0aDogYCR7QVBJX1BSRUZJWH0vYXV0aC9hdXRoaW5mb2AsXG4gICAgICB2YWxpZGF0ZTogZmFsc2UsXG4gICAgfSxcbiAgICBhc3luYyAoY29udGV4dCwgcmVxdWVzdCwgcmVzcG9uc2UpOiBQcm9taXNlPElLaWJhbmFSZXNwb25zZTxhbnkgfCBSZXNwb25zZUVycm9yPj4gPT4ge1xuICAgICAgY29uc3QgY2xpZW50ID0gY29udGV4dC5zZWN1cml0eV9wbHVnaW4uZXNDbGllbnQuYXNTY29wZWQocmVxdWVzdCk7XG4gICAgICBsZXQgZXNSZXNwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZXNSZXNwID0gYXdhaXQgY2xpZW50LmNhbGxBc0N1cnJlbnRVc2VyKCdvcGVuZGlzdHJvX3NlY3VyaXR5LmF1dGhpbmZvJyk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiBlc1Jlc3AsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UocmVzcG9uc2UsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG5cbiAgLyoqXG4gICAqIEdldHMgYXVkaXQgbG9nIGNvbmZpZ3VyYXRpb27jgIJcbiAgICpcbiAgICogU2FtcGxlIHBheWxvYWQ6XG4gICAqIHtcbiAgICogICBcImVuYWJsZWRcIjp0cnVlLFxuICAgKiAgIFwiYXVkaXRcIjp7XG4gICAqICAgICBcImVuYWJsZV9yZXN0XCI6ZmFsc2UsXG4gICAqICAgICBcImRpc2FibGVkX3Jlc3RfY2F0ZWdvcmllc1wiOltcbiAgICogICAgICAgXCJGQUlMRURfTE9HSU5cIixcbiAgICogICAgICAgXCJBVVRIRU5USUNBVEVEXCJcbiAgICogICAgIF0sXG4gICAqICAgICBcImVuYWJsZV90cmFuc3BvcnRcIjp0cnVlLFxuICAgKiAgICAgXCJkaXNhYmxlZF90cmFuc3BvcnRfY2F0ZWdvcmllc1wiOltcbiAgICogICAgICAgXCJHUkFOVEVEX1BSSVZJTEVHRVNcIlxuICAgKiAgICAgXSxcbiAgICogICAgIFwicmVzb2x2ZV9idWxrX3JlcXVlc3RzXCI6dHJ1ZSxcbiAgICogICAgIFwibG9nX3JlcXVlc3RfYm9keVwiOmZhbHNlLFxuICAgKiAgICAgXCJyZXNvbHZlX2luZGljZXNcIjp0cnVlLFxuICAgKiAgICAgXCJleGNsdWRlX3NlbnNpdGl2ZV9oZWFkZXJzXCI6dHJ1ZSxcbiAgICogICAgIFwiaWdub3JlX3VzZXJzXCI6W1xuICAgKiAgICAgICBcImFkbWluXCIsXG4gICAqICAgICBdLFxuICAgKiAgICAgXCJpZ25vcmVfcmVxdWVzdHNcIjpbXG4gICAqICAgICAgIFwiU2VhcmNoUmVxdWVzdFwiLFxuICAgKiAgICAgICBcImluZGljZXM6ZGF0YS9yZWFkLypcIlxuICAgKiAgICAgXVxuICAgKiAgIH0sXG4gICAqICAgXCJjb21wbGlhbmNlXCI6e1xuICAgKiAgICAgXCJlbmFibGVkXCI6dHJ1ZSxcbiAgICogICAgIFwiaW50ZXJuYWxfY29uZmlnXCI6ZmFsc2UsXG4gICAqICAgICBcImV4dGVybmFsX2NvbmZpZ1wiOmZhbHNlLFxuICAgKiAgICAgXCJyZWFkX21ldGFkYXRhX29ubHlcIjpmYWxzZSxcbiAgICogICAgIFwicmVhZF93YXRjaGVkX2ZpZWxkc1wiOntcbiAgICogICAgICAgXCJpbmRleE5hbWUxXCI6W1xuICAgKiAgICAgICAgIFwiZmllbGQxXCIsXG4gICAqICAgICAgICAgXCJmaWVsZHMtKlwiXG4gICAqICAgICAgIF1cbiAgICogICAgIH0sXG4gICAqICAgICBcInJlYWRfaWdub3JlX3VzZXJzXCI6W1xuICAgKiAgICAgICBcImtpYmFuYXNlcnZlclwiLFxuICAgKiAgICAgICBcIm9wZXJhdG9yLypcIlxuICAgKiAgICAgXSxcbiAgICogICAgIFwid3JpdGVfbWV0YWRhdGFfb25seVwiOmZhbHNlLFxuICAgKiAgICAgXCJ3cml0ZV9sb2dfZGlmZnNcIjpmYWxzZSxcbiAgICogICAgIFwid3JpdGVfd2F0Y2hlZF9pbmRpY2VzXCI6W1xuICAgKiAgICAgICBcImluZGV4TmFtZTJcIixcbiAgICogICAgICAgXCJpbmRleFBhdHRlcm5zLSpcIlxuICAgKiAgICAgXSxcbiAgICogICAgIFwid3JpdGVfaWdub3JlX3VzZXJzXCI6W1xuICAgKiAgICAgICBcImFkbWluXCJcbiAgICogICAgIF1cbiAgICogICB9XG4gICAqIH1cbiAgICovXG4gIHJvdXRlci5nZXQoXG4gICAge1xuICAgICAgcGF0aDogYCR7QVBJX1BSRUZJWH0vY29uZmlndXJhdGlvbi9hdWRpdGAsXG4gICAgICB2YWxpZGF0ZTogZmFsc2UsXG4gICAgfSxcbiAgICBhc3luYyAoY29udGV4dCwgcmVxdWVzdCwgcmVzcG9uc2UpOiBQcm9taXNlPElLaWJhbmFSZXNwb25zZTxhbnkgfCBSZXNwb25zZUVycm9yPj4gPT4ge1xuICAgICAgY29uc3QgY2xpZW50ID0gY29udGV4dC5zZWN1cml0eV9wbHVnaW4uZXNDbGllbnQuYXNTY29wZWQocmVxdWVzdCk7XG5cbiAgICAgIGxldCBlc1Jlc3A7XG4gICAgICB0cnkge1xuICAgICAgICBlc1Jlc3AgPSBhd2FpdCBjbGllbnQuY2FsbEFzQ3VycmVudFVzZXIoJ29wZW5kaXN0cm9fc2VjdXJpdHkuZ2V0QXVkaXQnKTtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IGVzUmVzcCxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuY3VzdG9tKHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiBlcnJvci5zdGF0dXNDb2RlLFxuICAgICAgICAgIGJvZHk6IHBhcnNlRXNFcnJvclJlc3BvbnNlKGVycm9yKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIC8qKlxuICAgKiBVcGRhdGUgYXVkaXQgbG9nIGNvbmZpZ3VyYXRpb27jgIJcbiAgICpcbiAgICogU2FtcGxlIHBheWxvYWQ6XG4gICAqIHtcbiAgICogICBcImVuYWJsZWRcIjp0cnVlLFxuICAgKiAgIFwiYXVkaXRcIjp7XG4gICAqICAgICBcImVuYWJsZV9yZXN0XCI6ZmFsc2UsXG4gICAqICAgICBcImRpc2FibGVkX3Jlc3RfY2F0ZWdvcmllc1wiOltcbiAgICogICAgICAgXCJGQUlMRURfTE9HSU5cIixcbiAgICogICAgICAgXCJBVVRIRU5USUNBVEVEXCJcbiAgICogICAgIF0sXG4gICAqICAgICBcImVuYWJsZV90cmFuc3BvcnRcIjp0cnVlLFxuICAgKiAgICAgXCJkaXNhYmxlZF90cmFuc3BvcnRfY2F0ZWdvcmllc1wiOltcbiAgICogICAgICAgXCJHUkFOVEVEX1BSSVZJTEVHRVNcIlxuICAgKiAgICAgXSxcbiAgICogICAgIFwicmVzb2x2ZV9idWxrX3JlcXVlc3RzXCI6dHJ1ZSxcbiAgICogICAgIFwibG9nX3JlcXVlc3RfYm9keVwiOmZhbHNlLFxuICAgKiAgICAgXCJyZXNvbHZlX2luZGljZXNcIjp0cnVlLFxuICAgKiAgICAgXCJleGNsdWRlX3NlbnNpdGl2ZV9oZWFkZXJzXCI6dHJ1ZSxcbiAgICogICAgIFwiaWdub3JlX3VzZXJzXCI6W1xuICAgKiAgICAgICBcImFkbWluXCIsXG4gICAqICAgICBdLFxuICAgKiAgICAgXCJpZ25vcmVfcmVxdWVzdHNcIjpbXG4gICAqICAgICAgIFwiU2VhcmNoUmVxdWVzdFwiLFxuICAgKiAgICAgICBcImluZGljZXM6ZGF0YS9yZWFkLypcIlxuICAgKiAgICAgXVxuICAgKiAgIH0sXG4gICAqICAgXCJjb21wbGlhbmNlXCI6e1xuICAgKiAgICAgXCJlbmFibGVkXCI6dHJ1ZSxcbiAgICogICAgIFwiaW50ZXJuYWxfY29uZmlnXCI6ZmFsc2UsXG4gICAqICAgICBcImV4dGVybmFsX2NvbmZpZ1wiOmZhbHNlLFxuICAgKiAgICAgXCJyZWFkX21ldGFkYXRhX29ubHlcIjpmYWxzZSxcbiAgICogICAgIFwicmVhZF93YXRjaGVkX2ZpZWxkc1wiOntcbiAgICogICAgICAgXCJpbmRleE5hbWUxXCI6W1xuICAgKiAgICAgICAgIFwiZmllbGQxXCIsXG4gICAqICAgICAgICAgXCJmaWVsZHMtKlwiXG4gICAqICAgICAgIF1cbiAgICogICAgIH0sXG4gICAqICAgICBcInJlYWRfaWdub3JlX3VzZXJzXCI6W1xuICAgKiAgICAgICBcImtpYmFuYXNlcnZlclwiLFxuICAgKiAgICAgICBcIm9wZXJhdG9yLypcIlxuICAgKiAgICAgXSxcbiAgICogICAgIFwid3JpdGVfbWV0YWRhdGFfb25seVwiOmZhbHNlLFxuICAgKiAgICAgXCJ3cml0ZV9sb2dfZGlmZnNcIjpmYWxzZSxcbiAgICogICAgIFwid3JpdGVfd2F0Y2hlZF9pbmRpY2VzXCI6W1xuICAgKiAgICAgICBcImluZGV4TmFtZTJcIixcbiAgICogICAgICAgXCJpbmRleFBhdHRlcm5zLSpcIlxuICAgKiAgICAgXSxcbiAgICogICAgIFwid3JpdGVfaWdub3JlX3VzZXJzXCI6W1xuICAgKiAgICAgICBcImFkbWluXCJcbiAgICogICAgIF1cbiAgICogICB9XG4gICAqIH1cbiAgICovXG4gIHJvdXRlci5wb3N0KFxuICAgIHtcbiAgICAgIHBhdGg6IGAke0FQSV9QUkVGSVh9L2NvbmZpZ3VyYXRpb24vYXVkaXQvY29uZmlnYCxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIGJvZHk6IHNjaGVtYS5hbnkoKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhc3luYyAoY29udGV4dCwgcmVxdWVzdCwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudCA9IGNvbnRleHQuc2VjdXJpdHlfcGx1Z2luLmVzQ2xpZW50LmFzU2NvcGVkKHJlcXVlc3QpO1xuICAgICAgbGV0IGVzUmVzcDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVzUmVzcCA9IGF3YWl0IGNsaWVudC5jYWxsQXNDdXJyZW50VXNlcignb3BlbmRpc3Ryb19zZWN1cml0eS5zYXZlQXVkaXQnLCB7XG4gICAgICAgICAgYm9keTogcmVxdWVzdC5ib2R5LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBlc1Jlc3AubWVzc2FnZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKHJlc3BvbnNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIC8qKlxuICAgKiBEZWxldGVzIGNhY2hlLlxuICAgKlxuICAgKiBTYW1wbGUgcmVzcG9uc2U6IHtcIm1lc3NhZ2VcIjpcIkNhY2hlIGZsdXNoZWQgc3VjY2Vzc2Z1bGx5LlwifVxuICAgKi9cbiAgcm91dGVyLmRlbGV0ZShcbiAgICB7XG4gICAgICBwYXRoOiBgJHtBUElfUFJFRklYfS9jb25maWd1cmF0aW9uL2NhY2hlYCxcbiAgICAgIHZhbGlkYXRlOiBmYWxzZSxcbiAgICB9LFxuICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgY2xpZW50ID0gY29udGV4dC5zZWN1cml0eV9wbHVnaW4uZXNDbGllbnQuYXNTY29wZWQocmVxdWVzdCk7XG4gICAgICBsZXQgZXNSZXNwb25zZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGVzUmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuY2FsbEFzQ3VycmVudFVzZXIoJ29wZW5kaXN0cm9fc2VjdXJpdHkuY2xlYXJDYWNoZScpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVzUmVzcG9uc2UubWVzc2FnZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKHJlc3BvbnNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIC8qKlxuICAgKiBHZXRzIHBlcm1pc3Npb24gaW5mbyBvZiBjdXJyZW50IHVzZXIuXG4gICAqXG4gICAqIFNhbXBsZSByZXNwb25zZTpcbiAgICoge1xuICAgKiAgIFwidXNlclwiOiBcIlVzZXIgW25hbWU9YWRtaW4sIHJvbGVzPVtdLCByZXF1ZXN0ZWRUZW5hbnQ9X191c2VyX19dXCIsXG4gICAqICAgXCJ1c2VyX25hbWVcIjogXCJhZG1pblwiLFxuICAgKiAgIFwiaGFzX2FwaV9hY2Nlc3NcIjogdHJ1ZSxcbiAgICogICBcImRpc2FibGVkX2VuZHBvaW50c1wiOiB7fVxuICAgKiB9XG4gICAqL1xuICByb3V0ZXIuZ2V0KFxuICAgIHtcbiAgICAgIHBhdGg6IGAke0FQSV9QUkVGSVh9L3Jlc3RhcGlpbmZvYCxcbiAgICAgIHZhbGlkYXRlOiBmYWxzZSxcbiAgICB9LFxuICAgIGFzeW5jIChjb250ZXh0LCByZXF1ZXN0LCByZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3QgY2xpZW50ID0gY29udGV4dC5zZWN1cml0eV9wbHVnaW4uZXNDbGllbnQuYXNTY29wZWQocmVxdWVzdCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlc1Jlc3BvbnNlID0gYXdhaXQgY2xpZW50LmNhbGxBc0N1cnJlbnRVc2VyKCdvcGVuZGlzdHJvX3NlY3VyaXR5LnJlc3RhcGlpbmZvJyk7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5vayh7XG4gICAgICAgICAgYm9keTogZXNSZXNwb25zZSxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYmFkUmVxdWVzdCh7XG4gICAgICAgICAgYm9keTogZXJyb3IsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgKTtcblxuICAvKipcbiAgICogVmFsaWRhdGVzIERMUyAoZG9jdW1lbnQgbGV2ZWwgc2VjdXJpdHkpIHF1ZXJ5LlxuICAgKlxuICAgKiBSZXF1ZXN0IHBheWxvYWQgaXMgYW4gRVMgcXVlcnkuXG4gICAqL1xuICByb3V0ZXIucG9zdChcbiAgICB7XG4gICAgICBwYXRoOiBgJHtBUElfUFJFRklYfS8ke0NPTkZJR1VSQVRJT05fQVBJX1BSRUZJWH0vdmFsaWRhdGVkbHMve2luZGV4TmFtZX1gLFxuICAgICAgdmFsaWRhdGU6IHtcbiAgICAgICAgcGFyYW1zOiBzY2hlbWEub2JqZWN0KHtcbiAgICAgICAgICAvLyBpbiBsZWdhY3kgcGx1Z2luIGltcGxtZW50YXRpb24sIGluZGV4TmFtZSBpcyBub3QgdXNlZCB3aGVuIGNhbGxpbmcgRVMgQVBJLlxuICAgICAgICAgIGluZGV4TmFtZTogc2NoZW1hLm1heWJlKHNjaGVtYS5zdHJpbmcoKSksXG4gICAgICAgIH0pLFxuICAgICAgICBib2R5OiBzY2hlbWEuYW55KCksXG4gICAgICB9LFxuICAgIH0sXG4gICAgYXN5bmMgKGNvbnRleHQsIHJlcXVlc3QsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBjb25zdCBjbGllbnQgPSBjb250ZXh0LnNlY3VyaXR5X3BsdWdpbi5lc0NsaWVudC5hc1Njb3BlZChyZXF1ZXN0KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVzUmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuY2FsbEFzQ3VycmVudFVzZXIoJ29wZW5kaXN0cm9fc2VjdXJpdHkudmFsaWRhdGVEbHMnLCB7XG4gICAgICAgICAgYm9keTogcmVxdWVzdC5ib2R5LFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLm9rKHtcbiAgICAgICAgICBib2R5OiBlc1Jlc3BvbnNlLFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKHJlc3BvbnNlLCBlcnJvcik7XG4gICAgICB9XG4gICAgfVxuICApO1xuXG4gIC8qKlxuICAgKiBHZXRzIGluZGV4IG1hcHBpbmcuXG4gICAqXG4gICAqIENhbGxpbmcgRVMgX21hcHBpbmcgQVBJIHVuZGVyIHRoZSBob29kLiBzZWVcbiAgICogaHR0cHM6Ly93d3cuZWxhc3RpYy5jby9ndWlkZS9lbi9lbGFzdGljc2VhcmNoL3JlZmVyZW5jZS9jdXJyZW50L2luZGljZXMtZ2V0LW1hcHBpbmcuaHRtbFxuICAgKi9cbiAgcm91dGVyLnBvc3QoXG4gICAge1xuICAgICAgcGF0aDogYCR7QVBJX1BSRUZJWH0vJHtDT05GSUdVUkFUSU9OX0FQSV9QUkVGSVh9L2luZGV4X21hcHBpbmdzYCxcbiAgICAgIHZhbGlkYXRlOiB7XG4gICAgICAgIGJvZHk6IHNjaGVtYS5vYmplY3Qoe1xuICAgICAgICAgIGluZGV4OiBzY2hlbWEuYXJyYXlPZihzY2hlbWEuc3RyaW5nKCkpLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBhc3luYyAoY29udGV4dCwgcmVxdWVzdCwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudCA9IGNvbnRleHQuc2VjdXJpdHlfcGx1Z2luLmVzQ2xpZW50LmFzU2NvcGVkKHJlcXVlc3QpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXNSZXNwb25zZSA9IGF3YWl0IGNsaWVudC5jYWxsQXNDdXJyZW50VXNlcignb3BlbmRpc3Ryb19zZWN1cml0eS5nZXRJbmRleE1hcHBpbmdzJywge1xuICAgICAgICAgIGluZGV4OiByZXF1ZXN0LmJvZHkuaW5kZXguam9pbignLCcpLFxuICAgICAgICAgIGlnbm9yZV91bmF2YWlsYWJsZTogdHJ1ZSxcbiAgICAgICAgICBhbGxvd19ub19pbmRpY2VzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IGVzUmVzcG9uc2UsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UocmVzcG9uc2UsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG5cbiAgLyoqXG4gICAqIEdldHMgYWxsIGluZGljZXMsIGFuZCBmaWVsZCBtYXBwaW5ncy5cbiAgICpcbiAgICogQ2FsbHMgRVMgQVBJICcvX2FsbC9fbWFwcGluZy9maWVsZC8qJyB1bmRlciB0aGUgaG9vZC4gc2VlXG4gICAqIGh0dHBzOi8vd3d3LmVsYXN0aWMuY28vZ3VpZGUvZW4vZWxhc3RpY3NlYXJjaC9yZWZlcmVuY2UvY3VycmVudC9pbmRpY2VzLWdldC1tYXBwaW5nLmh0bWxcbiAgICovXG4gIHJvdXRlci5nZXQoXG4gICAge1xuICAgICAgcGF0aDogYCR7QVBJX1BSRUZJWH0vJHtDT05GSUdVUkFUSU9OX0FQSV9QUkVGSVh9L2luZGljZXNgLFxuICAgICAgdmFsaWRhdGU6IGZhbHNlLFxuICAgIH0sXG4gICAgYXN5bmMgKGNvbnRleHQsIHJlcXVlc3QsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBjb25zdCBjbGllbnQgPSBjb250ZXh0LnNlY3VyaXR5X3BsdWdpbi5lc0NsaWVudC5hc1Njb3BlZChyZXF1ZXN0KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVzUmVzcG9uc2UgPSBhd2FpdCBjbGllbnQuY2FsbEFzQ3VycmVudFVzZXIoJ29wZW5kaXN0cm9fc2VjdXJpdHkuaW5kaWNlcycpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2Uub2soe1xuICAgICAgICAgIGJvZHk6IGVzUmVzcG9uc2UsXG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UocmVzcG9uc2UsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRXNFcnJvclJlc3BvbnNlKGVycm9yOiBhbnkpIHtcbiAgaWYgKGVycm9yLnJlc3BvbnNlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVzRXJyb3JSZXNwb25zZSA9IEpTT04ucGFyc2UoZXJyb3IucmVzcG9uc2UpO1xuICAgICAgcmV0dXJuIGVzRXJyb3JSZXNwb25zZS5yZWFzb24gfHwgZXJyb3IucmVzcG9uc2U7XG4gICAgfSBjYXRjaCAocGFyc2luZ0Vycm9yKSB7XG4gICAgICByZXR1cm4gZXJyb3IucmVzcG9uc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiBlcnJvci5tZXNzYWdlO1xufVxuXG5mdW5jdGlvbiBlcnJvclJlc3BvbnNlKHJlc3BvbnNlOiBLaWJhbmFSZXNwb25zZUZhY3RvcnksIGVycm9yOiBhbnkpIHtcbiAgcmV0dXJuIHJlc3BvbnNlLmN1c3RvbSh7XG4gICAgc3RhdHVzQ29kZTogZXJyb3Iuc3RhdHVzQ29kZSxcbiAgICBib2R5OiBwYXJzZUVzRXJyb3JSZXNwb25zZShlcnJvciksXG4gIH0pO1xufVxuIl19