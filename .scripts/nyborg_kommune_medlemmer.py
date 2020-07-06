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



page = requests.get("https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Vibeke-Ejlertsen", verify=False).text
parsed_page = BeautifulSoup(page, "lxml")


urls = []

for link in parsed_page.find_all("a"):
    if "MedlemmerByraadet" in link["href"]:
        urls.append("https://www.nyborg.dk" + link["href"])


print(urls)
   