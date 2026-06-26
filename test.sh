#!/bin/bash

set -e

############################################################## declare functions

function includes () {
  local target="$1"
  shift

  local it
  for it in "$@"; do
    case "$it" in
      "$target" | "$target="* )
        return 0
        ;;
    esac
  done

  return 1
}

function jestCommand () {
  echo "🔥 npx jest --passWithNoTests $@"

  npx jest --passWithNoTests "$@"
}

function setupStorage () {
  blockTitle 'setup db with master seeds.'

  npm run db:teardown || echo 'skip error on teardown'
  npm run db:setup
  npm run db:seed:master
}

function testWithEmpty () {
  blockTitle 'test with master seeds only.'

  jestCommand "$@" tests/empty/__tests__/
  jestCommand --detectOpenHandles tests/empty/_orders/
}

function testWithSeeded () {
  blockTitle 'test with master and development seeds.'

  npm run db:seed:dev
  jestCommand "$@" tests/__tests__/
  jestCommand --detectOpenHandles tests/_orders/
}

function blockTitle () {
  echo ''
  echo '//////////////////////////////////////////////////'
  echo '//'
  echo "//    $1"
  echo '//'
  echo '//////////////////////////////////////////////////'
  echo ''
}

function initialize () {
  blockTitle 'Start to test 🎉'
  date
}

function terminalize () {
  blockTitle 'Finish to test 🍵'
  date
}

################################################################### execute main

initialize

setupStorage # teardown > setup > seed:master

if includes --maxWorkers "$@"; then
  defaultMaxWorkers=''
else
  defaultMaxWorkers='--maxWorkers=5'
fi

if [ $# = 0 ]; then
  testWithEmpty "$defaultMaxWorkers"
  testWithSeeded "$defaultMaxWorkers"

  exit 0
fi

mode="${1:-all}"
target="$2"

if [ "$mode" = '--empty' ]; then
  if [ -z "$target" ]; then
    testWithEmpty "$defaultMaxWorkers"
  else
    jestCommand "${@:2}"
  fi

  exit 0
fi

if [ "$mode" = '--seeded' ]; then
  if [ -z "$target" ]; then
    testWithSeeded "$defaultMaxWorkers"
  else
    npm run db:seed:dev
    jestCommand "${@:2}"
  fi

  exit 0
fi

npm run db:seed:dev
jestCommand "$@"
