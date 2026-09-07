#!/bin/bash

set -e

############################################################## declare functions

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

if [ $# = 0 ]; then
  testWithEmpty
  testWithSeeded

  exit 0
fi

mode="${1:-all}"
shift

# What follows the mode is jest flags until the first argument that is not one,
# and that one is the target. Reading $2 alone put a flag in the target slot,
# so a call that named no group ran jest with no group either.
target=''
for it in "$@"; do
  case "$it" in
    -* )
      ;;
    * )
      target="$it"
      break
      ;;
  esac
done

if [ "$mode" = '--empty' ]; then
  if [ -z "$target" ]; then
    testWithEmpty "$@"
  else
    jestCommand "$@"
  fi

  exit 0
fi

if [ "$mode" = '--seeded' ]; then
  if [ -z "$target" ]; then
    testWithSeeded "$@"
  else
    jestCommand "$@"
  fi

  exit 0
fi

jestCommand "$mode" "$@"
