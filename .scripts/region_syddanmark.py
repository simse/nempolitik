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


def parse_ft_date(day, month, year):
    day_number = int(day)
    month_number = 0
    year_number = int(year)

    month_map = {
        "januar": 1,
        "februar": 2,
        "marts": 3,
        "april": 4,
        "maj": 5,
        "juni": 6,
        "juli": 7,
        "august": 8,
        "september": 9,
        "oktober": 10,
        "november": 11,
        "december": 12
    }

    month_number = month_map[month]

    return f"{year_number}-{month_number:02}-{day_number:02}"


def process_name(string):
    string = string.strip()
    string = string.replace("  ", " ")
    string = string[:1].upper() + string[1:]

    return string



def parse_politician(POLITICIAN_URL):
    page = requests.get(POLITICIAN_URL, verify=False).text
    parsed_page = BeautifulSoup(page, "lxml")

    nonBreakSpace = u'\xa0'
    parsed_page.prettify(formatter=lambda s: s.replace(u'\xa0', ' '))

    # Find name
    name = parsed_page.select(".indhold h1")[0].text.split(", ")[0].strip()

    print(name)

    # print(parsed_page.select("article.content h1")[0])

    # Find party
    party_letter = parsed_page.select(".indhold h1")[0].text.split(", ")[1].strip()
    party_map = {
        "Socialdemokratiet": "f07a876a-64af-4f30-8056-e28ec39a7ca3",
        "Radikale Venstre": "a58e77a0-5ef8-45c0-a5bd-aa8300a5b1b2",
        "Det Konservative Folkeparti": "8899a215-1be5-46f2-bd49-2f239f560371",
        "Socialistisk Folkeparti": "6a9351c1-778d-4987-82f7-0aa285cfb1be",
        "Liberal Alliance": "e95a0fc5-ef00-4901-88cc-2d946a62287b",
        "Dansk Folkeparti": "0776c166-d669-4f47-a0eb-8c1918766401",
        "Venstre": "eb104a92-0026-4656-8531-01ab07ca9436",
        "Enhedslisten": "96392588-4a4b-4d20-9615-8be473c1eede"
    }
    party_id = party_map[party_letter.strip()]

    print(party_id)

    # Find phone number
    phone_number = ""
    paragraph = parsed_page.select(".brodtekst table")[0].text.replace("&nbsp;", " ")

    phone_number_pattern = re.compile(r"([0-9]{2}.*?[0-9]{2}.*?[0-9]{2}.*?[0-9]{2})")
    phone_number = re.findall(phone_number_pattern, paragraph)[0].replace(" ", "")

    print(phone_number)

    # Find email
    email_pattern = re.compile(r"(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])")
    email = re.findall(email_pattern, paragraph)[0]
    print(email)

    # Generate name slug
    name_slug = slug.slug(name.replace("æ", "ae").replace("ø", "o").replace("å", "aa"))

    # Get photo
    try:
        photo_path = None
        image_tag = parsed_page.select("div[name=\"imgAlignment\"] a")[0]
        image_url = "https://www.rsyd.dk" + image_tag["href"]

        image_id_pattern = re.compile(r"imgid=([0-9]{1,})")
        image_id = re.search(image_id_pattern, image_url).group(1)

        image_url = "https://www.rsyd.dk/includes/billeder/image.asp?size=orig&id={}&fullsize=orig".format(image_id)

        print(image_url)


        with open("region_syddanmark/{}.jpg".format(name_slug), 'wb') as f:
            resp = requests.get(image_url, verify=False)
            f.write(resp.content)

        photo_path = "/home/simon/nempolitik/.scripts/region_syddanmark/{}.jpg".format(name_slug)
    except (KeyError, IndexError):
        photo_path = "/home/simon/nempolitik/static/images/ina-strojer-schmidt.jpg"

    shutil.copyfile(photo_path, "/home/simon/nempolitik/static/images/{}.jpg".format(name_slug))

    politician_id = uuid.uuid4()

    # Cross-reference from TV2
    tv2_page = requests.get("https://www.tv2fyn.dk/profil/" + name_slug, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36 Edg/83.0.478.58"
    }).text
    parsed_tv2_page = BeautifulSoup(tv2_page, "lxml")


    # Find birthday
    try:
        paragraph = parsed_tv2_page.select(".person-info__data")[0].text


        birthday = ""
        birthday_pattern = re.compile(r"Født ([0-9]{1,2})\. (\w{1,}) ([0-9]{4})")
        results = re.search(birthday_pattern, paragraph)

        if len(re.findall(birthday_pattern, paragraph)) == 0:
            birthday = ""
        else:
            birthday = parse_ft_date(results.group(1), results.group(2), results.group(3))
    except(IndexError):
        birthday = ""


    print(birthday)

    membership_date = ""

    
    # Find experience
    # education = []
    # work = []
    experience = []

    for box in parsed_tv2_page.select(".chronology-box.is-not-mobile"):
        experience_type = None

        title = box.select("h3.chronology-box__title")[0].text.lower()

        if title == "uddannelse":
            experience_type = "education"

        if title == "erhvervserfaring":
            experience_type = "work"


        # Find membership date
        if title == "politiske hverv":
            for e in box.select(".chronology-box__item"):
                position = e.select(".chronology-box__position")[0].text

                if "Regionsrådsmedlem" in position or "Medlem af Regionsrådet" in position or "Regionrådsmedlem" in position:
                    try:
                        text = e.select(".chronology-box__period")[0].text

                        year = text.split(" - ")[0].strip()

                        if year == "2005":
                            year = "2006"

                        if year == "2009":
                            year = "2010"

                        if year == "2013":
                            year = "2014"

                        if year == "2017":
                            year = "2018"



                        membership_date = year + "-01-01"
                    except(IndexError):
                        membership_date = "2018-01-01"




        if experience_type is None:
            continue

        for e in box.select(".chronology-box__item"):
            try:
                title = e.select(".chronology-box__position")[0].text
            except(IndexError):
                continue

            try:
                place = e.select(".chronology-box__place")[0].text
            except(IndexError):
                place = ""
            
            try:
                period = e.select(".chronology-box__period")[0].text.strip().replace(" ", "")

                from_year = period.split("-")[0]
                to = period.split("-")[1]

                if to == "nu":
                    to = ""

                if from_year == "nu":
                    from_year = 2020

            except(IndexError):
                from_year = ""
                to = ""

            experience.append({
                "title": title,
                "place": place,
                "from_year": from_year,
                "to": to,
                "type": experience_type
            })

    print(experience)
    print(membership_date)


    with open("/home/simon/nempolitik/content/politicians/{}.md".format(name_slug), "w+") as file:
        file.write("---\n")
        file.write('id: "{}"\n'.format(politician_id))
        file.write('name: "{}"\n'.format(name))
        file.write('birthday: {}\n'.format(birthday))
        # file.write('birth_place: {}\n'.format(birth_place))
        file.write('party: "{}"\n'.format(party_id))
        file.write('photo_credit: "{}"\n'.format("Billede fra Nyborg Kommune"))
        file.write('photo: /static/images/{}.jpg\n'.format(name_slug))
        file.write('email: "{}"\n'.format(email))
        file.write('phone_number: "{}"\n'.format(phone_number))


        if len(experience) > 0:
            file.write("experience:\n")

            for w in experience:
                file.write("  - place: {}\n".format(w["place"]))
                file.write("    to: \"{}\"\n".format(w["to"]))
                file.write("    from: \"{}\"\n".format(w["from_year"]))
                file.write("    title: {}\n".format(w["title"]))
                file.write("    type: {}\n".format(w["type"]))

        file.write("---")


    with open("/home/simon/nempolitik/content/political_entity_memberships/{}-region-syddanmark.md".format(name_slug), "w+") as file:
        file.write("---\n")
        file.write('id: {}\n'.format(uuid.uuid4()))
        file.write('from: {}\n'.format(membership_date))
        file.write('to:\n')
        file.write('political_entity: c38f015c-ffgg-44rd-54fd-d96f41578453\n')
        file.write('political_entity_membership_type: 7c262952-6406-4dc6-97ed-4e6a475ff178\n'.format(birthday))
        file.write('politician: {}\n'.format(politician_id))
        file.write("---")


    print("Politician saved!")


urls = ['https://www.rsyd.dk/wm506712', 'https://www.rsyd.dk/wm506669', 'https://www.rsyd.dk/wm506697', 'https://www.rsyd.dk/wm506700', 'https://www.rsyd.dk/wm506689', 'https://www.rsyd.dk/wm506671', 'https://www.rsyd.dk/wm521850', 'https://www.rsyd.dk/wm506666', 'https://www.rsyd.dk/wm506688', 'https://www.rsyd.dk/wm506668', 'https://www.rsyd.dk/wm506686', 'https://www.rsyd.dk/wm506683', 'https://www.rsyd.dk/wm506692', 'https://www.rsyd.dk/wm506703', 'https://www.rsyd.dk/wm506709', 'https://www.rsyd.dk/wm506711', 'https://www.rsyd.dk/wm506682', 'https://www.rsyd.dk/wm506714', 'https://www.rsyd.dk/wm506702', 'https://www.rsyd.dk/wm506701', 'https://www.rsyd.dk/wm506699', 'https://www.rsyd.dk/wm506693', 'https://www.rsyd.dk/wm506715', 'https://www.rsyd.dk/wm506664', 'https://www.rsyd.dk/wm506695', 'https://www.rsyd.dk/wm506670', 'https://www.rsyd.dk/wm506691', 'https://www.rsyd.dk/wm506710', 'https://www.rsyd.dk/wm506694', 'https://www.rsyd.dk/wm506704', 'https://www.rsyd.dk/wm506708', 'https://www.rsyd.dk/wm506707', 'https://www.rsyd.dk/wm506713', 'https://www.rsyd.dk/wm506716', 'https://www.rsyd.dk/wm506667', 'https://www.rsyd.dk/wm506685', 'https://www.rsyd.dk/wm506690', 'https://www.rsyd.dk/wm506705', 'https://www.rsyd.dk/wm506706', 'https://www.rsyd.dk/wm506698', 'https://www.rsyd.dk/wm506662']


for url in urls:
    parse_politician(url)