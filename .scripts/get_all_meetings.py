
import requests
import requests_cache
import urllib3

urllib3.disable_warnings()

requests_cache.install_cache('demo_cache')
from bs4 import BeautifulSoup
import slug

list_of_links = requests.get("https://www.ft.dk/aktuelt/webTV/ajaxaction.aspx?action=vodsearch&from=01-06-2019&to=10-07-2020&selectedMeetingType=Udvalg&committee=&session=20191&meetingnumber=td.1674608&ParliamentaryGroup=tru", verify=False)
parsed = BeautifulSoup(list_of_links.text, "lxml")

urls = []

for link in parsed.find_all("a"):
    if "Udvalg" in link["href"]:
        url = link["href"]

        urls.append(url)

print(urls)