#!/bin/bash
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

set -e
echo "begin build plugin with local source"
plugin_file=./script/plugin_list
if [ ! -f "$plugin_file" ]; then
  echo "plugin_list is not exist"
  exit 0
fi

echo "plugin_list exist"

# 构建插件集成的answer
cmd="./answer build"
for repo in `cat $plugin_file`
do
  echo ${repo}
  cmd=$cmd" --with "${repo}
done

echo "cmd is "$cmd
$cmd

if [ ! -f "./new_answer" ]; then
  echo "new_answer is not exist build failed"
  exit 1
fi

# 备份原文件并替换
if [ -f "./answer" ]; then
  backup_name="answer_backup_$(date +%Y%m%d_%H%M%S)"
  echo "backing up existing answer to $backup_name"
  mv answer "$backup_name"
fi

mv new_answer answer

echo "build completed successfully!"
echo "checking plugins..."
./answer plugin
