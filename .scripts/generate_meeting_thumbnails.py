import re
import os
import zipfile
import shutil
import uuid
import shlex
import glob
import frontmatter
from fuzzywuzzy import fuzz
from fuzzywuzzy import process
import subprocess


import requests
import requests_cache

requests_cache.install_cache('demo_cache')
from bs4 import BeautifulSoup
import slug

import json
import pendulum
import wget
from loguru import logger

logger.info("Traversing all meetings with missing thumbnails..")
for name in glob.glob('/home/simon/nempolitik/content/political_entity_groups/*.md'):
    if "folketinget" in name:
        meta = frontmatter.load(name)

        try:
            for meeting in meetings:
                parse_meeting(meeting)


        except(KeyError):
            pass

def parse_meeting(meeting):
    if meeting.thumbnail_stream:
        logger.warning("Meeting already has thumbnails, skipping...")
        return

    logger.info("Downloading meeting: {}", meeting.name)
    filepath = wget.download(meeting.video_url.replace("/a.mp4", ""))
    logger.success("Video file downloaded.")

    logger.info("Generating thumbnail sprite")
    subprocess.call("python generate_thumbnails.py {}".format(filepath), shell=True)
    logger.success("Sprite generated!")

    logger.info("Moving sprite to static folder")
    file = "thumbs/" + filepath.split("/")[1]
    sprite = file.replace(".mp4", ".jpg")
    vtt = file.replace(".mp4", ".vtt")
    # shutil.copy(sprite)
