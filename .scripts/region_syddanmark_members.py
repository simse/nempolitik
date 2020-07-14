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

urls = []

page = requests.get("https://www.rsyd.dk/wm436558").text
parsed_page = BeautifulSoup(page, "lxml")

for link in parsed_page.select(".brodtekst a"):
    url = ""

    try:
        url = link["href"]
    except KeyError:
        pass

    if "wm" in url:
        urls.append("https://www.rsyd.dk" + url)

print(list(set(urls)))