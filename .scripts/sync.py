import requests
import time
import json
import subprocess
from loguru import logger

data = {
    "operationName": "latestBuildByStatus",
    "variables": {
		"siteId": "535b0a4e-548a-4110-81d6-11bc914f4c8e",
		"branch": "master",
		"runnerType": "BUILDS",
		"status": "SUCCESS"
	},
    "query": "query latestBuildByStatus($siteId: UUID!, $branch: String!, $runnerType: BuildRunnerType!, $status: BuildStatus!) {\n  latestBuildByStatus(siteId: $siteId, branch: $branch, runnerType: $runnerType, status: $status) {\n    ...buildFields\n    __typename\n  }\n}\n\nfragment buildFields on Build {\n  id\n  siteId\n  siteName\n  branch\n  buildType\n  buildStatus\n  structuredBuild\n  deployStartedAt\n  deployEndedAt\n  startedAt\n  cdnVendor\n  createdAt\n  duration\n  endedAt\n  runnerType\n  source\n  commit {\n    id\n    sha\n    name\n    avatarUrl\n    message\n    __typename\n  }\n  author {\n    id\n    name\n    avatarUrl\n    __typename\n  }\n  pullRequest {\n    id\n    title\n    __typename\n  }\n  __typename\n}\n"
}

headers = {
    "authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMzdiOThlMi00MWJlLTQwNmQtODVkMi1hMzUxNzhlNzZkODIiLCJlbWFpbCI6ImZhdHRkZXZAZ21haWwuY29tIiwiaWF0IjoxNTkzNTI1NjcxLCJpc3MiOiJHYXRzYnkgSW5jIiwic3ViIjoiZmF0dGRldkBnbWFpbC5jb20ifQ.C3WTOYfZ0FqUkXQZZ1gmPcPJFMVVWIc7-bpv1p15ezyj_9HgsMXNRCpZ3WFAKH8jROYcQ5St7TKAjsZLXX1LIzp8lg4VZipA1adHavYWw3RUn66Lxsace-j-sLFoz8uiZpORgJgVJ99vZUpCDweiAHpUhudAucYv5l5jQP39gwoXX5ML55DqhqMnM3ryT1ur93wQev5czveBhu3JAN7_r0FCoGM4bRMgfQhIyaG_KOkiflbrlrGLcs3kFCuyQRP3aNC4BZahKwG8c5k6OQUK3HVhNBeU04sf7O1Fn9Jj_tvLdtqODWWSBZcTrc6gv8sxYRIhIBJwSDXP3h_sz7IL-MEsoBTFPLKGFBGJjg-d7Q1rrmsq7nZMD-9LBnWPoLeApUEqo_VEvm9ZKAH0VSLTA9UwUUAHrjrzl2Oq0ftz506pPWPgJGrBZylQ4qQjqGbb1eFYxXO0t_FPqZ8G13NZb0_mycV_w-rUfoYZOHT99MkX6Yq3yS-NpA7c5yTuxNC3imV1nVxkkMXkh7P8AsOYa-hDc6asiY7Yoq_gZRoy3brievuXZvDTBYtNPlz0rlYoVBpqaZ3se87chSWGBbVI2aqnnLnWVMO1n_h0zDYlZjxIGhUgcWpHjgz3nqnj_21cdytCsE6K98FqgDqP7VbFjLbm1dAx9q_oPYSd6lXhT4U"
}

seen_deploy_ids = []

logger.info("Starting Gatsby Cloud sync loop")

while True:
    response = requests.post("https://api.gatsbyjs.com/graphql", json=data, headers=headers)

    if response.status_code != 200:
        logger.error("Couldn't communicate with Gatsby Cloud, auth error?")
        time.sleep(10)
        continue

    status = response.json()["data"]["latestBuildByStatus"]

    if status["buildStatus"] == "SUCCESS":
        if status["id"] not in seen_deploy_ids:
            logger.info("Pulling latest deploy...")
            subprocess.call("rclone sync s3:/nempolitik /nempolitik --checkers=50 --transfers=50 --filter \"- Caddyfile\"> \"/var/log/rclone.log\" 2>&1", shell=True)
            logger.success("Deploy pulled.")

            seen_deploy_ids.append(status["id"])
        else:
            logger.info("No new deploy found")

    time.sleep(10)