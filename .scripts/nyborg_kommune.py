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

    # Find name
    name = parsed_page.select("article.content h1")[0].text.split(" (")[0].strip()

    print(name)

    print(parsed_page.select("article.content h1")[0])

    # Find party
    party_letter = parsed_page.select("article.content h1")[0].text.split(" (")[1].replace(")", "").strip()
    party_map = {
        "A": "f07a876a-64af-4f30-8056-e28ec39a7ca3",
        "RV": "a58e77a0-5ef8-45c0-a5bd-aa8300a5b1b2",
        "KF": "8899a215-1be5-46f2-bd49-2f239f560371",
        "F": "6a9351c1-778d-4987-82f7-0aa285cfb1be",
        "LA": "e95a0fc5-ef00-4901-88cc-2d946a62287b",
        "O": "0776c166-d669-4f47-a0eb-8c1918766401",
        "V": "eb104a92-0026-4656-8531-01ab07ca9436",
        "EL": "96392588-4a4b-4d20-9615-8be473c1eede",
        "ALT": "a7a7244b-32db-47ab-98f3-603c0f1f399e",
        "IA": "b30c8d1a-c9ba-44d4-939d-9a8705de0adc",
        "JF": "bb61b8fa-285a-49d5-8549-ba5ab70764e8",
        "SP": "d7a96e45-df7f-4f7f-b75e-55646b7d4270",
        "SIU": "f2c6e19f-3dba-4992-a237-1d0e166097db",
        "NB": "e00fec1e-666e-485e-8c76-007aa37ff7a7",
        "UFG": "23a386ad-d061-4ae8-b4b7-c70cf814dcfc"
    }
    party_id = party_map[party_letter.strip()]

    print(party_id)

    # Find phone number
    phone_number = ""
    paragraph = parsed_page.select(".article-body p")[0].text

    phone_number_pattern = re.compile(r"([0-9]{4} [0-9]{4})")
    phone_number = re.findall(phone_number_pattern, paragraph)[0].replace(" ", "")

    print(phone_number)

    # Find email
    email_pattern = re.compile(r"(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])")
    email = re.findall(email_pattern, paragraph)[0]
    print(email)

    # Generate name slug
    name_slug = slug.slug(name.replace("æ", "ae").replace("ø", "o").replace("å", "aa"))

    # Get photo
    photo_path = None
    image_tag = parsed_page.select(".richtextImageRightAligned img")[0]
    image_url = "https://www.nyborg.dk" + image_tag["src"]

    with open("nyborg_kommune/{}.jpg".format(name_slug), 'wb') as f:
        resp = requests.get(image_url, verify=False)
        f.write(resp.content)

    photo_path = "/home/simon/nempolitik/.scripts/nyborg_kommune/{}.jpg".format(name_slug)

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
                if e.select(".chronology-box__position")[0].text == "Byrådsmedlem":
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


    with open("/home/simon/nempolitik/content/political_entity_memberships/{}-nyborg-kommune-byraad.md".format(name_slug), "w+") as file:
        file.write("---\n")
        file.write('id: {}\n'.format(uuid.uuid4()))
        file.write('from: {}\n'.format(membership_date))
        file.write('to:\n')
        file.write('political_entity: c38f015c-5e66-4b3c-8433-d96f41564921\n')
        file.write('political_entity_membership_type: 0b2dcb5c-9a76-4320-b454-2ed438135b19\n'.format(birthday))
        file.write('politician: {}\n'.format(politician_id))
        file.write("---")


    print("Politician saved!")


urls = ['https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Kenneth-Muhs', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Vibeke-Ejlertsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Erik-Rosengaard', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Sonja-Marie-Jensen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jorn-Terndrup', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Tilde-Nielsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Per-Jespersen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Peter-Wagner-Mollerup', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Martin-Stenmann', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Carsten-Kudsk', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jan-Reimer-Christiansen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/RameeshT', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Soeren-Svendsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Albert-Pedersen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Anja-Kongsdal', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Suzette-Frovin', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Kaj-Refslund', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jacob-Nilsson', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jesper-Nielsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Anne-Dyrhoj', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Frits-Christensen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Anne-marie-palm-johansen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jorgen-Jorgensen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Poul-Erik-Knudsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Martin-Huus', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Kenneth-Muhs', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Vibeke-Ejlertsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Erik-Rosengaard', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Sonja-Marie-Jensen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jorn-Terndrup', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Tilde-Nielsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Per-Jespersen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Peter-Wagner-Mollerup', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Martin-Stenmann', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Carsten-Kudsk', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jan-Reimer-Christiansen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/RameeshT', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Soeren-Svendsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Albert-Pedersen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Anja-Kongsdal', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Suzette-Frovin', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Kaj-Refslund', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jacob-Nilsson', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jesper-Nielsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Anne-Dyrhoj', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Frits-Christensen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Anne-marie-palm-johansen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Jorgen-Jorgensen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Poul-Erik-Knudsen', 'https://www.nyborg.dk/da/Politik/ByraadUdvalg/Byr%c3%a5d/MedlemmerByraadet/Martin-Huus']


for url in urls:
    parse_politician(url)