SHELL := /bin/bash
# 定义常量
COLOR_RESET ?= \033[0m
COLOR_GREEN ?= \033[32;01m
# 定义变量
NODE_VERSION := $(shell node --version | sed 's/^v//')
YARN_VERSION := $(shell yarn --version)
# 构建项目
build: install
	yarn run build
# 安装环境
env:
	asdf install
# 格式化代码
fmt:
	yarn run format
# 自动修复代码格式
fix:
	yarn run format:fix
# 确保依赖是最新的
install: version
ifeq ($(wildcard node_modules),)
	yarn install --frozen-lockfile
endif
# 查看提交历史记录
log:
	git log --oneline --decorate --graph --all
# 推送代码
push:
	git push
# 打印版本信息
version:
	@echo -e "$(COLOR_GREEN)"
	@echo "=============================="
	@echo "  Node.js: v $(NODE_VERSION) $(shell which node)"
	@echo "  Yarn:    v $(YARN_VERSION) $(shell which yarn)"
	@echo "=============================="
	@echo -e "$(COLOR_RESET)"
