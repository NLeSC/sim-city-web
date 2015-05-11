#!/bin/bash
# Deploy website to the webserver
#
# The webserver is assumed to be configured with ssh/scp with hostname
# sim-city. The username, hostname and SSH key must be pre-configured in
# "~/.ssh/config".
#
# The sim-city host is assumed to have the following writable directories:
# /srv/staging/app/ and /srv/https/app/
# The latter directory is assumed to be served by the webserver on sim-city.
# The webserver must be configured to follow symlinks.
#
# Deployment will fail if the same staging name is used twice. If the staging
# name is not specified, it will fail if the same git commit is deployed
# twice. This entices users to commit all changes before deployment.
#
# Use different release names to indicate development or tag deployments.

RELEASENAME=current
NAME=$(git rev-parse HEAD)

if [[ $# -ge 1 ]]; then
	RELEASENAME=$1
fi
if [[ $# -eq 2 ]]; then
	NAME=$2
fi

echo "Usage: $0 [RELEASE [NAME]]"

confirm () {
    # call with a prompt string or use a default
    read -r -p "${1:-Are you sure?} [y/N] " response
    case $response in
        [yY][eE][sS]|[yY]) 
            true
            ;;
        *)
            false
            ;;
    esac
}

NOW=$(date +"%F_%H%M%S")
FILE="dist.$NOW.tar.bz2"
STAGING=/srv/staging/app/$NAME
RELEASE=/srv/https/app/$RELEASENAME

confirm "Upload to $STAGING and release to $RELEASE?" &&
echo "==== RUNNING GRUNT ====" && grunt clean && grunt && cd dist &&
echo "==== COMPRESSING   ====" && tar cjf $FILE * .[^.]* &&
echo "==== COPYING FILE  ====" && ssh sim-city "mkdir $STAGING" && scp $FILE sim-city:$STAGING &&
echo "==== RELEASING     ====" && ssh sim-city "cd $STAGING && tar xjf $FILE && rm $FILE && ln -s $STAGING ../$RELEASENAME && mv -T ../$RELEASENAME $RELEASE" &&
rm $FILE

