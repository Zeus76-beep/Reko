import requests
import json
import os

# Din API-nyckel
api_key = 'AIzaSyCiIxrDaLIvzhjTUNhDA22xzuX40i-r20E'  # Ersätt med din riktiga API-nyckel

# Google Places API:s URL för närhetssökning och detaljer
endpoint_url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
details_url = 'https://maps.googleapis.com/maps/api/place/details/json'
photo_url = 'https://maps.googleapis.com/maps/api/place/photo'

# Funktion för att spara resultat till en JSON-fil
def save_results_to_json(keyword, results):
    filename = 'places_data.json'
    
    # Om filen inte finns, skapa en tom fil
    if not os.path.exists(filename):
        with open(filename, 'w', encoding='utf-8') as file:  # Ange UTF-8
            json.dump({}, file)
    
    # Ladda nuvarande data från filen
    with open(filename, 'r', encoding='utf-8') as file:  # Ange UTF-8
        data = json.load(file)
    
    # Kontrollera om det redan finns resultat för det här sökordet
    if keyword not in data:
        data[keyword] = []
    
    existing_places = {(place['Företag'], place['Adress']) for place in data[keyword]}

    # Lägg till nya resultat som inte redan finns
    for result in results:
        place_id = (result['Företag'], result['Adress'])
        if place_id not in existing_places:
            data[keyword].append(result)
    
    # Spara tillbaka till filen
    with open(filename, 'w', encoding='utf-8') as file:  # Ange UTF-8
        json.dump(data, file, ensure_ascii=False, indent=4)

# Funktion för att hämta bildlänk
def get_photo_url(photo_reference):
    return f"{photo_url}?maxwidth=400&photoreference={photo_reference}&key={api_key}"

# Prompta användaren för att ange sökordet
keyword = input("Ange sökordet: ")  # Användarens input

# Parametrar för förfrågan
params = {
    'location': '59.3293,18.0686',  # Latitude, Longitude (Stockholm)
    'radius': 50000,  # Radie i meter (50 km)
    'keyword': keyword,  # Sök efter det angivna sökordet
    'key': api_key  # Din API-nyckel
}

# Skicka förfrågan till Google Places API
response = requests.get(endpoint_url, params=params)

# Kontrollera om förfrågan var framgångsrik
if response.status_code == 200:
    data = response.json()  # Få svaret som JSON
    results = []  # Lista för att lagra resultaten
    if 'results' in data and len(data['results']) > 0:
        for place in data['results']:
            name = place['name']
            address = place.get('vicinity', 'Adress ej tillgänglig')
            place_id = place['place_id']  # Hämta place_id för detaljer
            
            # Skicka förfrågan till Places Details API
            details_params = {
                'place_id': place_id,
                'key': api_key
            }
            details_response = requests.get(details_url, params=details_params)
            details_data = details_response.json()

            # Hämta hemsidan, telefonnummer, Google-profil och recensioner
            website = details_data['result'].get('website', 'Ingen hemsida tillgänglig')
            google_link = details_data['result'].get('url', 'Ingen Google-profil tillgänglig')
            phone_number = details_data['result'].get('formatted_phone_number', 'Ingen telefonnummer tillgänglig')
            reviews = details_data['result'].get('reviews', [])
            formatted_reviews = [{'author_name': review['author_name'], 'rating': review['rating'], 'text': review['text']} for review in reviews]
            email = 'Ingen e-post tillgänglig'  # Google Places API tillhandahåller inte e-postadresser
            
            # Hämta foto, om tillgängligt
            photo_url = ''
            if 'photos' in place and len(place['photos']) > 0:
                photo_reference = place['photos'][0]['photo_reference']
                photo_url = get_photo_url(photo_reference)

            # Lägg till informationen i resultatlistan
            results.append({
                'Företag': name,
                'Adress': address,
                'Hemsida': website,
                'Telefon': phone_number,
                'Google-profil': google_link,
                'E-post': email,
                'Logga': photo_url,  # Lägg till bildlänken
                'Recensioner': formatted_reviews  # Lägg till recensionerna
            })
        
        # Spara resultaten till JSON-filen
        save_results_to_json(keyword, results)
    else:
        print("Inga resultat hittades.")
else:
    print(f"Fel: {response.status_code}")
