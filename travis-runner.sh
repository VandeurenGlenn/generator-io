#!/bin/bash -e
set -o pipefail

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]  && [ "$TRAVIS_NODE_VERSION" = "5.3" ]
then
  git config --global user.email "$GITHUB_BOT_EMAIL"
  git config --global user.name "auto deployer"

  run_build() {
    echo Building...
    git submodule update --init --recursive && gulp
  }

  run_build
elif [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]  && [ "$TRAVIS_NODE_VERSION" != "5.3" ]
then
  echo "Do Nothing, only deploy with Node 5.3"
else
  npm test
fi
