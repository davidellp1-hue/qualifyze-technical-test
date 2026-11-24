#!/bin/sh
# Runs the tests inside the Docker image and copies the reports to the project root.
# No folder is shared with the container, so it works the same with Docker and with
# rootless Podman: the copied files always belong to the user who runs the script.
# Extra arguments are passed to Playwright (e.g. --project=webkit).

container=saucedemo-ui-run

docker rm -f "$container" >/dev/null 2>&1
docker run --name "$container" --init --ipc=host -e BASE_URL saucedemo-ui-tests "$@"
status=$?

for dir in test-results playwright-report allure-results; do
  rm -rf "$dir"
  docker cp "$container:/app/$dir" "$dir" >/dev/null 2>&1
done
docker rm "$container" >/dev/null

exit $status
