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
    name = parsed_page.select("article.content h1")[0].text.strip()
    print(name)

    chairman = ""
    vice_chairman = ""

    members = []

    print("\nMedlemmer:")
    # Find all members
    for member in parsed_page.select(".article-body a"):

        if "/MedlemmerByraadet/" in member["href"]:
            text = member.text.replace("  ", " ")
            text = text.replace("\xa0", " ")
            text = text.replace("\n", " ")

            if ("Sambanther" in text) and ("Rameesh" not in text):
                text = text.replace("T. Sambanther", "Rameesh T. Sambanther")
                text = text.replace("  ", " ")
            print(text)

            member_name = text.split(" (")[0]
            member_id = politicians[member_name]

            if "næstformand" in text.split(" (")[1]:
                vice_chairman = member_id

            if ("formand" in text.split(" (")[1]) and vice_chairman != member_id:
                chairman = member_id

            members.append(member_id)

            print(" - {}".format(member_name))

    # exit(0)


    group_object = frontmatter.loads("---\n---")
    group_object["id"] = str(uuid.uuid4())
    group_object["name"] = name
    group_object["political_entities"] = "c38f015c-5e66-4b3c-8433-d96f41564921"
    group_object["politicians"] = members

    if chairman:
        group_object["chairman"] = chairman

    if vice_chairman:
        group_object["vice_chairman"] = vice_chairman

    file_name = "/home/simon/nempolitik/content/political_entity_groups/nyborg-kommune-{}.md".format(slug.slug(name))

    # print(file_name)
    # print(frontmatter.dumps(group_object))

    with open(file_name, "w+") as file:
        file.write(frontmatter.dumps(group_object))

    print("Group saved!")

urls = ["https://www.nyborg.dk/da/Politik/ByraadUdvalg/%c3%98konomiudvalget", "https://www.nyborg.dk/da/Politik/ByraadUdvalg/Besk%c3%a6ftigelsesudvalget", "https://www.nyborg.dk/da/Politik/ByraadUdvalg/Erhvervs-og-udviklingsudvalget", "https://www.nyborg.dk/da/Politik/ByraadUdvalg/Skole-og-Dagtilbudsudvalget", "https://www.nyborg.dk/da/Politik/ByraadUdvalg/Social-og-Familieudvalget", "https://www.nyborg.dk/da/Politik/ByraadUdvalg/Sundheds-og-Forebyggelsesudvalget", "https://www.nyborg.dk/da/Politik/ByraadUdvalg/%c3%86ldreudvalget", "https://www.nyborg.dk/da/Politik/ByraadUdvalg/Kultur-og-Fritidsudvalget", "https://www.nyborg.dk/da/Politik/ByraadUdvalg/Teknik-og-Milj%c3%b8udvalget"]

for url in urls:
    parse_group(url)