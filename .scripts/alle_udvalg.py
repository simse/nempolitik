import glob
import frontmatter
import re
import zipfile
import urllib3
import shutil
import uuid

urllib3.disable_warnings()

import requests
import requests_cache

requests_cache.install_cache('demo_cache')
from bs4 import BeautifulSoup
import slug

import json

page = requests.get("https://www.ft.dk/da/udvalg/udvalgene", verify=False).text
parsed_page = BeautifulSoup(page, "lxml")

links = []

for link in parsed_page.select(".link-list-spot-a-link"):
    links.append(link.find("a")["href"] + "/medlemsoversigt")

print(links)