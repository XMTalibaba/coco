/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { i18n } from '@kbn/i18n';
import { first } from 'rxjs/operators';
import { TypeOf, schema } from '@kbn/config-schema';
import { RecursiveReadonly } from '@kbn/utility-types';
import { deepFreeze } from '@kbn/std';

import { PluginStart } from '../../../../src/plugins/data/server';
import { CoreSetup, PluginInitializerContext } from '../../../../src/core/server';
import { configSchema } from '../config';
import loadFunctions from './lib/load_functions';
import { functionsRoute } from './routes/functions';
import { validateEsRoute } from './routes/validate_es';
import { runRoute } from './routes/run';
import { ConfigManager } from './lib/config_manager';

const experimentalLabel = i18n.translate('timelion.uiSettings.experimentalLabel', {
  defaultMessage: '实验性',
});

/**
 * Describes public Timelion plugin contract returned at the `setup` stage.
 */
export interface PluginSetupContract {
  uiEnabled: boolean;
}

export interface TimelionPluginStartDeps {
  data: PluginStart;
}

/**
 * Represents Timelion Plugin instance that will be managed by the Kibana plugin system.
 */
export class Plugin {
  constructor(private readonly initializerContext: PluginInitializerContext) {}

  public async setup(core: CoreSetup): Promise<RecursiveReadonly<PluginSetupContract>> {
    const config = await this.initializerContext.config
      .create<TypeOf<typeof configSchema>>()
      .pipe(first())
      .toPromise();

    const configManager = new ConfigManager(this.initializerContext.config);

    const functions = loadFunctions('series_functions');

    const getFunction = (name: string) => {
      if (functions[name]) {
        return functions[name];
      }

      throw new Error(
        i18n.translate('timelion.noFunctionErrorMessage', {
          defaultMessage: '没有此类函数：{name}',
          values: { name },
        })
      );
    };

    const logger = this.initializerContext.logger.get('timelion');

    const router = core.http.createRouter();

    const deps = {
      configManager,
      functions,
      getFunction,
      logger,
      core,
    };

    functionsRoute(router, deps);
    runRoute(router, deps);
    validateEsRoute(router, core);

    core.uiSettings.register({
      'timelion:es.timefield': {
        name: i18n.translate('timelion.uiSettings.timeFieldLabel', {
          defaultMessage: '时间字段',
        }),
        value: '@timestamp',
        description: i18n.translate('timelion.uiSettings.timeFieldDescription', {
          defaultMessage: '使用 {esParam} 时包含时间戳的默认字段',
          values: { esParam: '.es()' },
        }),
        category: ['timelion'],
        schema: schema.string(),
      },
      'timelion:es.default_index': {
        name: i18n.translate('timelion.uiSettings.defaultIndexLabel', {
          defaultMessage: '默认索引',
        }),
        value: '_all',
        description: i18n.translate('timelion.uiSettings.defaultIndexDescription', {
          defaultMessage: '要使用 {esParam} 搜索的默认 Elasticsearch 索引',
          values: { esParam: '.es()' },
        }),
        category: ['timelion'],
        schema: schema.string(),
      },
      'timelion:target_buckets': {
        name: i18n.translate('timelion.uiSettings.targetBucketsLabel', {
          defaultMessage: '目标存储桶',
        }),
        value: 200,
        description: i18n.translate('timelion.uiSettings.targetBucketsDescription', {
          defaultMessage: '使用自动时间间隔时想要的存储桶数目',
        }),
        category: ['timelion'],
        schema: schema.number(),
      },
      'timelion:max_buckets': {
        name: i18n.translate('timelion.uiSettings.maximumBucketsLabel', {
          defaultMessage: '最大存储桶数',
        }),
        value: 2000,
        description: i18n.translate('timelion.uiSettings.maximumBucketsDescription', {
          defaultMessage: '单个数据源可以返回的最大存储桶数目',
        }),
        category: ['timelion'],
        schema: schema.number(),
      },
      'timelion:min_interval': {
        name: i18n.translate('timelion.uiSettings.minimumIntervalLabel', {
          defaultMessage: '最小时间间隔',
        }),
        value: '1ms',
        description: i18n.translate('timelion.uiSettings.minimumIntervalDescription', {
          defaultMessage: '使用“自动”时将计算的最小时间间隔',
          description:
            '"auto" is a technical value in that context, that should not be translated.',
        }),
        category: ['timelion'],
        schema: schema.string(),
      },
      'timelion:graphite.url': {
        name: i18n.translate('timelion.uiSettings.graphiteURLLabel', {
          defaultMessage: 'Graphite URL',
          description:
            'The URL should be in the form of https://www.hostedgraphite.com/UID/ACCESS_KEY/graphite',
        }),
        value: config.graphiteUrls && config.graphiteUrls.length ? config.graphiteUrls[0] : null,
        description: i18n.translate('timelion.uiSettings.graphiteURLDescription', {
          defaultMessage:
            '{experimentalLabel} Graphite 主机的 <a href=\"https://www.hostedgraphite.com/UID/ACCESS_KEY/graphite\" target=\"_blank\" rel=\"noopener\">URL</a>',
          values: { experimentalLabel: `<em>[${experimentalLabel}]</em>` },
        }),
        type: 'select',
        options: config.graphiteUrls || [],
        category: ['timelion'],
        schema: schema.nullable(schema.string()),
      },
      'timelion:quandl.key': {
        name: i18n.translate('timelion.uiSettings.quandlKeyLabel', {
          defaultMessage: 'Quandl 密钥',
        }),
        value: 'someKeyHere',
        description: i18n.translate('timelion.uiSettings.quandlKeyDescription', {
          defaultMessage: '{experimentalLabel} 来自 www.quandl.com 的 API 密钥',
          values: { experimentalLabel: `<em>[${experimentalLabel}]</em>` },
        }),
        category: ['timelion'],
        schema: schema.string(),
      },
    });

    return deepFreeze({ uiEnabled: config.ui.enabled });
  }

  public start() {
    this.initializerContext.logger.get().debug('Starting plugin');
  }

  public stop() {
    this.initializerContext.logger.get().debug('Stopping plugin');
  }
}
