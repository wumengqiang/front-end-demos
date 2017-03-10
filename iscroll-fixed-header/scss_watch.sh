#! /bin/bash

# 需要安装sass 安装方法 [sudo] gem install sass
base_dir=$(dirname $0)
sass --scss  --watch --sourcemap=none $base_dir/scss:$base_dir/styles
