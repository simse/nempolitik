import re
import zipfile
import urllib3

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

    return f"{year_number}/{month_number:02}/{day_number:02}"


def process_name(string):
    string = string.strip()
    string = string.replace("  ", " ")
    string = string[:1].upper() + string[1:]

    return string



def parse_politician(POLITICIAN_URL):
    page = requests.get(POLITICIAN_URL, verify=False).text
    parsed_page = BeautifulSoup(page, "lxml")

    # Find name
    name = parsed_page.select("h1.biography-page-title")[0].text.split(" (")[0]

    first_name = ""
    middle_name = ""
    last_name = ""

    name_parts = name.split(" ")
    if len(name_parts) == 2:
        first_name = name_parts[0]
        last_name = name_parts[1]

    if len(name_parts) > 2:
        first_name = name_parts[0]
        last_name = name_parts[-1]

        del name_parts[0]
        del name_parts[-1]

        middle_name = " ".join(name_parts)

    print(first_name)
    print(middle_name)
    print(last_name)


    # Find party
    party_letter = parsed_page.select("h1.biography-page-title")[0].text.split(" (")[1].replace(")", "")
    party_map = {
        "S": 1,
        "RV": 4,
        "KF": 5,
        "SF": 7,
        "LA": 8,
        "DF": 3,
        "V": 2,
        "EL": 9,
        "ALT": 10,
        "IA": 11,
        "JF": 12,
        "SP": 13,
        "SIU": 14,
        "NB": 6,
        "UFG": 15
    }
    party_id = party_map[party_letter.strip()]

    print(party_id)

    # Find phone number
    phone_number = ""

    try:
        phone_number = parsed_page.select("a.ftMember__phone-value")[0].text.replace(" ", "")
    except(IndexError):
        pass
    print(phone_number)

    # Find email
    email = parsed_page.select("a.ftMember__infolinks-value")[0].text
    print(email)

    # Generate name slug
    name_slug = slug.slug(name.replace("æ", "ae").replace("ø", "o").replace("å", "aa"))

    photo_path = None

    try:
        # Find picture
        photo_archive_url = parsed_page.select("a.download__container__docBtns__btn")[0]["href"]

        # Download picture
        with open("folketinget/{}.zip".format(name_slug), 'wb') as f:
            resp = requests.get(photo_archive_url, verify=False)
            f.write(resp.content)

        photo_path = "folketinget/"

        # Extract zip file
        with zipfile.ZipFile("folketinget/{}.zip".format(name_slug)) as zip_ref:
            zip_ref.extractall("folketinget")

            photo_path += zip_ref.namelist()[0]
    except:
        pass


    # Get birthday
    #birthday = input("Fødselsdag: ")
    paragraph = parsed_page.select("#ftMember__accordion__container__tab1")[0].text

    birthday_pattern = re.compile(r"født ([0-9]{1,2})\. (\w{1,}) ([0-9]{4}) i ([a-zA-Z æøåÆØÅ]{1,})")
    results = re.search(birthday_pattern, paragraph)

    birth_place = ""
    birthday = ""

    if len(re.findall(birthday_pattern, paragraph)) == 0:
        birthday_pattern = re.compile(r"født ([0-9]{1,2})\. (\w{1,}) ([0-9]{4})")
        results = re.search(birthday_pattern, paragraph)

        if len(re.findall(birthday_pattern, paragraph)) == 0:
            birthday = ""
        else:
            birthday = parse_ft_date(results.group(1), results.group(2), results.group(3))

    else:
        birth_place = results.group(4)
        birthday = parse_ft_date(results.group(1), results.group(2), results.group(3))
    print(birth_place)


    
    print(birthday)

    # Find membership
    paragraph = paragraph = parsed_page.select("#ftMember__accordion__container__tab1 aside")[0].text
    membership_pattern = re.compile(r"([0-9]{1,2})\. (\w{1,}) ([0-9]{4})")
    results = re.search(membership_pattern, paragraph)
    membership_date = parse_ft_date(results.group(1), results.group(2), results.group(3))

    print(membership_date)


    # Find education
    education = []
    relevant_element = None
    for section in parsed_page.select("#ftMember__accordion__container__tab1 section"):
        if "Uddannelse" in section.text:
            relevant_element = section
            break

    if relevant_element is not None:
        for string in relevant_element.stripped_strings:
            parts = string.split(",")

            if len(parts) == 1:
                continue

            education_degree = parts[0]

            range_pattern = re.compile(r"([0-9]{4})-([0-9]{4})")
            results = re.search(range_pattern, parts[-1])

            education_to = ""

            if len(re.findall(range_pattern, parts[-1])) == 0:
                range_pattern = re.compile(r"([0-9]{4})")

                if len(re.findall(range_pattern, parts[-1])) == 0:
                    continue 

                results = re.search(range_pattern, parts[-1])
                education_from = results.group(1)

            else:
                education_from = results.group(1)
                education_to = results.group(2)

            del parts[0]
            del parts[-1]

            education_institution = "".join(parts)

            education.append({
                "title": process_name(education_degree),
                "from_year": education_from,
                "to": education_to,
                "place": process_name(education_institution)
            })

    print(education)


    # Find CV
    work = []
    relevant_element = None
    for section in parsed_page.select("#ftMember__accordion__container__tab1 section"):
        try:
            if "Beskæftigelse" in section.find_all("strong")[0].text:
                relevant_element = section
                break
        except (IndexError):
            pass


    if relevant_element is not None:
        for string in relevant_element.stripped_strings:
            parts = string.split(",")

            if len(parts) == 1:
                continue

            education_degree = parts[0]

            range_pattern = re.compile(r"([0-9]{4})-([0-9]{4})")
            results = re.search(range_pattern, parts[-1])

            education_to = ""

            if len(re.findall(range_pattern, parts[-1])) == 0:
                range_pattern = re.compile(r"([0-9]{4})")

                if len(re.findall(range_pattern, parts[-1])) == 0:
                    continue 

                results = re.search(range_pattern, parts[-1])
                education_from = results.group(1)

            else:
                education_from = results.group(1)
                education_to = results.group(2)

            del parts[0]
            del parts[-1]

            education_institution = ", ".join(parts)

            work.append({
                "title": process_name(education_degree),
                "from_year": education_from,
                "to": education_to,
                "place": process_name(education_institution)
            })

    print(work)


    # Add to Strapi
    myFile = {}

    if photo_path is None:
        myFile = {}
    else:
        myFile = {'files.photo':("{}.jpg".format(name_slug), open(photo_path, 'rb'), 'image/jpeg')}

    prefers_middle_name_shown = (middle_name != "")

    # Create entry
    response = requests.post("https://editor.nempolitik.dk/politicians", data={"data":json.dumps({
        "first_name": first_name,
        "middle_name": middle_name,
        "last_name": last_name,
        "slug": name_slug,
        "phone_number": phone_number,
        "email": email,
        "political_party": party_id,
        "prefers_middle_name_shown": prefers_middle_name_shown,
        "photo_credit": "Fotograf: Steen Brogaard, Ophavsret: Folketinget",
        "birthday": birthday,
        "birth_place": birth_place
    })}, files=myFile).json()

    print(response)


    # Register parliament membership
    requests.post("https://editor.nempolitik.dk/political-memberships", {
        "from": membership_date,
        "political_entity": 1,
        "politician": response["id"],
        "political_membership_type": 1
    })


    # Register education
    for e in education:
        requests.post("https://editor.nempolitik.dk/educations", {
            "from": e["from_year"],
            "to": e["to"],
            "type": "education",
            "politician": response["id"],
            "place": e["place"],
            "title": e["title"]
        })


    for w in work:
        requests.post("https://editor.nempolitik.dk/educations", {
            "from": w["from_year"],
            "to": w["to"],
            "type": "work",
            "politician": response["id"],
            "place": w["place"],
            "title": w["title"]
        })

    print("Politician saved!")


urls = ['https://www.ft.dk/medlemmer/mf/e/eva-flyvholm', 'https://www.ft.dk/medlemmer/mf/j/jette-gottlieb', 'https://www.ft.dk/medlemmer/mf/p/peder-hvelplund', 'https://www.ft.dk/medlemmer/mf/h/henning-hyllested', 'https://www.ft.dk/medlemmer/mf/c/christian-juhl', 'https://www.ft.dk/medlemmer/mf/r/rune-lund', 'https://www.ft.dk/medlemmer/mf/r/rosa-lund', 'https://www.ft.dk/medlemmer/mf/s/soeren-egge-rasmussen', 'https://www.ft.dk/medlemmer/mf/p/pernille-skipper', 'https://www.ft.dk/medlemmer/mf/j/jakob-soelvhoej', 'https://www.ft.dk/medlemmer/mf/s/soeren-soendergaard', 'https://www.ft.dk/medlemmer/mf/v/victoria-velasquez', 'https://www.ft.dk/medlemmer/mf/m/mai-villadsen', 'https://www.ft.dk/medlemmer/mf/t/torsten-gejl', 'https://www.ft.dk/medlemmer/mf/k/karina-adsboel', 'https://www.ft.dk/medlemmer/mf/a/alex-ahrendtsen', 'https://www.ft.dk/medlemmer/mf/l/lise-bech', 'https://www.ft.dk/medlemmer/mf/l/liselott-blixt', 'https://www.ft.dk/medlemmer/mf/b/bent-boegsted', 'https://www.ft.dk/medlemmer/mf/r/rene-christensen', 'https://www.ft.dk/medlemmer/mf/j/jens-henrik-thulesen-dahl', 'https://www.ft.dk/medlemmer/mf/k/kristian-thulesen-dahl', 'https://www.ft.dk/medlemmer/mf/m/mette-hjermind-dencker', 'https://www.ft.dk/medlemmer/mf/s/soeren-espersen', 'https://www.ft.dk/medlemmer/mf/d/dennis-flydtkjaer', 'https://www.ft.dk/medlemmer/mf/p/pia-kjaersgaard', 'https://www.ft.dk/medlemmer/mf/m/marie-krarup', 'https://www.ft.dk/medlemmer/mf/m/morten-messerschmidt', 'https://www.ft.dk/medlemmer/mf/h/hans-kristian-skibby', 'https://www.ft.dk/medlemmer/mf/p/peter-skaarup', 'https://www.ft.dk/medlemmer/mf/m/mette-abildgaard', 'https://www.ft.dk/medlemmer/mf/k/katarina-ammitzboell', 'https://www.ft.dk/medlemmer/mf/b/birgitte-bergman', 'https://www.ft.dk/medlemmer/mf/n/niels-flemming-hansen', 'https://www.ft.dk/medlemmer/mf/r/rasmus-jarlov', 'https://www.ft.dk/medlemmer/mf/m/mona-juul', 'https://www.ft.dk/medlemmer/mf/n/naser-khader', 'https://www.ft.dk/medlemmer/mf/b/brigitte-klintskov-jerkel', 'https://www.ft.dk/medlemmer/mf/m/marcus-knuth', 'https://www.ft.dk/medlemmer/mf/p/per-larsen', 'https://www.ft.dk/medlemmer/mf/m/mai-mercado', 'https://www.ft.dk/medlemmer/mf/s/soeren-pape-poulsen', 'https://www.ft.dk/medlemmer/mf/o/orla-oesterby', 'https://www.ft.dk/medlemmer/mf/a/aaja-chemnitz-larsen', 'https://www.ft.dk/medlemmer/mf/s/sjuroeur-skaale', 'https://www.ft.dk/medlemmer/mf/h/henrik-dahl', 'https://www.ft.dk/medlemmer/mf/o/ole-birk-olesen', 'https://www.ft.dk/medlemmer/mf/a/alex-vanopslagh', 'https://www.ft.dk/medlemmer/mf/l/lars-boje-mathiesen', 'https://www.ft.dk/medlemmer/mf/p/peter-seier-christensen', 'https://www.ft.dk/medlemmer/mf/m/mette-thiesen', 'https://www.ft.dk/medlemmer/mf/p/pernille-vermund', 'https://www.ft.dk/medlemmer/mf/i/ida-auken', 'https://www.ft.dk/medlemmer/mf/a/anne-sophie-callesen', 'https://www.ft.dk/medlemmer/mf/k/kristian-hegaard', 'https://www.ft.dk/medlemmer/mf/m/marianne-jelved', 'https://www.ft.dk/medlemmer/mf/m/martin-lidegaard', 'https://www.ft.dk/medlemmer/mf/s/stinus-lindgreen', 'https://www.ft.dk/medlemmer/mf/s/samira-nawa', 'https://www.ft.dk/medlemmer/mf/s/sofie-carsten-nielsen', 'https://www.ft.dk/medlemmer/mf/k/kathrine-olldag', 'https://www.ft.dk/medlemmer/mf/r/rasmus-helveg-petersen', 'https://www.ft.dk/medlemmer/mf/k/katrine-robsoee', 'https://www.ft.dk/medlemmer/mf/l/lotte-rod', 'https://www.ft.dk/medlemmer/mf/j/jens-rohde', 'https://www.ft.dk/medlemmer/mf/z/zenia-stampe', 'https://www.ft.dk/medlemmer/mf/a/andreas-steenberg', 'https://www.ft.dk/medlemmer/mf/m/morten-oestergaard', 'https://www.ft.dk/medlemmer/mf/e/edmund-joensen', 'https://www.ft.dk/medlemmer/mf/a/aki-matilda-hoeegh-dam', 'https://www.ft.dk/medlemmer/mf/t/trine-bramsen', 'https://www.ft.dk/medlemmer/mf/b/bjoern-brandenborg', 'https://www.ft.dk/medlemmer/mf/j/jeppe-bruus', 'https://www.ft.dk/medlemmer/mf/m/morten-boedskov', 'https://www.ft.dk/medlemmer/mf/l/lennart-damsbo-andersen', 'https://www.ft.dk/medlemmer/mf/k/kaare-dybvad-bek', 'https://www.ft.dk/medlemmer/mf/b/benny-engelbrecht', 'https://www.ft.dk/medlemmer/mf/c/camilla-fabricius', 'https://www.ft.dk/medlemmer/mf/m/mette-frederiksen', 'https://www.ft.dk/medlemmer/mf/m/mette-gjerskov', 'https://www.ft.dk/medlemmer/mf/a/ane-halsboe-joergensen', 'https://www.ft.dk/medlemmer/mf/o/orla-hav', 'https://www.ft.dk/medlemmer/mf/m/magnus-heunicke', 'https://www.ft.dk/medlemmer/mf/p/peter-hummelgaard', 'https://www.ft.dk/medlemmer/mf/n/nick-haekkerup', 'https://www.ft.dk/medlemmer/mf/d/daniel-toft-jakobsen', 'https://www.ft.dk/medlemmer/mf/t/thomas-jensen', 'https://www.ft.dk/medlemmer/mf/l/leif-lahn-jensen', 'https://www.ft.dk/medlemmer/mf/m/mogens-jensen', 'https://www.ft.dk/medlemmer/mf/j/jens-joel', 'https://www.ft.dk/medlemmer/mf/j/jan-johansen', 'https://www.ft.dk/medlemmer/mf/d/dan-joergensen', 'https://www.ft.dk/medlemmer/mf/k/kasper-sand-kjaer', 'https://www.ft.dk/medlemmer/mf/s/simon-kollerup', 'https://www.ft.dk/medlemmer/mf/a/astrid-krag', 'https://www.ft.dk/medlemmer/mf/h/henrik-dam-kristensen', 'https://www.ft.dk/medlemmer/mf/a/anders-kronborg', 'https://www.ft.dk/medlemmer/mf/r/rasmus-horn-langhoff', 'https://www.ft.dk/medlemmer/mf/m/malte-larsen', 'https://www.ft.dk/medlemmer/mf/t/tanja-larsson', 'https://www.ft.dk/medlemmer/mf/b/bjarne-laustsen', 'https://www.ft.dk/medlemmer/mf/a/annette-lind', 'https://www.ft.dk/medlemmer/mf/c/christian-rabjerg-madsen', 'https://www.ft.dk/medlemmer/mf/f/flemming-moeller-mortensen', 'https://www.ft.dk/medlemmer/mf/h/henrik-moeller', 'https://www.ft.dk/medlemmer/mf/a/anne-paulin', 'https://www.ft.dk/medlemmer/mf/j/jesper-petersen', 'https://www.ft.dk/medlemmer/mf/r/rasmus-prehn', 'https://www.ft.dk/medlemmer/mf/l/lars-aslan-rasmussen', 'https://www.ft.dk/medlemmer/mf/t/troels-ravn', 'https://www.ft.dk/medlemmer/mf/p/pernille-rosenkrantz-theil', 'https://www.ft.dk/medlemmer/mf/k/kasper-roug', 'https://www.ft.dk/medlemmer/mf/j/julie-skovsby', 'https://www.ft.dk/medlemmer/mf/r/rasmus-stoklund', 'https://www.ft.dk/medlemmer/mf/m/mattias-tesfaye', 'https://www.ft.dk/medlemmer/mf/b/birgitte-vind', 'https://www.ft.dk/medlemmer/mf/n/nicolai-wammen', 'https://www.ft.dk/medlemmer/mf/l/lea-wermelin', 'https://www.ft.dk/medlemmer/mf/k/kirsten-normann-andersen', 'https://www.ft.dk/medlemmer/mf/l/lisbeth-bech-nielsen', 'https://www.ft.dk/medlemmer/mf/a/anne-valentina-berthelsen', 'https://www.ft.dk/medlemmer/mf/a/astrid-caroee', 'https://www.ft.dk/medlemmer/mf/k/karina-lorentzen-dehnhardt', 'https://www.ft.dk/medlemmer/mf/p/pia-olsen-dyhr', 'https://www.ft.dk/medlemmer/mf/k/karsten-hoenge', 'https://www.ft.dk/medlemmer/mf/j/jacob-mark', 'https://www.ft.dk/medlemmer/mf/s/signe-munk', 'https://www.ft.dk/medlemmer/mf/c/charlotte-broman-moelbaek', 'https://www.ft.dk/medlemmer/mf/r/rasmus-nordqvist', 'https://www.ft.dk/medlemmer/mf/h/halime-oguz', 'https://www.ft.dk/medlemmer/mf/i/ina-stroejer-schmidt', 'https://www.ft.dk/medlemmer/mf/t/trine-torp', 'https://www.ft.dk/medlemmer/mf/c/carl-valentin', 'https://www.ft.dk/medlemmer/mf/t/tommy-ahlers', 'https://www.ft.dk/medlemmer/mf/m/marlene-ambo-rasmussen', 'https://www.ft.dk/medlemmer/mf/h/hans-andersen', 'https://www.ft.dk/medlemmer/mf/b/britt-bager', 'https://www.ft.dk/medlemmer/mf/h/heidi-bank', 'https://www.ft.dk/medlemmer/mf/m/marie-bjerre', 'https://www.ft.dk/medlemmer/mf/e/erling-bonnesen', 'https://www.ft.dk/medlemmer/mf/m/morten-dahlin', 'https://www.ft.dk/medlemmer/mf/t/thomas-danielsen', 'https://www.ft.dk/medlemmer/mf/l/louise-schack-elholm', 'https://www.ft.dk/medlemmer/mf/k/karen-ellemann', 'https://www.ft.dk/medlemmer/mf/j/jakob-ellemann-jensen', 'https://www.ft.dk/medlemmer/mf/c/claus-hjort-frederiksen', 'https://www.ft.dk/medlemmer/mf/m/mads-fuglede', 'https://www.ft.dk/medlemmer/mf/m/martin-geertsen', 'https://www.ft.dk/medlemmer/mf/e/eva-kjer-hansen', 'https://www.ft.dk/medlemmer/mf/j/jane-heitmann', 'https://www.ft.dk/medlemmer/mf/p/preben-bang-henriksen', 'https://www.ft.dk/medlemmer/mf/a/anne-honore-oestergaard', 'https://www.ft.dk/medlemmer/mf/b/bertel-haarder', 'https://www.ft.dk/medlemmer/mf/j/jacob-jensen', 'https://www.ft.dk/medlemmer/mf/m/michael-aastrup-jensen', 'https://www.ft.dk/medlemmer/mf/k/kristian-jensen', 'https://www.ft.dk/medlemmer/mf/p/peter-juel-jensen', 'https://www.ft.dk/medlemmer/mf/j/jan-e-joergensen', 'https://www.ft.dk/medlemmer/mf/c/carsten-kissmeyer', 'https://www.ft.dk/medlemmer/mf/s/sten-knuth', 'https://www.ft.dk/medlemmer/mf/k/karsten-lauritzen', 'https://www.ft.dk/medlemmer/mf/l/lars-christian-lilleholt', 'https://www.ft.dk/medlemmer/mf/k/kristian-pihl-lorentzen', 'https://www.ft.dk/medlemmer/mf/s/sophie-loehde', 'https://www.ft.dk/medlemmer/mf/a/anni-matthiesen', 'https://www.ft.dk/medlemmer/mf/c/christoffer-aagaard-melson', 'https://www.ft.dk/medlemmer/mf/e/ellen-trane-noerby', 'https://www.ft.dk/medlemmer/mf/t/torsten-schack-pedersen', 'https://www.ft.dk/medlemmer/mf/t/troels-lund-poulsen', 'https://www.ft.dk/medlemmer/mf/l/lars-loekke-rasmussen', 'https://www.ft.dk/medlemmer/mf/h/hans-christian-schmidt', 'https://www.ft.dk/medlemmer/mf/i/inger-stoejberg', 'https://www.ft.dk/medlemmer/mf/u/ulla-toernaes', 'https://www.ft.dk/medlemmer/mf/k/kim-valentin', 'https://www.ft.dk/medlemmer/mf/f/fatma-oektem', 'https://www.ft.dk/medlemmer/mf/s/simon-emil-ammitzboell-bille', 'https://www.ft.dk/medlemmer/mf/u/uffe-elbaek', 'https://www.ft.dk/medlemmer/mf/s/sikandar-siddique', 'https://www.ft.dk/medlemmer/mf/s/susanne-zimmer', 'https://www.ft.dk/medlemmer/mf/p/pernille-bendixen', 'https://www.ft.dk/medlemmer/mf/h/hanne-bjoern-klausen', 'https://www.ft.dk/medlemmer/mf/r/ruben-kidde', 'https://www.ft.dk/medlemmer/mf/n/nils-sjoeberg', 'https://www.ft.dk/medlemmer/mf/t/theresa-berg-andersen']

for url in urls:
    parse_politician(url)