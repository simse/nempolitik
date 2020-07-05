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


list_of_urls = []

def parse_url(PAGE_URL):
    page = requests.get(PAGE_URL, verify=False).text
    parsed_page = BeautifulSoup(page, "lxml")

    urls = []

    for row in parsed_page.select(".listespot-wrapper tbody tr"):
        try:
            if "Stedfortræder" in row.text:
                print(row.attrs["data-item-url"])

                urls.append(row.attrs["data-item-url"])
        except:
            pass

    return urls


simons_list = [
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party=%7b98022092-77CA-4876-9D96-7885AB5D194B%7d&page=1&sortedBy=&pageSize=200",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={A302A5DD-15DC-4F87-990C-370F00BBE6B3}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={4C964872-B486-4849-9816-442B44DB62F3}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={7EB27CBD-931B-4A12-8211-F3CB166C4702}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={C3ECAE71-1DCC-4B34-9A17-E0A9D4E88C0B}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={CA337D8D-3FC6-44F9-BDC4-BBE0234ED9BE}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={28F24EF3-5FB1-42D4-8797-6E306BF56888}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={31301350-3647-4012-AF1E-59FD6796145E}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={9D36D151-A421-4182-8EF3-FCC2B32E63AD}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={D5BFCECE-6230-405F-B1A8-7F4040D3FFE9}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={1A99756E-6DC4-4F94-941D-8842470CB664}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party=%7b3CFDAB2C-71AF-43D1-A120-0FC5966310B3%7d&page=1&sortedBy=&pageSize=50",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={F5870153-3121-4DD6-B2A7-B7B3FD351CEB}",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party=%7b96E9AE97-217A-4ADC-9A6B-C3B5F8E09B18%7d&page=1&sortedBy=&pageSize=50",
    "https://www.ft.dk/searchResults.aspx?sortedDescending=false&party={1626E331-893B-4130-894A-E0F1726BA5FB}"
]

for url in simons_list:
    list_of_urls = list_of_urls + parse_url(url)

print(list_of_urls)
print(len(list_of_urls))