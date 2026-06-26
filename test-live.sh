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

function testWithEmpty () {
  blockTitle 'test with master seeds only.'

  jestCommand "$@" tests/empty/__tests__/
  jestCommand --detectOpenHandles tests/empty/_orders/
}

function testWithSeeded () {
  blockTitle 'test with master and development seeds.'

  jestCommand "$@" tests/__tests__/
  jestCommand --detectOpenHandles tests/_orders/
}

function blockTitle () {
  echo ''
  echo '////////////////////////////////////////////////////////////////////////////////'
  echo '//'
  echo "//    $1"
  echo '//'
  echo '////////////////////////////////////////////////////////////////////////////////'
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
    jestCommand "${@:2}"
  fi

  exit 0
fi

jestCommand "$@"
