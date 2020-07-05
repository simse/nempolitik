import re

import requests
import requests_cache

requests_cache.install_cache('demo_cache')

from bs4 import BeautifulSoup

import slug

import urllib
import json


def parse_politician(POLITICIAN_URL):
    # Fetch page
    page_html = requests.get(POLITICIAN_URL).text
    parsed_page = BeautifulSoup(page_html, "lxml")

    # Find name
    name = parsed_page.select(".indhold h1")[0].text.split(",")[0]

    first_name = ""
    middle_name = ""
    last_name = ""

    name_parts = name.split(" ")
    if len(name_parts) == 2:
        first_name = name_parts[0]
        last_name = name_parts[1]

    if len(name_parts) == 3:
        first_name = name_parts[0]
        middle_name = name_parts[1]
        last_name = name_parts[2]

    print(first_name)
    print(middle_name)
    print(last_name)


    # Find party
    part_text = parsed_page.select(".indhold h1")[0].text.split(",")[1]
    party_map = {
        " Socialdemokratiet": 1,
        " Radikale Venstre": 4,
        " Det Konservative Folkeparti": 5,
        " Socialistisk Folkeparti": 7,
        " Liberal Alliance": 8,
        " Dansk Folkeparti": 3,
        " Venstre": 2,
        " Enhedslisten": 9
    }
    party_id = party_map[part_text]

    print(party_id)


    # Find phone number
    info = parsed_page.select(".brodtekst table p")[0].text

    pattern = re.compile(r"[0-9]{8}")

    phone_number = re.findall(pattern, info.replace(" ", ""))[0]

    print(phone_number)

    # Find email
    pattern = re.compile(r"(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])")
    email = re.findall(pattern, info.replace(" ", ""))[0]
    print(email)

    # Find picture
    user_id = POLITICIAN_URL.split("wm")[1]
    photo_id = parsed_page.select(".visFuldSkaermLink img")[1]["src"].split("id=")[1]
    photo_url = "https://www.rsyd.dk/includes/billeder/image.asp?size=orig&id={}&fullsize=orig".format(photo_id)

    print(photo_url)

    # generate slug
    name_slug = slug.slug(name.replace("æ", "ae").replace("ø", "o").replace("å", "aa"))
    print(name_slug)

    # Download picture
    urllib.request.urlretrieve(photo_url, "region_syddanmark/{}.jpg".format(name_slug))

    myFile = {'files.photo':("{}.jpg".format(name_slug), open("region_syddanmark/{}.jpg".format(name_slug), 'rb'), 'image/jpeg')}

    # Create entry
    response = requests.post("https://editor.nempolitik.dk/politicians", data={"data":json.dumps({
        "first_name": first_name,
        "middle_name": middle_name,
        "last_name": last_name,
        "slug": name_slug,
        "phone_number": phone_number,
        "email": email,
        "political_party": party_id
    })}, files=myFile).json()
    print("Politician saved!")


urls = [
    # "https://www.rsyd.dk/wm521850",
    # "https://www.rsyd.dk/wm506697",
]

for url in urls:
    parse_politician(url)