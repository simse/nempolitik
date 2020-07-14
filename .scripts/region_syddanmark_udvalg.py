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

politicians = {}


for name in glob.glob('/home/simon/nempolitik/content/politicians/*.md'):
    meta = frontmatter.load(name)

    politicians[meta["name"]] = meta["id"]



def parse_group(URL):

    page = requests.get(URL, verify=False).text
    parsed_page = BeautifulSoup(page, "lxml")

    # Get name
    name = parsed_page.select(".indhold h1")[0].text.strip()
    print(name)

    chairman = ""
    vice_chairman = ""

    members = []

    print("\nMedlemmer:")
    # Find all members
    for member in parsed_page.select(".brodtekst ul li"):      
        text = member.text.replace("  ", " ")
        text = text.replace("\xa0", " ")
        text = text.replace("\n", " ")
        # print(text)

        try:
            member_name = text.split(", ")[0].strip()
            member_id = politicians[member_name]
        except KeyError:
            print("invalid link")
            continue

        if "næstformand" in member.text:
            vice_chairman = member_id

        if "formand" in member.text:
            chairman = member_id

        members.append(member_id)

        print(" - {}".format(member_name))

    group_object = frontmatter.loads("---\n---")
    group_object["id"] = str(uuid.uuid4())
    group_object["name"] = name
    group_object["political_entities"] = "c38f015c-ffgg-44rd-54fd-d96f41578453"
    group_object["politicians"] = members

    if chairman:
        group_object["chairman"] = chairman

    if vice_chairman:
        group_object["vice_chairman"] = vice_chairman

    file_name = "/home/simon/nempolitik/content/political_entity_groups/region-syddanmark-{}.md".format(slug.slug(name))

    # print(file_name)
    # print(frontmatter.dumps(group_object))

    with open(file_name, "w+") as file:
        file.write(frontmatter.dumps(group_object))

    print("Group saved!")

urls = ["https://www.rsyd.dk/wm506736", "https://www.rsyd.dk/wm506976", "https://www.rsyd.dk/wm506978", "https://www.rsyd.dk/wm506979", "https://www.rsyd.dk/wm506980", "https://www.rsyd.dk/wm506981", "https://www.rsyd.dk/wm506982", "https://www.rsyd.dk/wm506983", "https://www.rsyd.dk/wm506985", "https://www.rsyd.dk/wm506986"]

for url in urls:
    parse_group(url)