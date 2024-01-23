#!/bin/bash

export VERSION=$1
yarn tsc
git add .
git commit -m "v$VERSION"
git tag $VERSION
git push
git push origin $VERSION
npm publish