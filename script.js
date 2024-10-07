let allPlaces = []; // Variabel för att lagra alla platser

async function fetchData(keyword) {
    const response = await fetch('places_data.json');  // Hämta JSON-filen
    if (!response.ok) {
        console.error('Något gick fel vid hämtning av data:', response.status);
        return;
    }
    const data = await response.json();  // Konvertera till JSON
    console.log(data); // Logga data för att se vad som hämtas
    allPlaces = data; // Spara all data i en global variabel
    displayResults(data, keyword);  // Visa resultaten
}

function displayResults(data, keyword) {
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const noResultsDiv = document.getElementById('no-results');

    resultsDiv.innerHTML = '';  // Rensa tidigare resultat
    loadingDiv.classList.add('hidden'); // Dölja laddningsindikator
    noResultsDiv.classList.add('hidden'); // Dölja inget resultat meddelande

    // Kontrollera om sökordet finns i data
    if (data[keyword]) {
        data[keyword].forEach(place => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');

            const rating = place.Recensioner && place.Recensioner.length > 0 ? place.Recensioner[0].rating : 'Ingen rating tillgänglig';

            resultItem.innerHTML = `
                <h3>${place.Företag}</h3>
                <p><strong>Adress:</strong> ${place.Adress}</p>
                <p><strong>Hemsida:</strong> <a href="${place.Hemsida}" target="_blank">${place.Hemsida}</a></p>
                <p><strong>Telefon:</strong> ${place.Telefon}</p>
                <p><strong>Google-profil:</strong> <a href="${place['Google-profil']}" target="_blank">Visa</a></p>
                <p><strong>E-post:</strong> ${place['E-post']}</p>
                ${place.Logga ? `<img src="${place.Logga}" alt="Logga" onerror="this.onerror=null; this.src='default_image.jpg';">` : ''}
                <p><strong>Betyg:</strong> ${rating}</p>
                <button class="review-button">Visa recensioner</button>
                <div class="reviews-container hidden"></div>
            `;

            resultsDiv.appendChild(resultItem);

            const reviewButton = resultItem.querySelector('.review-button');
            const reviewsContainer = resultItem.querySelector('.reviews-container');

            reviewButton.addEventListener('click', () => {
                if (reviewsContainer.classList.contains('hidden')) {
                    if (place.Recensioner && place.Recensioner.length > 0) {
                        reviewsContainer.innerHTML = '';
                        place.Recensioner.forEach(review => {
                            const reviewItem = document.createElement('div');
                            reviewItem.classList.add('review');
                            reviewItem.innerHTML = `
                                <p><strong>${review.author_name}</strong> - Betyg: ${review.rating}</p>
                                <p>${review.text}</p>
                            `;
                            reviewsContainer.appendChild(reviewItem);
                        });
                    } else {
                        reviewsContainer.innerHTML = '<p>Inga recensioner tillgängliga.</p>';
                    }
                    reviewsContainer.classList.remove('hidden');
                    reviewButton.textContent = 'Dölj recensioner';
                } else {
                    reviewsContainer.classList.add('hidden');
                    reviewButton.textContent = 'Visa recensioner';
                }
            });
        });
    } else {
        noResultsDiv.innerHTML = '<p>Inga resultat hittades för sökordet: ' + keyword + '</p>';
        noResultsDiv.classList.remove('hidden');
    }
}

document.getElementById('search-button').addEventListener('click', () => {
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();
    document.getElementById('loading').classList.remove('hidden');
    fetchData(keyword);
});

document.getElementById('filter-button').addEventListener('click', () => {
    const ratingFilter = document.getElementById('rating-filter').value;
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();

    let filteredResults = {};
    if (ratingFilter) {
        filteredResults[keyword] = allPlaces[keyword].filter(place => {
            const placeRating = place.Recensioner && place.Recensioner.length > 0 ? place.Recensioner[0].rating : 0;
            return placeRating >= ratingFilter;
        });
    } else {
        filteredResults = allPlaces; // Inga filter, visa alla platser
    }

    displayResults(filteredResults, keyword);
});
