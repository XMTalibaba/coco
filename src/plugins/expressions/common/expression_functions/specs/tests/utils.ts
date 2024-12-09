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

import { mapValues } from 'lodash';
import { AnyExpressionFunctionDefinition } from '../../types';
import { ExecutionContext } from '../../../execution/types';

/**
 * Takes a function spec and passes in default args,
 * overriding with any provided args.
 */
export const functionWrapper = (spec: AnyExpressionFunctionDefinition) => {
  const defaultArgs = mapValues(spec.args, (argSpec) => argSpec.default);
  return (
    context: object | null,
    args: Record<string, any> = {},
    handlers: ExecutionContext = {} as ExecutionContext
  ) => spec.fn(context, { ...defaultArgs, ...args }, handlers);
};
