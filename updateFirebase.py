from bs4 import BeautifulSoup
import requests
import json
import firebase_admin
import time
from firebase_admin import credentials
from firebase_admin import db
from geopy.geocoders import Nominatim
from mapbox import Geocoder # Geolocator has a little problem, when it can't find a certain place it spits out a random street
geocoder = Geocoder(access_token="pk.eyJ1IjoibnVzaGhhY2thdGhvbiIsImEiOiJja2U0aDI3ZncwMTJpMnNwbzV1aHpsZjdrIn0.JFgIR7_NDA7SshV8G-1OVw")
geolocator = Nominatim(user_agent="nush-hackathon")

cred = credentials.Certificate("serviceAccount.json")

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://nush-hackathon.firebaseio.com/'
})

ref = db.reference('nush-hackathon')

while True:
    cty_num = {}
    cty_name = []
    cty_inf = []
    link_ls = []
    link_dt = []

    page = requests.get("https://en.wikipedia.org/wiki/Template:COVID-19_pandemic_data")
    i = 0
    soup = BeautifulSoup(page.content.decode("utf-8"), "html.parser")
    k = soup.find('div', id='covid19-container')
    a = 0
    for wi in k.findAll('th'):
        wi = str(wi)
        if wi.find('src') != -1:
            endpos = wi.find('srcset')
            link = 'https:' + wi[wi.find('src')+5:endpos-2]
            print(link)
            link_ls.append(str(link))
        else:
            try:
                if a < 10:
                    a += 1
                    continue
                sp = BeautifulSoup(wi, features="html.parser")
                sp_da = str(sp.find('a'))

                sp_da = sp_da[9:]
                eg = sp_da.find('"')
                sp_da = sp_da[:eg]
                sp_da = "https://en.wikipedia.org/" + sp_da
                link_dt.append(sp_da)
                sp = sp.a
                sp2 = BeautifulSoup(str(sp), 'html.parser')
                a += 1
                cty = sp2.text
                cty_name.append(str(cty))
            except:
                pass

    c_n = 1
    set_cnt = 0

    for wi in k.findAll('td'):
        i += 1
        if i % 4 == 0:
            i = 0
        else:
            if c_n % 4 == 0:
                c_n = 1
                set_cnt += 1
                # 1 set finished

            sp = BeautifulSoup(str(wi), 'html.parser')
            if sp.text.strip() == 'As of 9 August 2020 (UTC) · History of cases · History of deaths':
                break
            try:
                cty_inf[set_cnt].append(sp.text.strip())
            except IndexError:
                cty_inf.append([])
                cty_inf[set_cnt].append(sp.text.strip())
            c_n += 1

    # Get location data
    page = requests.get("https://www.gov.sg/article/covid-19-public-places-visited-by-cases-in-the-community-during-infectious-period")
    soup = BeautifulSoup(page.content.decode("utf-8"), "html.parser")

    rows = soup.find('table', class_='table').find("tbody").find_all("tr")
    i = 0
    firstTime = True

    # Decompose list and update database
    locationRef = db.reference('locations')
    for row in rows:
        datas = row.find_all("td")
        tmpList = []
        for data in datas:
            if i == 2:
                location = data.get_text()
                if not location.find("\n"): # Shops are on a newline, if any
                    locationAndShopList = location.split("\n")
                    print("Shop name:", locationAndShopList[3])
                    print("Location:", locationAndShopList[1])
                    tmpList.append(locationAndShopList[1])
                    tmpList.append(locationAndShopList[3])
                else:
                    print("Location:", location)
                    tmpList.append(location)
                    tmpList.append("")
            elif i == 1:
                print("Time:", data.get_text())
                tmpList.append(data.get_text())
            else: # i == 0
                print("Date:", data.get_text())
                tmpList.append(data.get_text())
            i += 1

        try:
            rawLocation = tmpList[2].replace('\n', '')
            location = geolocator.geocode(rawLocation)
            tmpList.append(str(location.latitude))
            tmpList.append(str(location.longitude))
        except Exception as e:
            print(e)
            tmpList.append(""); tmpList.append("")
            pass
        print(tmpList)
        for i in range(len(tmpList)):
            tmpList[i] = tmpList[i].replace('\n', '') # Remove all newlines, it messes up Firebase
        if firstTime:
            locationRef.set({ # Set request deletes all keys in node
                tmpList[2]: { # Remove newline from each String
                    0: tmpList[0],
                    1: tmpList[1],
                    2: tmpList[2],
                    3: tmpList[3],
                    4: tmpList[4],
                    5: tmpList[5]
                }
            })
            firstTime = False
        else:
            locationRef.update({
                tmpList[2]: { # Remove newline from each String
                    0: tmpList[0],
                    1: tmpList[1].replace('h', ''), # I don't want the h after the time
                    2: tmpList[2],
                    3: tmpList[3],
                    4: tmpList[4],
                    5: tmpList[5]
                }
            })
        tmpList = []
        i = 0

    coordRef = db.reference('coordinates')
    dict_data = json.loads(str(locationRef.get()).replace("'", '"').replace('\\', ''))
    index = 0
    for key in dict_data:
        try:
            print(key)
            location = geolocator.geocode(key)
            coordRef.update({index: str(location.latitude) + ', ' + str(location.longitude)})
            index += 1
        except:
            pass

    exit(0) # REMOVE TO UPDATE DB!
    # Updating function
    tmp = 0

    for c_nm in cty_name:
        cty_inf[tmp].append(link_ls[tmp+1])
        cty_inf[tmp].append(link_dt[tmp])
        c_nm = c_nm.replace('.', '')
        ref.update({
            c_nm: {
                0: cty_inf[tmp][0],
                1: cty_inf[tmp][1],
                2: cty_inf[tmp][2],
                3: cty_inf[tmp][3],
                4: cty_inf[tmp][4],
            }
        })
        print("Updated", tmp)
        # fb.put('/nush-hackathon/', c_nm, cty_inf[tmp])
        tmp += 1
    exit(0)
