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



#URL = "https://www.ft.dk/da/udvalg/udvalgene/beu/medlemsoversigt"

def parse_group(URL):

    page = requests.get(URL, verify=False).text
    parsed_page = BeautifulSoup(page, "lxml")

    # Get name
    name = parsed_page.select(".breadcrum-item")[3].text.strip()
    print(name)

    try:
        # Find chairman
        chairman = parsed_page.select(".committeemembers__info a")[0].text.split(" (")[0].replace("  ", " ")
        print("Formand: {}".format(chairman))
        chairman = politicians[chairman]
    except(IndexError):
        chairman = None

    try:
        # Find chairman
        vice_chairman = parsed_page.select(".committeemembers__info a")[1].text.split(" (")[0].replace("  ", " ")
        print("Næstformand: {}".format(vice_chairman))
        vice_chairman = politicians[vice_chairman]
    except(IndexError):
        vice_chairman = None

    members = []

    print("\nMedlemmer:")
    # Find all members
    for member in parsed_page.select(".listespot-wrapper__data-item-url"):
        try:
            member_name = member.find_all("td")[2].text.strip().replace("  ", " ")
            member_id = politicians[member_name]

            members.append(member_id)

            print(" - {}".format(member_name))
        except(KeyError):
            pass


    group_object = frontmatter.loads("---\n---")
    group_object["id"] = str(uuid.uuid4())
    group_object["name"] = name
    group_object["political_entities"] = "779a159a-ba3c-4c24-8eaf-547790b15872"
    group_object["politicians"] = members

    if chairman:
        group_object["chairman"] = chairman

    if vice_chairman:
        group_object["vice_chairman"] = vice_chairman

    file_name = "/home/simon/nempolitik/content/political_entity_groups/folketinget-{}.md".format(slug.slug(name))

    # print(file_name)
    # print(frontmatter.dumps(group_object))

    with open(file_name, "w+") as file:
        file.write(frontmatter.dumps(group_object))

    print("Group saved!")

urls = ['https://www.ft.dk/da/udvalg/udvalgene/beu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/bou/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/buu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/upn/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/eru/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/euu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/fiu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/fou/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/fæu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/gru/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/ifu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/kiu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/kef/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/kuu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/liu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/mof/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/§71/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/reu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/sau/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/sou/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/suu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/tru/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/ufu/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/uru/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/uui/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/ufo/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/ulø/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/ufs/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/uvp/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/uer/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/uet/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/uuf/medlemsoversigt', 'https://www.ft.dk/da/udvalg/udvalgene/upv/medlemsoversigt']

for url in urls:
    parse_group(url)